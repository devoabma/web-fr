import type { ReleaseProps } from '@/server/lawyers/get-all-releases'
import type { RoomProps } from '@/server/rooms/get-all'
import { getInitials } from '@/utils'
import { createReportPeriodMatcher, type ReportPeriod } from './report-period'

/**
 * Teto de sessão plausível, **espelhado** de `MAX_PLAUSIBLE_SESSION_HOURS` em
 * `api-fr/src/http/core/lawyers/get-releases-metrics.ts`.
 *
 * Lá o motivo está escrito assim: o `auto-close-sessions.cron` fecha as sessões expiradas a cada
 * minuto, mas se o serviço fica fora do ar ele as fecha depois, com `endedAt = now` — e essa duração
 * inflada fica gravada para sempre. Uma sessão de trinta horas desloca sozinha a média de um mês.
 *
 * O valor está duplicado porque a api-fr não o expõe em nenhuma resposta; se ele mudar lá, tem de
 * mudar aqui, senão o relatório e `/metrics` passam a divergir em silêncio.
 */
const MAX_PLAUSIBLE_SESSION_HOURS = 24

const MAX_PLAUSIBLE_SESSION_MINUTES = MAX_PLAUSIBLE_SESSION_HOURS * 60

/**
 * Ordenação de nomes em português: sem o collator, `Álvaro` cairia depois de `Zuleica` porque o
 * `sort` padrão compara ponto de código. Numa lista nominal que vai anexada a processo, o leitor
 * procura o nome com o dedo — a ordem tem de ser a do dicionário.
 */
const nameCollator = new Intl.Collator('pt-BR', { sensitivity: 'base' })

/** Uma linha do relatório de advogados por sala — a lista nominal que a diretoria pede. */
export type LawyerReportRow = {
  lawyerId: string
  name: string
  /** Inscrição crua, como veio do banco. Formatar aqui perderia o zero à esquerda na exportação. */
  oab: string
  initials: string
  /** Liberações no recorte, incluindo as que ainda estão abertas. */
  releases: number
  /** Data ISO da primeira e da última liberação **iniciada** no recorte. */
  firstAccess: string
  lastAccess: string
  /** Minutos somados só sobre sessões encerradas e plausíveis. Número, não texto: a planilha soma. */
  minutes: number
  /**
   * Em quantas salas distintas esteve — `null` quando há sala filtrada, porque ali a resposta seria
   * sempre `1` e a coluna viraria enfeite. É o que a spec pede: só sem filtro o número diz algo.
   */
  distinctRooms: number | null
}

/** Uma linha do comparativo entre salas. */
export type RoomMovementRow = {
  roomId: string
  name: string
  /** Sala desativada que teve movimento no recorte: saiu de operação, mas o que aconteceu aconteceu. */
  inactive: boolean
  releases: number
  distinctLawyers: number
  minutes: number
  /** Média por sessão **contada**, não por liberação — ver `buildRoomMovementRows`. */
  averageMinutes: number
  /** Fatia do movimento do período, em porcentagem: a soma das linhas dá 100. */
  share: number
  /** Largura da barra, medida contra a sala líder (mesma ideia do `rank` de `/metrics`). */
  width: number
}

/** Uma linha do ranking de advogados. */
export type LawyerRankingRow = {
  position: number
  lawyerId: string
  name: string
  oab: string
  initials: string
  releases: number
  /** Sempre um número aqui: o ranking existe justamente para revelar quem circula entre salas. */
  distinctRooms: number
  minutes: number
  lastAccess: string
  share: number
  width: number
}

/**
 * O resumo que acompanha cada relatório.
 *
 * Cada seção carrega o **seu**, e não existe um resumo único da tela, porque os recortes são
 * diferentes: "advogados por sala" obedece ao filtro de sala e os outros dois o ignoram. Um resumo
 * só, exibido acima de qualquer tabela, acabaria dizendo "412 liberações" sobre uma tabela que
 * mostra 37 — e o número de cima é o que alguém copia para a ata.
 */
