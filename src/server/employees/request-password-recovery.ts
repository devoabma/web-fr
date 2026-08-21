import { API } from '@/lib/axios'

interface RequestPasswordRecoveryRequest {
  cpf: string
  email: string
}

interface RequestPasswordRecoveryResponse {
  message: string
}

export async function requestPasswordRecovery({
  cpf,
  email,
}: RequestPasswordRecoveryRequest): Promise<RequestPasswordRecoveryResponse> {
  const response = await API.post<RequestPasswordRecoveryResponse>('/employees/password-recovery', {
    cpf,
    email,
  })

  return response.data
}
