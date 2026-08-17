import { isAxiosError } from 'axios'

/**
 * Leitura defensiva dos erros da `api-fr`.
 *
 * O contrato promete `{ message }` (e `{ message, retryAfterInSeconds }` no 429), mas nem todo erro que
 * chega no `catch` veio da API: queda de rede não traz `response`, e um 502 de gateway responde HTML.
 * Acessar `err.response.data.message` direto quebra o próprio tratamento de erro nesses casos.
 */
type ApiErrorBody = {
  message?: unknown
  retryAfterInSeconds?: unknown
}

function readErrorBody(error: unknown): ApiErrorBody | null {
  if (!isAxiosError(error)) return null

  const data = error.response?.data

  return typeof data === 'object' && data !== null ? (data as ApiErrorBody) : null
}

export function getApiErrorStatus(error: unknown) {
  return isAxiosError(error) ? error.response?.status : undefined
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  const message = readErrorBody(error)?.message

  return typeof message === 'string' && message.trim().length > 0 ? message : fallback
}

/** Segundos de espera do `429`, ou `null` quando o erro não é de rate limit. */
export function getRetryAfterInSeconds(error: unknown) {
  if (getApiErrorStatus(error) !== 429) return null

  const retryAfter = readErrorBody(error)?.retryAfterInSeconds

  return typeof retryAfter === 'number' && Number.isFinite(retryAfter) ? Math.max(0, Math.ceil(retryAfter)) : null
}

/** "45 segundos", "2 minutos", "1 minuto e 30 segundos" — o usuário precisa saber quanto falta, não o número cru. */
export function formatWaitTime(totalSeconds: number) {
  if (totalSeconds < 60) return `${totalSeconds} segundo${totalSeconds === 1 ? '' : 's'}`

  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  const minutesLabel = `${minutes} minuto${minutes === 1 ? '' : 's'}`

  if (seconds === 0) return minutesLabel

  return `${minutesLabel} e ${seconds} segundo${seconds === 1 ? '' : 's'}`
}
