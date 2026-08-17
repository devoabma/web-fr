import type { Role } from '@/lib/auth/session'
import { API } from '@/lib/axios'

export interface EmployeeProfile {
  id: string
  name: string
  cpf: string
  email: string
  // A API declara `imageUrl` como anulável: funcionário que nunca subiu foto não tem URL. Tipar como
  // `string` faria o `next/image` receber `null` e estourar em tempo de execução ("Failed to parse src").
  imageUrl: string | null
  role: Role
}

interface GetProfileResponse {
  employee: EmployeeProfile
}

export async function getProfile(): Promise<GetProfileResponse> {
  const response = await API.get<GetProfileResponse>('/employees/profile')

  return response.data
}
