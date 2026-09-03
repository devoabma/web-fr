import { formatDayKey } from '@/utils/day-key'

/**
 * Os quatro recortes que a diretoria usa para perguntar. O `PeriodFilter` compartilhado (hoje /
 * ontem / últimos 7 dias) responde à operação do balcão e não sabe dizer "março de 2025".
 *
 * Os valores são os mesmos que viajam na URL (`?periodo=`), em português: o endereço do relatório é
 * lido e repassado por gente, e traduzir aqui só criaria uma tabela de-para para manter em dia.
 */
export const REPORT_PERIOD_MODES = ['dia', 'mes', 'ano', 'intervalo'] as const

export type ReportPeriodMode = (typeof REPORT_PERIOD_MODES)[number]

/** O recorte com que a tela abre, e para onde cai qualquer `?periodo=` que não esteja na lista. */
export const DEFAULT_REPORT_PERIOD_MODE: ReportPeriodMode = 'mes'

/**
 * Faixa de anos aceita, a mesma do `?ano=` de `/metrics`: não existe liberação antes da
 * informatização, e o ano seguinte entra para quem já está montando o relatório do próximo exercício.
 */
const MIN_YEAR = 2000

const MONTH_NAMES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
]

type ReportPeriodSelection = {
  mode: ReportPeriodMode
  /**
   * O que vai em `?de=`, já no formato do modo: `2025-03-12` no dia, `2025-03` no mês, `2025` no ano
   * e a data inicial no intervalo. É o valor que a tela devolve para a URL e para os campos.
   */
  from: string
  /** O que vai em `?ate=`. Só o intervalo tem duas pontas; nos outros modos ele repete o `from`. */
  to: string
}

export type ResolvedReportPeriod = ReportPeriodSelection & {
  status: 'ok'
  /** Primeira e última chave de dia do recorte, **ambas dentro dele** — o `endDay` é inclusivo. */
  startDay: string
  endDay: string
  /** O período por extenso, para o cabeçalho dos arquivos exportados: "Março de 2025". */
  label: string
}

/**
 * Intervalo com a data final antes da inicial.
 *
 * Ele é um estado à parte, e não um recorte que não pega nada, porque as duas coisas se parecem na
 * tela e significam o contrário uma da outra: um relatório em branco seria lido como "não houve
 * movimento neste período" e viraria documento. Quem consome precisa estreitar o `status` antes de
 * chegar nos limites — é o tipo que obriga a tela a avisar.
 */
export type InvalidReportPeriod = ReportPeriodSelection & { status: 'invalid-range' }

export type ReportPeriod = ResolvedReportPeriod | InvalidReportPeriod

type ReportPeriodParams = {
  /** `?periodo=` */
  mode: string | null
  /** `?de=` */
  from: string | null
  /** `?ate=` */
  to: string | null
}

/**
 * Traduz os parâmetros da URL no recorte do relatório.
 *
 * Nada aqui devolve erro: valor fora de faixa cai no padrão em vez de deixar a tela em branco,
 * mesma regra do `parseYearParam` de `/metrics`. Quem edita o endereço à mão, ou o abre de um link
 * antigo, recebe um relatório — não uma página vazia sem explicação.
 *
 * A única exceção é o intervalo invertido, e ela é deliberada: ali o usuário disse duas datas
 * válidas, e "corrigir" a ordem em silêncio entregaria um período que ele não pediu.
 */
export function resolveReportPeriod({ mode, from, to }: ReportPeriodParams): ReportPeriod {
  // O "hoje" sai do fuso da Seccional, não do relógio do navegador: às 21h de Manaus o padrão de
  // quem consulta de lá seria o mês seguinte na virada, e dois diretores veriam recortes diferentes.
  const today = formatDayKey(Date.now())
  const currentYear = Number(today.slice(0, 4))

  const resolvedMode = REPORT_PERIOD_MODES.find(candidate => candidate === mode) ?? DEFAULT_REPORT_PERIOD_MODE

  if (resolvedMode === 'dia') {
    const day = parseDayKey(from, currentYear) ?? today

    return { mode: 'dia', from: day, to: day, status: 'ok', startDay: day, endDay: day, label: formatFullDay(day) }
  }

  if (resolvedMode === 'ano') {
    const year = parseYearKey(from, currentYear) ?? today.slice(0, 4)

    return {
      mode: 'ano',
      from: year,
      to: year,
      status: 'ok',
      startDay: `${year}-01-01`,
      endDay: `${year}-12-31`,
      label: `Ano de ${year}`,
    }
  }

  if (resolvedMode === 'intervalo') {
    const parsedStart = parseDayKey(from, currentYear)
    const parsedEnd = parseDayKey(to, currentYear)

    // Uma ponta ilegível se apoia na outra antes de cair em "hoje": quem escreveu só `?ate=` disse
    // um dia, e responder com o de hoje trocaria o recorte que ele pediu por outro.
    const startDay = parsedStart ?? parsedEnd ?? today
    const endDay = parsedEnd ?? startDay

    // Só é inversão quando as **duas** datas vieram legíveis do usuário. Se uma delas caiu no padrão
    // por ser inválida ou fora de faixa, a ordem entre elas é obra nossa, e o aviso acusaria de
    // inverter as datas quem não inverteu nada — o resto da tela já trata valor ilegível caindo no
    // padrão, e este é o único ponto em que a URL vira reclamação em vez de relatório.
    if (parsedStart && parsedEnd && endDay < startDay) {
      return { mode: 'intervalo', from: startDay, to: endDay, status: 'invalid-range' }
    }

    return {
      mode: 'intervalo',
      from: startDay,
      to: endDay,
      status: 'ok',
      startDay,
      endDay,
      label: formatRange(startDay, endDay),
    }
  }

  const month = parseMonthKey(from, currentYear) ?? today.slice(0, 7)
  const year = Number(month.slice(0, 4))
  const monthNumber = Number(month.slice(5, 7))
  const lastDay = String(daysInMonth(year, monthNumber)).padStart(2, '0')

  return {
    mode: 'mes',
    from: month,
    to: month,
    status: 'ok',
    startDay: `${month}-01`,
    endDay: `${month}-${lastDay}`,
    label: `${capitalize(MONTH_NAMES[monthNumber - 1])} de ${year}`,
  }
}

