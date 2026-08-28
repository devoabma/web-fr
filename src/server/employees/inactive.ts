import { API } from '@/lib/axios'

interface DeactivateEmployeeResponse {
  message: string
}

export async function deactivateEmployee(employeeId: string): Promise<DeactivateEmployeeResponse> {
  const response = await API.patch<DeactivateEmployeeResponse>(`/employees/deactivate/${employeeId}`)

  return response.data
}
