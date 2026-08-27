import { API } from '@/lib/axios'

interface CreateEmployeeRequest {
  name: string
  cpf: string
  email: string
  password: string
}

interface CreateEmployeeResponse {
  message: string
  /** Id do colaborador recém-criado — é o que permite vincular as salas na sequência, sem reconsultar a listagem. */
  employeeId: string
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
