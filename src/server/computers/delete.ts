import { API } from '@/lib/axios'

interface DeleteComputerResponse {
  message: string
}

/**
 * Remove a máquina do inventário. ADMIN-only.
 *
 * **Não é soft delete**, ao contrário das salas: o registro sai do banco e leva junto, em cascata,
 * o histórico de sessões (`computer_sessions`) e as impressões (`printers`) daquela máquina.
 *
 * A api-fr recusa com `400` quando o computador está `inUse` — a sessão do advogado precisa ser
 * encerrada antes, para não derrubar ninguém em silêncio.
 */
export async function deleteComputer(computerId: string): Promise<DeleteComputerResponse> {
  const response = await API.delete<DeleteComputerResponse>(`/computers/delete/${computerId}`)

  return response.data
}