export type ReportSummary = {
  releases: number
  distinctLawyers: number
  /** Salas com movimento no recorte (não o total de salas cadastradas). */
  distinctRooms: number
  /** Soma do tempo das sessões que puderam ser contadas. */
  minutes: number
  /** Sessões encerradas e plausíveis — o denominador honesto da média. */
  countedSessions: number
  averageMinutes: number
  /**
   * Sessões ainda abertas no recorte. Contam como acesso e não somam tempo; o resumo declara
   * quantas eram para o leitor saber por que o total é menor do que pareceria.
   */
  openSessions: number
  /**
   * Sessões encerradas cuja duração não é utilizável: acima do teto de 24 h, com fim anterior ao
   * início, ou com `endDate` ilegível. Contam como acesso e ficam fora do tempo, como a api-fr faz
   * nas métricas.
   */
  implausibleSessions: number
}

export type ReportSection<Row> = {
  rows: Row[]
  summary: ReportSummary
  /**
   * Explicação de por que não há o que mostrar, ou `null` quando há movimento. A tela mostra a frase
   * no lugar da tabela: uma tabela vazia sem explicação é lida como "não houve movimento", e às
   * vezes a causa é o filtro, o intervalo invertido ou a base ainda sem histórico.
   */
  emptyMessage: string | null
  /**
   * `true` quando há sala filtrada e este relatório a ignora de propósito. É o que a tela precisa
   * saber para declarar o comportamento ao leitor, em vez de deixá-lo achar que o filtro falhou.
   */
  ignoresRoomFilter: boolean
}

export type ReportsView = {
  lawyersByRoom: ReportSection<LawyerReportRow>
  roomMovement: ReportSection<RoomMovementRow>
  lawyerRanking: ReportSection<LawyerRankingRow>
}

type BuildReportsViewParams = {
  /** O histórico inteiro, como `getAllReleases()` devolve. O recorte acontece aqui dentro. */
  releases: ReleaseProps[]
  /** As salas de `getAllRooms()` — é delas que sai a sala parada, que o histórico não conhece. */
  rooms: RoomProps[]
  period: ReportPeriod
  /** `null` para "todas as salas". */
  roomId: string | null
}

/**
 * Liberação já normalizada: recortada pelo período, com a duração resolvida uma vez só.
 *
 * O histórico é percorrido **uma vez** e os três relatórios consomem este array. Medido em 28 mil
 * linhas, o passe custa dezenas de milissegundos, quase tudo em formatar a data para comparar; se
 * cada relatório chamasse o `matcher` por conta própria, o custo triplicaria a cada troca de sala,
 * de período ou de relatório — e nenhuma dessas trocas faz nova requisição, então esse passe é
 * exatamente o que o usuário sente ao mexer no filtro.
 */
type CountedRelease = {
  lawyer: ReleaseProps['lawyer']
  roomId: string
  roomName: string
  startDate: string
  startedAt: number
  /** Minutos da sessão, ou `null` quando ela não pode entrar no tempo (aberta ou implausível). */
  minutes: number | null
  isOpen: boolean
}

/**
 * Monta os três relatórios a partir do histórico bruto.
 *
 * **É o ponto único a trocar quando a `api-fr` ganhar recorte de data**: o dia em que a rota aceitar
 * `?de=&ate=`, some daqui o recorte no cliente e o resto — agrupamentos, tempo, ranking — continua
 * valendo sem tocar em nenhum componente. Por isso o módulo não conhece React nem JSX.
 */
