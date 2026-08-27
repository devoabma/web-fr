import { API } from '@/lib/axios'

interface LinkEmployeeWithRoomsRequest {
  employeeId: string
  roomIds: string[]
}

interface LinkEmployeeWithRoomsResponse {
  message: string
}

export async function linkEmployeeWithRooms({
  employeeId,
  roomIds,
}: LinkEmployeeWithRoomsRequest): Promise<LinkEmployeeWithRoomsResponse> {
  const response = await API.post<LinkEmployeeWithRoomsResponse>('/employees/link-with-rooms', {
    employeeId,
    roomIds,
  })

  return response.data
}
