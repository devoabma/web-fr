import { API } from '@/lib/axios'
import type { EmployeeRole } from './get-all'

interface UpdateEmployeeRequest {
  employeeId: string
  name?: string
  email?: string
  role?: EmployeeRole
}

interface UpdateEmployeeResponse {
  message: string
}

export async function updateEmployee({ employeeId, name, email, role }: UpdateEmployeeRequest): Promise<UpdateEmployeeResponse> {
  const response = await API.patch<UpdateEmployeeResponse>(`/employees/update/${employeeId}`, {
    name,
    email,
    role,
  })

  return response.data
}
