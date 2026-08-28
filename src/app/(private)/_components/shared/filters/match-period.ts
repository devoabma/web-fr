import type { Period } from './period-filter'

/**
 * `en-CA` formata como `2026-08-27`, que compara e ordena como texto — é o que deixa "últimos 7 dias"
 * ser um `>=` de strings. O fuso é o da Seccional: o corte do dia tem de ser a meia-noite do balcão,
 * não a de quem está com o navegador em outro lugar.
 */
const dayKeyFormatter = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: 'America/Fortaleza',
})

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

  const today = dayKeyFormatter.format(now)
  const yesterday = dayKeyFormatter.format(now - MS_IN_DAY)
  // O dia de hoje conta como o primeiro, senão "últimos 7 dias" mostraria oito.
  const weekStart = dayKeyFormatter.format(now - 6 * MS_IN_DAY)
  const monthStart = dayKeyFormatter.format(now - 29 * MS_IN_DAY)

  return (isoDate: string) => {
    const day = dayKeyFormatter.format(new Date(isoDate))

    if (period === 'today') return day === today
    if (period === 'yesterday') return day === yesterday
    if (period === 'last-7-days') return day >= weekStart

    return day >= monthStart
  }
}
