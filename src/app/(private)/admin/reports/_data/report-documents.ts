import type { ExportDocument } from '@/lib/export'
import { formatDuration } from '@/utils'
import type { ResolvedReportPeriod } from './report-period'
import type { LawyerRankingRow, LawyerReportRow, ReportSection, ReportSummary, RoomMovementRow } from './reports-view'

/** Os três relatórios, na ordem em que aparecem no seletor. O valor é o que viaja em `?relatorio=`. */
export const REPORT_KINDS = ['advogados-por-sala', 'movimento-por-sala', 'ranking-de-advogados'] as const

export type ReportKind = (typeof REPORT_KINDS)[number]

export const DEFAULT_REPORT_KIND: ReportKind = 'advogados-por-sala'

export const REPORT_TITLES: Record<ReportKind, string> = {
  'advogados-por-sala': 'Advogados por sala',
  'movimento-por-sala': 'Movimento por sala',
  'ranking-de-advogados': 'Ranking de advogados',
}

const numberFormatter = new Intl.NumberFormat('pt-BR')

function formatCount(value: number) {
  return numberFormatter.format(value)
}

/** Duração em texto para o bloco de resumo. `formatDuration` devolve `null` no zero — ali "0min" é leitura. */
function formatTotalTime(minutes: number) {
  return formatDuration(minutes) ?? '0min'
}

/**
 * O resumo impresso acima da tabela.
 *
 * As sessões abertas e as implausíveis só aparecem quando existem: uma linha "0 sessões em
 * andamento" em toda folha treinaria o leitor a ignorar o bloco justamente quando ele importa.
 */
function buildSummaryEntries(summary: ReportSummary) {
  const entries = [
    { label: 'Liberações', value: formatCount(summary.releases) },
    { label: 'Advogados atendidos', value: formatCount(summary.distinctLawyers) },
    { label: 'Salas com movimento', value: formatCount(summary.distinctRooms) },
    { label: 'Tempo total', value: formatTotalTime(summary.minutes) },
    { label: 'Tempo médio por sessão', value: formatTotalTime(summary.averageMinutes) },
  ]

  if (summary.openSessions > 0) {
    entries.push({ label: 'Sessões em andamento', value: formatCount(summary.openSessions) })
  }

  if (summary.implausibleSessions > 0) {
    entries.push({ label: 'Sessões sem tempo utilizável', value: formatCount(summary.implausibleSessions) })
  }

  return entries
}

/**
 * O aviso do rodapé, montado a partir do que de fato aconteceu neste recorte.
 *
 * São as duas coisas que, ausentes do papel, fazem o leitor desconfiar do documento: uma folha que
 * lista todas as salas sob um filtro de sala parece defeito, e um tempo total menor que o esperado
 * parece erro de conta quando havia gente na máquina no instante da emissão.
 */
function buildFootnote(section: ReportSection<unknown>, roomLabel: string) {
  const notes: string[] = []

  if (section.ignoresRoomFilter) {
    notes.push(`Este relatório compara todas as salas e não aplica o filtro "${roomLabel}".`)
  }

  if (section.summary.openSessions > 0) {
    notes.push('O tempo é somado apenas sobre sessões encerradas; as que estavam em andamento contam como acesso.')
  }

  return notes.length > 0 ? notes.join(' ') : null
}

/**
 * Sufixo do nome do arquivo.
 *
 * Sai do próprio recorte (`2025-03`, `2025`, `2025-03-12`) porque esses arquivos são reencontrados
 * meses depois numa pasta de downloads, onde o nome é a única pista do que há dentro.
 */
function buildPeriodSlug(period: ResolvedReportPeriod) {
  return period.mode === 'intervalo' ? `${period.from}_a_${period.to}` : period.from
}

type BuildDocumentParams = {
  kind: ReportKind
  period: ResolvedReportPeriod
  roomLabel: string
}

const lawyerColumns: ExportDocument<LawyerReportRow>['columns'] = [
  { header: 'Advogado(a)', kind: 'text', width: 38, value: row => row.name },
  // Texto, e não número: o Excel comeria o zero à esquerda de "00123" e a inscrição deixaria de ser a
  // do advogado. É a coluna que identifica a pessoa quando há homônimos na folha.
  { header: 'Inscrição OAB', kind: 'text', width: 16, value: row => row.oab },
  { header: 'Acessos', kind: 'number', width: 11, value: row => row.releases },
  { header: 'Primeiro acesso', kind: 'date', width: 20, value: row => row.firstAccess },
  { header: 'Último acesso', kind: 'date', width: 20, value: row => row.lastAccess },
  { header: 'Tempo (min)', kind: 'number', width: 14, value: row => row.minutes },
  { header: 'Salas', kind: 'number', width: 10, value: row => row.distinctRooms },
]

const roomColumns: ExportDocument<RoomMovementRow>['columns'] = [
  { header: 'Sala', kind: 'text', width: 34, value: row => (row.inactive ? `${row.name} (inativa)` : row.name) },
  { header: 'Liberações', kind: 'number', width: 13, value: row => row.releases },
  { header: 'Advogados', kind: 'number', width: 13, value: row => row.distinctLawyers },
  { header: 'Tempo (min)', kind: 'number', width: 14, value: row => row.minutes },
  { header: 'Média (min)', kind: 'number', width: 14, value: row => row.averageMinutes },
  { header: 'Fatia', kind: 'percent', width: 11, value: row => row.share },
]

const rankingColumns: ExportDocument<LawyerRankingRow>['columns'] = [
  { header: '#', kind: 'number', width: 7, value: row => row.position },
  { header: 'Advogado(a)', kind: 'text', width: 38, value: row => row.name },
  { header: 'Inscrição OAB', kind: 'text', width: 16, value: row => row.oab },
  { header: 'Acessos', kind: 'number', width: 11, value: row => row.releases },
  { header: 'Salas', kind: 'number', width: 10, value: row => row.distinctRooms },
  { header: 'Tempo (min)', kind: 'number', width: 14, value: row => row.minutes },
  { header: 'Último acesso', kind: 'date', width: 20, value: row => row.lastAccess },
  { header: 'Fatia', kind: 'percent', width: 11, value: row => row.share },
]

/**
 * Monta o documento exportável do relatório ativo.
 *
 * As colunas são as mesmas do `.xlsx` e do PDF de propósito — é o modelo comum que impede a planilha
 * e o papel do mesmo relatório de divergirem com o tempo.
 */
export function buildReportDocument<Row>(
  section: ReportSection<Row>,
  { kind, period, roomLabel }: BuildDocumentParams
): ExportDocument<Row> {
  const columnsByKind = {
    'advogados-por-sala': lawyerColumns,
    'movimento-por-sala': roomColumns,
    'ranking-de-advogados': rankingColumns,
  }

  return {
    title: REPORT_TITLES[kind],
    periodLabel: period.label,
    roomLabel,
    issuedAt: new Date(),
    summary: buildSummaryEntries(section.summary),
    columns: columnsByKind[kind] as ExportDocument<Row>['columns'],
    rows: section.rows,
    fileBaseName: `${kind}-${buildPeriodSlug(period)}`,
    footnote: buildFootnote(section, roomLabel),
  }
}
