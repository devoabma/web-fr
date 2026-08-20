import type { Role } from '@/lib/auth/session'
import { API } from '@/lib/axios'

export interface EmployeeProfile {
  id: string
  name: string
  cpf: string
  email: string
  imageUrl: string | null
  role: Role
}

export interface GetProfileResponse {
  employee: EmployeeProfile
}

export async function getProfile(): Promise<GetProfileResponse> {
  const response = await API.get<GetProfileResponse>('/employees/profile')

  return response.data
}
