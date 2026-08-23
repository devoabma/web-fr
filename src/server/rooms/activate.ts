import { API } from '@/lib/axios'

interface ActivateRoomResponse {
  message: string
}

export async function activateRoom(roomId: string): Promise<ActivateRoomResponse> {
  const response = await API.patch<ActivateRoomResponse>(`/rooms/activate/${roomId}`)

  return response.data
}