export function buildReportsView({ releases, rooms, period, roomId }: BuildReportsViewParams): ReportsView {
  const hasAnyHistory = releases.length > 0
  const roomName = roomId ? (rooms.find(room => room.id === roomId)?.name ?? null) : null

  // Intervalo invertido não é recorte vazio: ele não tem limites para comparar, e o tipo de
  // `ReportPeriod` impede que ele chegue ao matcher. Os três relatórios saem vazios com a mesma
  // explicação, para a tela nunca apresentar zero como se fosse ausência de movimento.
  if (period.status !== 'ok') {
    const emptyMessage = buildReportsEmptyMessage({ period, roomName: null, hasAnyHistory, roomHasAnyHistory: false })

    return {
      lawyersByRoom: emptySection<LawyerReportRow>(emptyMessage, false),
      roomMovement: emptySection<RoomMovementRow>(emptyMessage, Boolean(roomId)),
      lawyerRanking: emptySection<LawyerRankingRow>(emptyMessage, Boolean(roomId)),
    }
  }

  const periodReleases = filterByPeriod(releases, period)

  // O recorte de sala é feito sobre o array já filtrado pelo período — é a única fatia adicional, e
  // ela é barata porque parte do subconjunto, não do histórico inteiro.
  const scopedReleases = roomId ? periodReleases.filter(release => release.roomId === roomId) : periodReleases

  const lawyersInScope = groupByLawyer(scopedReleases)
  const lawyersAcrossRooms = roomId ? groupByLawyer(periodReleases) : lawyersInScope

  // Os dois relatórios transversais leem o mesmo recorte, e sem sala filtrada o nominal lê esse
  // recorte também (`scopedReleases` é o próprio `periodReleases`). Contar três vezes o mesmo array
  // custava ~8% do view-model — e é custo pago a cada troca de filtro, que não faz requisição
  // nenhuma e por isso é sentido inteiro pelo usuário.
  const periodSummary = buildSummary(periodReleases)
  const scopedSummary = roomId ? buildSummary(scopedReleases) : periodSummary

  return {
    lawyersByRoom: {
      rows: buildLawyerRows(lawyersInScope, { hasRoomFilter: Boolean(roomId) }),
      summary: scopedSummary,
      emptyMessage: scopedReleases.length
        ? null
        : buildReportsEmptyMessage({
            period,
            roomName,
            hasAnyHistory,
            // Só custa este passe extra quando o recorte já saiu vazio: é ele que separa "esta sala
            // não teve movimento no período" de "esta sala nunca foi usada".
            roomHasAnyHistory: roomId ? releases.some(release => release.room.id === roomId) : hasAnyHistory,
          }),
      ignoresRoomFilter: false,
    },
    roomMovement: {
      rows: buildRoomMovementRows(periodReleases, rooms),
      summary: periodSummary,
      // A mensagem sai sem o nome da sala de propósito: este relatório ignora o filtro, e culpar a
      // sala filtrada por um período sem movimento mandaria o leitor mexer no filtro errado.
      emptyMessage: periodReleases.length ? null : buildReportsEmptyMessage({ period, roomName: null, hasAnyHistory }),
      ignoresRoomFilter: Boolean(roomId),
    },
    lawyerRanking: {
      rows: buildRankingRows(lawyersAcrossRooms),
      summary: periodSummary,
      emptyMessage: periodReleases.length ? null : buildReportsEmptyMessage({ period, roomName: null, hasAnyHistory }),
      ignoresRoomFilter: Boolean(roomId),
    },
  }
}

/**
 * Recorta o histórico pelo período, resolvendo a duração de cada sessão no mesmo passe.
 *
 * A linha com `startDate` ilegível é descartada em silêncio, e essa guarda não é zelo excessivo:
 * `createReportPeriodMatcher` formata a data para comparar chaves de dia, e `new Date('')` estoura
 * `RangeError` no formatador. Sem o `Number.isNaN` aqui, **um** registro defeituoso vindo de
 * `get-all-releases` derrubaria os três relatórios de uma vez, em vez de sumir de uma linha.
 */
