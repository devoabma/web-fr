import { API } from '@/lib/axios'

interface UpdateComputerRequest {
  computerId: string
  macCode?: string
  number?: number
  description?: string
  roomId?: string
}

interface UpdateComputerResponse {
  message: string
}

export async function updateComputer({
  computerId,
  macCode,
  number,
  description,
  roomId,
}: UpdateComputerRequest): Promise<UpdateComputerResponse> {
  const response = await API.patch<UpdateComputerResponse>(`/computers/update/${computerId}`, {
    macCode,
    number,
    description,
    roomId,
  })

  return response.data
}
