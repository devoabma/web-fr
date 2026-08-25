import { API } from '@/lib/axios'

export type ComputerRoomProps = {
  id: string
  name: string
}

export type ComputerWithRoomProps = {
  id: string
  macCode: string
  number: number
  description: string
  inUse: boolean
  /** Data ISO de quando a máquina entrou em manutenção — `null` enquanto ela está em operação. */
  maintenance: string | null
  createdAt: string
  room: ComputerRoomProps
}

export interface GetAllComputersResponse {
  computers: ComputerWithRoomProps[]
}

/**
 * Inventário de máquinas para a tela de administração.
 *
 * É **ADMIN-only** na api-fr (`checkIfEmployeeIsAdmin`) — MEMBER toma 401. Serve só a `/admin/computers`;
 * o painel de operação continua lendo os computadores embutidos em `/rooms/get-all`, que já vem com o
 * escopo por papel resolvido no servidor.
 *
 * A rota aceita os filtros `roomId` e `description`, mas **não filtra por nome da sala** e **não pagina**.
 * Como a busca da tela é por sala *ou* descrição, a lista vem inteira e o filtro é aplicado no cliente —
 * um único request, sem ida ao servidor a cada tecla.
 */
export async function getAllComputers(): Promise<GetAllComputersResponse> {
  const response = await API.get<GetAllComputersResponse>('/computers/get-all')

  return response.data
}