function filterByPeriod(releases: ReleaseProps[], period: Extract<ReportPeriod, { status: 'ok' }>): CountedRelease[] {
  const matchesPeriod = createReportPeriodMatcher(period)
  const counted: CountedRelease[] = []

  for (const release of releases) {
    const startedAt = Date.parse(release.startDate)

    if (Number.isNaN(startedAt)) continue
    if (!matchesPeriod(release.startDate)) continue

    counted.push({
      lawyer: release.lawyer,
      roomId: release.room.id,
      roomName: release.room.name,
      startDate: release.startDate,
      startedAt,
      minutes: resolveSessionMinutes(release.endDate, startedAt),
      isOpen: release.endDate === null,
    })
  }

  return counted
}

/**
 * Duração utilizável da sessão, ou `null` quando ela não pode entrar no tempo.
 *
 * As três exclusões espelham o `FILTER` que a api-fr aplica na média (`ended_at IS NOT NULL`,
 * `ended_at > started_at`, `ended_at <= started_at + 24h`):
 *
 * - **aberta**: somar seu tempo congelaria um relógio que ainda corre, e o mesmo relatório gerado
 *   dez minutos depois traria outro número;
 * - **fim antes do início**: registro defeituoso, que subtrairia tempo do total;
 * - **acima do teto**: encerramento tardio depois de queda do serviço.
 *
 * Nos três casos a liberação **continua contando como acesso** — quem sai do tempo é a duração, não
 * o atendimento, que aconteceu.
 *
 * O arredondamento do **tempo somado** acontece aqui, na origem, e em nenhum outro ponto — mas as
 * **médias** continuam arredondando a própria divisão no lugar em que a calculam, e aqueles
 * `Math.round` não podem sair: sem eles, um `1,5` vazaria para uma coluna de minutos e para o
 * `.xlsx`. O banco grava segundos,
 * então toda sessão tem duração fracionária: arredondando linha a linha, a soma das linhas da tabela
 * deixaria de bater com o total do resumo impresso acima dela — soma-de-arredondados não é
 * arredondado-da-soma. Numa folha oficial, duas somas diferentes do mesmo número são lidas como erro
 * de cálculo, e a divergência ainda viajaria para o `.xlsx`, onde a diretoria seleciona a coluna e o
 * Excel mostra o total no rodapé.
 *
 * As duas exclusões continuam sendo decididas sobre o valor **não** arredondado: é o que mantém o
 * teto de 24 h exatamente onde a api-fr o colocou, sem deixar entrar uma sessão de 1440,4 minutos
 * por obra do arredondamento.
 */
function resolveSessionMinutes(endDate: string | null, startedAt: number) {
  if (endDate === null) return null

  const endedAt = Date.parse(endDate)

  if (Number.isNaN(endedAt)) return null

  const minutes = (endedAt - startedAt) / 60_000

  if (minutes <= 0 || minutes > MAX_PLAUSIBLE_SESSION_MINUTES) return null

  return Math.round(minutes)
}

type LawyerAccumulator = {
  lawyer: ReleaseProps['lawyer']
  releases: number
  minutes: number
  firstAccess: string
  firstAccessAt: number
  lastAccess: string
  lastAccessAt: number
  rooms: Set<string>
}

/**
 * Agrupa por advogado uma vez e serve tanto a lista nominal quanto o ranking.
 *
 * O agrupamento é por `lawyer.id`, nunca por nome: homônimo é comum na inscrição, e agrupar pelo
 * nome fundiria duas pessoas numa linha só — o erro exato que a coluna de inscrição existe para
 * evitar no papel.
 */
