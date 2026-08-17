import { API } from '@/lib/axios'

interface SignInRequest {
  cpf: string
  password: string
}

interface SignInResponse {
  token: string
}

export async function signIn({ cpf, password }: SignInRequest): Promise<SignInResponse> {
  const response = await API.post<SignInResponse>('/employees/session/auth', {
    cpf,
    password,
  })

  return response.data
}
