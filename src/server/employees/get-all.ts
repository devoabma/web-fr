import type { Uf } from '@/constants/ufs'
import { API } from '@/lib/axios'

export type EmployeeRole = 'MEMBER' | 'ADMIN'

export type EmployeeRoomProps = {
  rooms: {
    id: string
    name: string
    uf: Uf
    inactive: string | null
  }
}

export type EmployeeProps = {
  id: string
  name: string
  cpf: string
  email: string
  imageUrl: string | null
  role: EmployeeRole
  inactive: string | null
  createdAt: string
  employeesRooms: EmployeeRoomProps[]
}

export interface GetAllEmployeesResponse {
  employees: EmployeeProps[]
}

export async function getAllEmployees(): Promise<GetAllEmployeesResponse> {
  const response = await API.get<GetAllEmployeesResponse>('/employees/get-all')

  return response.data
}
