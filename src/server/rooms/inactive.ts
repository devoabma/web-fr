import { API } from '@/lib/axios'

interface DeactivateRoomResponse {
  message: string
}

export async function deactivateRoom(roomId: string): Promise<DeactivateRoomResponse> {
  const response = await API.patch<DeactivateRoomResponse>(`/rooms/deactivate/${roomId}`)

  return response.data
}
