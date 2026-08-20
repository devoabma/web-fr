import { API } from '@/lib/axios'

interface ChangePasswordResponse {
  message: string
}

interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

export async function changePassword({
  currentPassword,
  newPassword,
  confirmNewPassword,
}: ChangePasswordRequest): Promise<ChangePasswordResponse> {
  const response = await API.patch<ChangePasswordResponse>('/employees/change-password', {
    currentPassword,
    newPassword,
    confirmNewPassword,
  })

  return response.data
}
