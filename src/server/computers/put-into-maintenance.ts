import { API } from '@/lib/axios'

interface PutIntoMaintenanceResponse {
  message: string
}

export async function putIntoMaintenance(computerId: string): Promise<PutIntoMaintenanceResponse> {
  const response = await API.patch<PutIntoMaintenanceResponse>(`/computers/maintenance/${computerId}`)

  return response.data
}
