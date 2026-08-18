import { API } from '@/lib/axios'

interface LogoutResponse {
  message: string
}

/**
 * Encerra a sessão pedindo à `api-fr` que expire o cookie `httpOnly` — o navegador não consegue
 * apagá-lo sozinho. Depende do `withCredentials` do cliente axios: sem ele o `Set-Cookie` de
 * limpeza é descartado e o usuário continua logado.
 */
export async function logout(): Promise<LogoutResponse> {
  const response = await API.post<LogoutResponse>('/employees/session/logout')

  return response.data
}
