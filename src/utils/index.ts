/**
 * Lê uma duração em minutos no vocabulário do relógio: `90` → `1h30`, `45` → `45min`.
 *
 * Devolve `null` quando não há valor para ler — campo `number` vazio chega como `NaN` no
 * react-hook-form, e `0min` de cota não é leitura, é ausência de resposta.
 */
export function formatDuration(minutes: number) {
  if (!Number.isFinite(minutes) || minutes <= 0) return null

  const hours = Math.floor(minutes / 60)
  const restOfMinutes = minutes % 60

  if (hours === 0) return `${restOfMinutes}min`
  if (restOfMinutes === 0) return `${hours}h`

  return `${hours}h${String(restOfMinutes).padStart(2, '0')}`
}

/**
 * Formata a cota diária como `120min (2h)`.
 *
 * O valor bruto vem primeiro porque é ele que o cadastro grava e o painel usa na cota;
 * a leitura em horas entra entre parênteses só quando acrescenta algo (>= 60min).
 */
export function formatMinutes(minutes: number) {
  const readable = formatDuration(minutes)

  if (!readable) return '—'
  if (minutes < 60) return readable

  return `${minutes}min (${readable})`
}

export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) return '?'

  const first = parts[0]?.charAt(0) ?? ''
  const last = parts.length > 1 ? (parts.at(-1)?.charAt(0) ?? '') : ''

  return `${first}${last}`.toUpperCase()
}