function groupByLawyer(releases: CountedRelease[]) {
  const byLawyer = new Map<string, LawyerAccumulator>()

  for (const release of releases) {
    const current = byLawyer.get(release.lawyer.id)

    if (!current) {
      byLawyer.set(release.lawyer.id, {
        lawyer: release.lawyer,
        releases: 1,
        minutes: release.minutes ?? 0,
        firstAccess: release.startDate,
        firstAccessAt: release.startedAt,
        lastAccess: release.startDate,
        lastAccessAt: release.startedAt,
        rooms: new Set([release.roomId]),
      })

      continue
    }

    current.releases += 1
    current.minutes += release.minutes ?? 0
    current.rooms.add(release.roomId)

    // O histórico chega da mais nova para a mais antiga, mas a comparação não confia nessa ordem:
    // ela é contrato da api-fr, não deste módulo, e uma mudança lá inverteria as duas datas aqui.
    if (release.startedAt < current.firstAccessAt) {
      current.firstAccess = release.startDate
      current.firstAccessAt = release.startedAt
    }

    if (release.startedAt > current.lastAccessAt) {
      current.lastAccess = release.startDate
      current.lastAccessAt = release.startedAt
    }
  }

  return [...byLawyer.values()]
}

/**
 * A lista nominal, em ordem alfabética.
 *
 * Ordenar por acessos aqui deixaria este relatório idêntico ao ranking, e o que se faz com esta
 * folha é outra coisa: procurar um nome. A leitura por recorrência é o terceiro relatório.
 */
function buildLawyerRows(lawyers: LawyerAccumulator[], { hasRoomFilter }: { hasRoomFilter: boolean }): LawyerReportRow[] {
  return lawyers
    .map(({ lawyer, releases, minutes, firstAccess, lastAccess, rooms }) => ({
      lawyerId: lawyer.id,
      name: lawyer.name,
      oab: lawyer.oab,
      initials: getInitials(lawyer.name),
      releases,
      firstAccess,
      lastAccess,
      minutes: Math.round(minutes),
      distinctRooms: hasRoomFilter ? null : rooms.size,
    }))
    .sort((a, b) => nameCollator.compare(a.name, b.name) || a.oab.localeCompare(b.oab))
}

/**
 * O ranking por recorrência, sempre sobre **todas** as salas.
 *
 * Ele recebe as liberações do período inteiro mesmo com sala filtrada, e isso é o oposto de um
 * descuido: filtrado, ele viraria a versão ordenada do primeiro relatório e esconderia justamente o
 * advogado que circula entre salas para esticar a cota diária. A tela declara isso ao leitor pelo
 * `ignoresRoomFilter`.
 */
function buildRankingRows(lawyers: LawyerAccumulator[]): LawyerRankingRow[] {
  const ranked = lawyers
    .map(({ lawyer, releases, minutes, lastAccess, rooms }) => ({
      lawyerId: lawyer.id,
      name: lawyer.name,
      oab: lawyer.oab,
      initials: getInitials(lawyer.name),
      releases,
      distinctRooms: rooms.size,
      minutes: Math.round(minutes),
      lastAccess,
    }))
    // Empate em acessos é comum no topo de um mês curto; o desempate vai para quem consumiu mais
    // tempo e, persistindo, para a ordem alfabética — assim a mesma consulta devolve sempre a mesma
    // folha, em vez de uma ordem que muda conforme a api-fr devolveu o histórico.
    //
    // A inscrição fecha a lista pelo mesmo motivo do relatório nominal: o collator compara por
    // `base`, então dois homônimos empatados dariam zero na última comparação e cairiam na ordem de
    // inserção do `Map` — que é justamente a ordem da api-fr que esta linha existe para não herdar.
    .sort(
      (a, b) =>
        b.releases - a.releases || b.minutes - a.minutes || nameCollator.compare(a.name, b.name) || a.oab.localeCompare(b.oab)
    )

  const total = ranked.reduce((sum, lawyer) => sum + lawyer.releases, 0)
  const leader = ranked[0]?.releases ?? 0

  return ranked.map((lawyer, index) => ({
    ...lawyer,
    position: index + 1,
    ...buildShare(lawyer.releases, total, leader),
  }))
}

type RoomAccumulator = {
  releases: number
  minutes: number
  countedSessions: number
  lawyers: Set<string>
}

