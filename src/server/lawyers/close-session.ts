import { API } from '@/lib/axios'

interface CloseSessionResponse {
  message: string
  /** Saldo do dia que sobra para o advogado depois do encerramento. */
  remainingTime: number
}

/** Atenção ao verbo e ao caminho: é `POST /lawyers/close-computer/:sessionId`, não `close-session`. */
export async function closeSession(sessionId: string): Promise<CloseSessionResponse> {
  const response = await API.post<CloseSessionResponse>(`/lawyers/close-computer/${sessionId}`)

  return response.data
}
