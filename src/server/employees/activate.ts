import { API } from '@/lib/axios'

interface ActivateEmployeeResponse {
  message: string
}

export async function activateEmployee(employeeId: string): Promise<ActivateEmployeeResponse> {
  const response = await API.patch<ActivateEmployeeResponse>(`/employees/activate/${employeeId}`)

  return response.data
}