/**
 * O comparativo entre salas, montado a partir de `getAllRooms` e **não** do histórico.
 *
 * É a diferença que faz a sala parada existir na folha: agrupando o histórico, a sala com zero
 * liberações no mês simplesmente não teria linha — e é ela que o gestor precisa ver no comparativo.
 *
 * Este relatório também ignora o filtro de sala, pelo mesmo motivo do `byRoom` de `/metrics`: com
 * uma sala filtrada sobraria uma linha com 100% da fatia, o que não é comparativo nenhum.
 */
function buildRoomMovementRows(releases: CountedRelease[], rooms: RoomProps[]): RoomMovementRow[] {
  const movementByRoom = new Map<string, RoomAccumulator>()

  for (const release of releases) {
    const current = movementByRoom.get(release.roomId)

    if (!current) {
      movementByRoom.set(release.roomId, {
        releases: 1,
        minutes: release.minutes ?? 0,
        countedSessions: release.minutes === null ? 0 : 1,
        lawyers: new Set([release.lawyer.id]),
      })

      continue
    }

    current.releases += 1
    current.minutes += release.minutes ?? 0
    current.countedSessions += release.minutes === null ? 0 : 1
    current.lawyers.add(release.lawyer.id)
  }

  const rows: RoomMovementRow[] = []
  const knownRoomIds = new Set(rooms.map(room => room.id))

  for (const room of rooms) {
    const movement = movementByRoom.get(room.id)

    // Sala desativada e sem movimento no recorte sai da folha: ela não é "sala parada que precisa
    // ser cobrada", é sala que não existe mais na operação. Com movimento, fica — o que aconteceu
    // nela continua tendo acontecido, e é isso que o `inactive` avisa ao leitor.
    if (!movement && room.inactive) continue

    rows.push(buildRoomMovementRow(room.id, room.name, Boolean(room.inactive), movement))
  }

  for (const [roomId, movement] of movementByRoom) {
    if (knownRoomIds.has(roomId)) continue

    // Sala que aparece no histórico e não está mais no catálogo. Sem esta linha, a soma das salas
    // ficaria menor que o total de liberações do resumo — num documento oficial, a diferença entre
    // duas somas na mesma folha é lida como erro de cálculo. O nome vem da própria liberação.
    rows.push(buildRoomMovementRow(roomId, nameFromHistory(releases, roomId), true, movement))
  }

  const total = rows.reduce((sum, row) => sum + row.releases, 0)
  const leader = rows.reduce((max, row) => Math.max(max, row.releases), 0)

  return (
    rows
      .map(row => ({ ...row, ...buildShare(row.releases, total, leader) }))
      // Sala parada vai para o fim da folha por consequência da ordem por movimento, não por regra:
      // o comparativo se lê de cima para baixo, do que mais ocupou para o que não ocupou nada.
      .sort((a, b) => b.releases - a.releases || nameCollator.compare(a.name, b.name))
  )
}

function buildRoomMovementRow(roomId: string, name: string, inactive: boolean, movement?: RoomAccumulator): RoomMovementRow {
  const minutes = movement ? Math.round(movement.minutes) : 0

  return {
    roomId,
    name,
    inactive,
    releases: movement?.releases ?? 0,
    distinctLawyers: movement?.lawyers.size ?? 0,
    minutes,
    // A média divide pelas sessões **contadas**, não pelas liberações: incluir no denominador as
    // abertas e as implausíveis, que somaram zero minuto, puxaria a média da sala para baixo e faria
    // a sala com muita sessão em andamento parecer a mais rápida do prédio.
    averageMinutes: movement?.countedSessions ? Math.round(movement.minutes / movement.countedSessions) : 0,
    share: 0,
    width: 0,
  }
}

function nameFromHistory(releases: CountedRelease[], roomId: string) {
  return releases.find(release => release.roomId === roomId)?.roomName ?? roomId
}

