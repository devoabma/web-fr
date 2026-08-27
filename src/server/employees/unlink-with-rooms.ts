import { API } from '@/lib/axios'

interface UnlinkEmployeeWithRoomsRequest {
  employeeId: string
  roomIds: string[]
}

interface UnlinkEmployeeWithRoomsResponse {
  message: string
}

export async function unlinkEmployeeWithRooms({
  employeeId,
  roomIds,
}: UnlinkEmployeeWithRoomsRequest): Promise<UnlinkEmployeeWithRoomsResponse> {
  const response = await API.post<UnlinkEmployeeWithRoomsResponse>('/employees/unlink-with-rooms', {
    employeeId,
    roomIds,
  })

  return response.data
}