/**
 * O teste que decide se uma liberação entra no recorte, montado uma vez e usado linha a linha.
 *
 * Recebe a **data de início** da sessão de propósito: uma liberação que começa às 23h de 31 de março
 * e é encerrada em 1º de abril é movimento de março — foi em março que a sala foi ocupada e a cota,
 * gasta. Cortar pelo fim jogaria a noite da virada para o mês seguinte e faria o total de março
 * mudar conforme a hora em que a última sessão fosse fechada.
 *
 * Só aceita período resolvido: um intervalo invertido não tem limites para comparar, e o tipo impede
 * que ele chegue aqui como se fosse um recorte legítimo e vazio.
 */
export function createReportPeriodMatcher({ startDay, endDay }: ResolvedReportPeriod) {
  return (isoStartDate: string) => {
    const day = formatDayKey(new Date(isoStartDate))

    return day >= startDay && day <= endDay
  }
}

/** `2025` */
function parseYearKey(value: string | null, currentYear: number) {
  if (!value || !/^\d{4}$/.test(value)) return null

  return isPlausibleYear(Number(value), currentYear) ? value : null
}

/** `2025-03` */
function parseMonthKey(value: string | null, currentYear: number) {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) return null

  const year = Number(value.slice(0, 4))
  const month = Number(value.slice(5, 7))

  if (month < 1 || month > 12) return null

  return isPlausibleYear(year, currentYear) ? value : null
}

/**
 * `2025-03-12`, o formato que o `<input type="date">` nativo emite e lê.
 *
 * Valida o dia contra o calendário, e não só contra o intervalo 1–31: `2025-02-31` passaria em
 * qualquer checagem de faixa e viraria 3 de março ao ser interpretado como data.
 */
function parseDayKey(value: string | null, currentYear: number) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null

  const year = Number(value.slice(0, 4))
  const month = Number(value.slice(5, 7))
  const day = Number(value.slice(8, 10))

  if (month < 1 || month > 12) return null
  if (day < 1 || day > daysInMonth(year, month)) return null

  return isPlausibleYear(year, currentYear) ? value : null
}

function isPlausibleYear(year: number, currentYear: number) {
  return year >= MIN_YEAR && year <= currentYear + 1
}

/**
 * O dia 0 do mês seguinte é o último do mês pedido — e a conta é feita em UTC de propósito: ela é
 * de calendário, e usar o fuso do navegador faria o último dia de fevereiro depender de quem lê.
 */
function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

/** `1º de março` — o primeiro dia do mês é ordinal em português, os demais são cardinais. */
function formatDayAndMonth(dayKey: string) {
  const month = Number(dayKey.slice(5, 7))
  const day = Number(dayKey.slice(8, 10))

  return `${day === 1 ? '1º' : day} de ${MONTH_NAMES[month - 1]}`
}

/** `12 de março de 2025` */
function formatFullDay(dayKey: string) {
  return `${formatDayAndMonth(dayKey)} de ${dayKey.slice(0, 4)}`
}

/**
 * `1º de janeiro a 31 de março de 2025`.
 *
 * Dentro do mesmo ano o ano aparece uma vez só, no fim, que é como se lê a frase em voz alta; entre
 * anos diferentes as duas pontas levam o seu, senão "1º de dezembro a 31 de janeiro de 2025" mentiria
 * sobre o começo do período. Um intervalo de um dia só vira a data seca — repetir a mesma data dos
 * dois lados faria o leitor do documento procurar a diferença entre elas.
 */
function formatRange(startDay: string, endDay: string) {
  if (startDay === endDay) return formatFullDay(startDay)

  const startYear = startDay.slice(0, 4)
  const endYear = endDay.slice(0, 4)

  if (startYear === endYear) {
    return `${formatDayAndMonth(startDay)} a ${formatDayAndMonth(endDay)} de ${endYear}`
  }

  return `${formatFullDay(startDay)} a ${formatFullDay(endDay)}`
}
