import { API } from '@/lib/axios'

type EmployeeRoomProps = {
  employees: {
    id: string
    name: string
    imageUrl: string | null
  }
}
type ComputerProps = {
  id: string
  macCode: string
  number: number
  description: string
  inUse: boolean
  maintenance: boolean | null
}

export type RoomProps = {
  id: string
  name: string
  standardTime: number
  description: string | null
  inactive: boolean | null
  employeesRooms: EmployeeRoomProps[]
  computers: ComputerProps[]
}

export interface GetAllRoomsResponse {
  rooms: RoomProps[]
}

export async function getAllRooms(): Promise<GetAllRoomsResponse> {
  const response = await API.get<GetAllRoomsResponse>('/rooms/get-all')

  return response.data
}
