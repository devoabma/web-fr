import { API } from '@/lib/axios'

export type PrinterLawyerProps = {
  id: string
  name: string
}

export type PrinterRoomProps = {
  id: string
  name: string
}

export type PrinterComputerProps = {
  id: string
  description: string
}

export type PrinterProps = {
  id: string
  fileUrl: string
  createdAt: string
  lawyer: PrinterLawyerProps
  room: PrinterRoomProps
  computer: PrinterComputerProps
}

export interface GetAllPrintersResponse {
  printers: PrinterProps[]
}

/**
 * Histórico de impressões, já ordenado da mais nova para a mais antiga.
 *
 * O escopo por papel é resolvido na api-fr: ADMIN enxerga todas as salas, MEMBER só as salas em que
 * está vinculado. Sem `roomId` a rota devolve tudo o que aquele funcionário pode ver — é isso que a
 * opção "Todas as salas" da tela usa, e por isso ela não precisa de tratamento por papel no cliente.
 */
export async function getAllPrinters(roomId?: string): Promise<GetAllPrintersResponse> {
  const response = await API.get<GetAllPrintersResponse>(`/printers/get-all${roomId ? `/${roomId}` : ''}`)

  return response.data
}
