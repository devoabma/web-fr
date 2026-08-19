import { API } from '@/lib/axios'

interface TakeOutOfMaintenanceResponse {
  message: string
}

export async function takeOutOfMaintenance(computerId: string): Promise<TakeOutOfMaintenanceResponse> {
  const response = await API.patch<TakeOutOfMaintenanceResponse>(`/computers/maintenance/${computerId}/remove`)

  return response.data
}
