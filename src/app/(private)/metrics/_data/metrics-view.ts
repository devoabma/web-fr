import type { MetricsByLawyerProps, MetricsByMonthProps, MetricsByRoomProps } from '@/server/lawyers/get-releases-metrics'
import { getInitials } from '@/utils'

/** Rótulos curtos do eixo do gráfico mensal, na ordem em que a api-fr devolve os meses (1..12). */
export const MONTH_SHORT_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

/** O que aparece no lugar do número quando o mês ainda não chegou. */
export const NO_DATA_MARK = '—'

const numberFormatter = new Intl.NumberFormat('pt-BR')

const percentFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

export function formatCount(value: number) {
  return numberFormatter.format(value)
}

export type MetricDelta = {
  /** Sempre positivo — o sinal vira o rótulo e a cor, não o número. */
  percent: number
  direction: 'up' | 'down' | 'flat'
}

/**
 * Variação contra o mesmo período do ano anterior.
 *
 * Devolve `null` quando não havia base de comparação: dividir por zero produziria "+∞%", e
 * "cresceu infinito" é pior que não mostrar nada — o primeiro ano de operação cairia sempre aqui.
 */
export function buildDelta(current: number, previous: number): MetricDelta | null {
  if (previous <= 0) return null

  const variation = ((current - previous) / previous) * 100

  if (Math.abs(variation) < 0.05) return { percent: 0, direction: 'flat' }

  return { percent: Math.abs(variation), direction: variation > 0 ? 'up' : 'down' }
}

/** O menos aqui é o sinal matemático (U+2212), não o hífen: alinha com os dígitos tabulares. */
export function formatDelta({ percent, direction }: MetricDelta) {
  const sign = direction === 'up' ? '+' : direction === 'down' ? '−' : ''

  return `${sign}${percentFormatter.format(percent)}%`
}

/**
 * Sigla da seccional para exibir junto da inscrição.
 *
 * O model `Lawyers` da api-fr não guarda UF — quem tem `uf` é a sala. Quando todas as salas
 * visíveis são da mesma seccional, essa é a UF dos advogados atendidos e o rótulo fica completo;
 * se houver mistura, mostramos só "OAB", porque inventar a sigla erraria a inscrição de alguém.
 */
export function resolveOabUf(roomUfs: string[]) {
  const distinct = [...new Set(roomUfs.filter(Boolean).map(uf => uf.toUpperCase()))]

  return distinct.length === 1 ? distinct[0] : null
}

export function formatOab(oab: string, uf: string | null) {
  const label = uf ? `OAB/${uf}` : 'OAB'
  // Inscrições são numéricas, mas o campo é texto livre: se vier algo com letras, respeitamos.
  const digitsOnly = /^\d+$/.test(oab)

  return `${label} ${digitsOnly ? formatCount(Number(oab)) : oab}`
}

export type RankedItem = {
  /** Fatia do total do período — é o número que aparece ao lado da contagem. */
  share: number
  /** Largura da barra, relativa ao **primeiro colocado**, não ao total. */
  width: number
}

export type RankedRoom = MetricsByRoomProps & RankedItem

export type RankedLawyer = MetricsByLawyerProps &
  RankedItem & {
    position: number
    initials: string
  }

/**
 * A barra é medida contra o líder e o percentual contra o total, de propósito.
 *
 * Se a barra usasse a fatia do total, um ranking equilibrado viraria cinco tracinhos idênticos
 * e curtos; medindo contra o líder, a comparação entre as salas fica legível. O percentual, esse
 * precisa somar 100% — é o que responde "quanto desta operação passa por aqui".
 */
function rank<T extends { total: number }>(items: T[]): (T & RankedItem)[] {
  const sum = items.reduce((accumulator, item) => accumulator + item.total, 0)
  const max = items.reduce((accumulator, item) => Math.max(accumulator, item.total), 0)

  return items.map(item => ({
    ...item,
    share: sum > 0 ? (item.total / sum) * 100 : 0,
    width: max > 0 ? (item.total / max) * 100 : 0,
  }))
}

export function buildRoomRanking(rooms: MetricsByRoomProps[]): RankedRoom[] {
  return rank(rooms)
}

export function buildLawyerRanking(lawyers: MetricsByLawyerProps[]): RankedLawyer[] {
  return rank(lawyers).map((lawyer, index) => ({
    ...lawyer,
    position: index + 1,
    initials: getInitials(lawyer.name),
  }))
}

export type MonthPoint = {
  month: number
  label: string
  total: number | null
  /** Recharts precisa de um número para desenhar; o mês futuro vira barra de altura zero. */
  value: number
}

export function buildMonthSeries(months: MetricsByMonthProps[]): MonthPoint[] {
  return months.map(({ month, total }) => ({
    month,
    label: MONTH_SHORT_LABELS[month - 1] ?? String(month),
    total,
    value: total ?? 0,
  }))
}

/**
 * Anos oferecidos no filtro: os que têm registro, mais o ano corrente e o que está selecionado.
 *
 * O ano corrente entra mesmo sem nenhuma liberação — em janeiro a lista ficaria sem a opção que
 * a tela abre por padrão. E o ano selecionado entra mesmo vazio: quem chega por um link em um ano
 * sem movimento veria o seletor exibindo um ano que não está na própria lista, e ao trocar de ano
 * perderia o caminho de volta.
 */
export function buildYearOptions(yearsWithData: number[], currentYear: number, selectedYear: number) {
  return [...new Set([currentYear, selectedYear, ...yearsWithData])].sort((a, b) => b - a)
}

/**
 * Mensagem de vazio explicada pela causa. Dizer só "sem dados" deixa o funcionário sem saber se
 * ele filtrou demais, se a sala é nova ou se o ano ainda não começou.
 */
export function buildEmptyMessage({
  year,
  currentYear,
  hasRoomFilter,
  hasAnyHistory,
}: {
  year: number
  currentYear: number
  hasRoomFilter: boolean
  hasAnyHistory: boolean
}) {
  // O filtro de sala vem antes da falta de histórico de propósito: `byYear` também é recortado
  // pela sala, então uma sala nunca usada chega aqui sem histórico nenhum. Cair na mensagem geral
  // afirmaria que o produto inteiro está zerado por causa de um filtro.
  if (hasRoomFilter) {
    return hasAnyHistory
      ? `Esta sala não teve liberações em ${year}. Escolha outra sala ou volte para "Todas as salas".`
      : 'Esta sala nunca registrou liberações. Escolha outra sala ou volte para "Todas as salas".'
  }

  if (!hasAnyHistory) {
    return 'Nenhuma liberação registrada até agora. Os indicadores aparecem assim que a primeira sala for usada.'
  }

  if (year > currentYear) {
    return `${year} ainda não começou. Selecione um ano com registro.`
  }

  return `Nenhuma liberação em ${year}. Escolha outro ano para ver o movimento.`
}
