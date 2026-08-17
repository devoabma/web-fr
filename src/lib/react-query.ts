import { isServer, QueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry(failureCount, error) {
          const status = isAxiosError(error) ? error.response?.status : undefined

          // Um 4xx é decisão da API, não falha de transporte: repetir devolve exatamente o mesmo status.
          // No 429 é pior que inútil — cada tentativa extra consome o teto e empurra o desbloqueio adiante.
          if (status && status < 500) return false

          return failureCount < 2
        },
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined

/**
 * No servidor cada requisição precisa do **seu próprio** cache: um `QueryClient` criado no escopo do módulo
 * nasce uma vez por processo e ficaria compartilhado entre usuários — o perfil de quem entrou primeiro
 * vazaria para o próximo a renderizar. No navegador vale o oposto: o mesmo cliente tem que sobreviver aos
 * re-renders, senão o cache se perde a cada navegação.
 */
export function getQueryClient() {
  if (isServer) return makeQueryClient()

  browserQueryClient ??= makeQueryClient()

  return browserQueryClient
}