/**
 * Fatia e largura da barra, a mesma ideia do `rank` de `/metrics`: a porcentagem é medida contra o
 * total (é ela que responde "quanto do movimento passou por aqui" e precisa somar 100), e a barra
 * contra o líder, senão um comparativo equilibrado viraria uma coluna de tracinhos idênticos.
 */
function buildShare(value: number, total: number, leader: number) {
  return {
    share: total > 0 ? (value / total) * 100 : 0,
    width: leader > 0 ? (value / leader) * 100 : 0,
  }
}

/** O resumo do recorte, contado sobre exatamente as liberações que a seção apresenta. */
function buildSummary(releases: CountedRelease[]): ReportSummary {
  const lawyers = new Set<string>()
  const rooms = new Set<string>()

  let minutes = 0
  let countedSessions = 0
  let openSessions = 0
  let implausibleSessions = 0

  for (const release of releases) {
    lawyers.add(release.lawyer.id)
    rooms.add(release.roomId)

    if (release.minutes !== null) {
      minutes += release.minutes
      countedSessions += 1

      continue
    }

    if (release.isOpen) openSessions += 1
    else implausibleSessions += 1
  }

  return {
    releases: releases.length,
    distinctLawyers: lawyers.size,
    distinctRooms: rooms.size,
    minutes: Math.round(minutes),
    countedSessions,
    averageMinutes: countedSessions > 0 ? Math.round(minutes / countedSessions) : 0,
    openSessions,
    implausibleSessions,
  }
}

function emptySection<Row>(emptyMessage: string, ignoresRoomFilter: boolean): ReportSection<Row> {
  return {
    rows: [],
    summary: {
      releases: 0,
      distinctLawyers: 0,
      distinctRooms: 0,
      minutes: 0,
      countedSessions: 0,
      averageMinutes: 0,
      openSessions: 0,
      implausibleSessions: 0,
    },
    emptyMessage,
    ignoresRoomFilter,
  }
}

/**
 * Mensagem de vazio explicada pela causa, como o `buildEmptyMessage` de `/metrics`.
 *
 * Dizer só "sem dados" deixa o administrador sem saber se ele filtrou demais, se o intervalo está
 * invertido, se a sala é nova ou se a base ainda está zerada — e as quatro causas se parecem na
 * tela enquanto significam coisas diferentes. Num relatório o custo do silêncio é maior que num
 * painel: a folha em branco vira "não houve movimento" na ata da reunião.
 *
 * Passe `roomName: null` nos relatórios que ignoram o filtro de sala: culpar uma sala filtrada por
 * um período sem movimento mandaria o leitor mexer no filtro que aquele relatório nem consulta.
 */
export function buildReportsEmptyMessage({
  period,
  roomName,
  hasAnyHistory,
  roomHasAnyHistory = true,
}: {
  period: ReportPeriod
  roomName: string | null
  hasAnyHistory: boolean
  /** Se a sala filtrada já teve alguma liberação **em qualquer período**. */
  roomHasAnyHistory?: boolean
}) {
  if (period.status === 'invalid-range') {
    return 'O intervalo termina antes de começar. Ajuste as datas para gerar o relatório.'
  }

  if (!hasAnyHistory) {
    return 'Nenhuma liberação registrada até agora. Os relatórios aparecem assim que a primeira sala for usada.'
  }

  // O filtro de sala vem antes das outras causas de propósito, como em `/metrics`: uma sala nunca
  // usada chega aqui com a base cheia, e a mensagem geral afirmaria que o painel inteiro está
  // zerado por causa de um filtro que o leitor pode desfazer num clique.
  if (roomName) {
    return roomHasAnyHistory
      ? `${roomName} não teve liberações no período selecionado (${period.label}). Escolha outro período ou volte para "Todas as salas".`
      : `${roomName} nunca registrou liberações. Escolha outra sala ou volte para "Todas as salas".`
  }

  return `Nenhuma liberação no período selecionado (${period.label}). Escolha outro recorte para ver o movimento.`
}
