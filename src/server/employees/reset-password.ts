import { API } from '@/lib/axios'

interface ResetPasswordRequest {
  code: string
  password: string
  confirmPassword: string
}

interface ResetPasswordResponse {
  message: string
}

export async function resetPassword({ code, password, confirmPassword }: ResetPasswordRequest): Promise<ResetPasswordResponse> {
  const response = await API.post<ResetPasswordResponse>('/employees/reset-password', {
    code,
    password,
    confirmPassword,
  })

  return response.data
}
