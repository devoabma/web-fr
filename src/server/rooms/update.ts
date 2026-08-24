import { API } from '@/lib/axios'

interface UpdateRoomRequest {
  roomId: string
  name?: string
  standardTime?: number
  description?: string | null
}

interface UpdateRoomResponse {
  message: string
}

export async function updateRoom({ roomId, name, standardTime, description }: UpdateRoomRequest): Promise<UpdateRoomResponse> {
  const response = await API.patch<UpdateRoomResponse>(`/rooms/update/${roomId}`, {
    name,
    standardTime,
    description,
  })

  return response.data
}
