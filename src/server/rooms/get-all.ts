import { API } from '@/lib/axios'

type EmployeeRoomProps = {
  employees: {
    id: string
    name: string
    imageUrl: string | null
  }
}

export type ComputerProps = {
  id: string
  macCode: string
  number: number
  description: string
  inUse: boolean
  /** Data ISO de quando a máquina entrou em manutenção — `null` enquanto ela está em operação. */
  maintenance: string | null
}

export type RoomProps = {
  id: string
  name: string
  standardTime: number
  description: string | null
  /** Data ISO da desativação da sala — `null` enquanto ela está ativa. */
  inactive: string | null
  createdAt: string
  employeesRooms: EmployeeRoomProps[]
  computers: ComputerProps[]
}

export interface GetAllRoomsResponse {
  rooms: RoomProps[]
}

/**
 * Fonte única dos computadores do painel.
 *
 * `/computers/get-all` também lista máquinas, mas é ADMIN-only e o painel é operado por MEMBER —
 * ele tomaria 401. Aqui os computadores já vêm embutidos na sala, com o escopo por papel resolvido
 * no servidor e numa requisição só.
 */
export async function getAllRooms(): Promise<GetAllRoomsResponse> {
  const response = await API.get<GetAllRoomsResponse>('/rooms/get-all')

  return response.data
}
