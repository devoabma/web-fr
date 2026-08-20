import { API } from '@/lib/axios'

export type OnlineComputerProps = {
  id: string
  macCode: string
  roomId: string
  /** Data ISO de quando a estação entrou no canal. Reconexão zera — é a conexão atual, não o uptime. */
  connectedAt: string
}

export interface GetOnlineComputersResponse {
  computers: OnlineComputerProps[]
}

/**
 * Quais máquinas da sala estão no canal `/ws/computers` e conseguem receber a ordem de abrir a tela.
 *
 * A rota devolve **só as conectadas**: quem não está na lista está desligado, sem rede ou com o Desktop
 * fechado. É o que permite o balcão barrar a liberação antes de gravar sessão numa máquina muda.
 */
export async function getOnlineComputers(roomId: string): Promise<GetOnlineComputersResponse> {
  const response = await API.get<GetOnlineComputersResponse>(`/computers/online/${roomId}`)

  return response.data
}
