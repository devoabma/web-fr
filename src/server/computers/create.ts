import { API } from '@/lib/axios'

interface CreateComputerRequest {
  macCode: string
  number: number
  description: string
  roomId: string
}

interface CreateComputerResponse {
  macCode: string
}

export async function createComputer({
  macCode,
  number,
  description,
  roomId,
}: CreateComputerRequest): Promise<CreateComputerResponse> {
  const response = await API.post<CreateComputerResponse>('/computers/create', {
    macCode,
    number,
    description,
    roomId,
  })

  return response.data
}
