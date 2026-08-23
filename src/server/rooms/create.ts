import { API } from '@/lib/axios'

interface CreateRoomRequest {
  name: string
  standardTime: number
  /** Opcional na api-fr — omitir deixa a sala sem descrição em vez de gravar uma string vazia. */
  description?: string
}

interface CreateRoomResponse {
  roomId: string
}

export async function createRoom({ name, standardTime, description }: CreateRoomRequest): Promise<CreateRoomResponse> {
  const response = await API.post<CreateRoomResponse>('/rooms/create', {
    name,
    standardTime,
    description,
  })

  return response.data
}
