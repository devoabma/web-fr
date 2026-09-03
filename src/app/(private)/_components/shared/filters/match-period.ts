import { formatDayKey } from '@/utils/day-key'
import type { Period } from './period-filter'

const MS_IN_DAY = 86_400_000

/**
 * Monta o teste de período uma vez e devolve a função que cada linha usa.
 *
 * Os limites são calculados aqui fora, e não linha a linha: uma lista de mil sessões formataria as
 * mesmas três datas mil vezes. Como o `now` fica congelado na construção, todas as linhas de uma
 * mesma filtragem são comparadas contra o mesmo instante — ninguém muda de dia no meio da varredura.
 */
export function createPeriodMatcher(period: Period) {
  if (period === 'all') {
    return () => true
  }

  const now = Date.now()

  const today = formatDayKey(now)
  const yesterday = formatDayKey(now - MS_IN_DAY)
  // O dia de hoje conta como o primeiro, senão "últimos 7 dias" mostraria oito.
  const weekStart = formatDayKey(now - 6 * MS_IN_DAY)
  const monthStart = formatDayKey(now - 29 * MS_IN_DAY)

  return (isoDate: string) => {
    const day = formatDayKey(new Date(isoDate))

    if (period === 'today') return day === today
    if (period === 'yesterday') return day === yesterday
    if (period === 'last-7-days') return day >= weekStart

    return day >= monthStart
  }
}
