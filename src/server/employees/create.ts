import { API } from '@/lib/axios'

interface CreateEmployeeRequest {
  name: string
  cpf: string
  email: string
  password: string
}

interface CreateEmployeeResponse {
  message: string
}

export async function createEmployee({ name, cpf, email, password }: CreateEmployeeRequest): Promise<CreateEmployeeResponse> {
  const response = await API.post<CreateEmployeeResponse>('/employees/create-account', {
    name,
    cpf,
    email,
    password,
  })

  return response.data
}
