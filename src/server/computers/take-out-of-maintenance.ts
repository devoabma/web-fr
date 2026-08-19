import { API } from '@/lib/axios'

interface TakeOutOfMaintenanceResponse {
  message: string
}

/**
 * Mesmo escopo por papel do `putIntoMaintenance`: ADMIN em qualquer máquina, MEMBER só nas salas
 * dele. Responde `400` se a máquina não estava em manutenção.
 *
 * Atenção ao caminho: o `/remove` vai no fim, depois do id — `/computers/maintenance/:id/remove`.
 */
export async function takeOutOfMaintenance(computerId: string): Promise<TakeOutOfMaintenanceResponse> {
  const response = await API.patch<TakeOutOfMaintenanceResponse>(`/computers/maintenance/${computerId}/remove`)

  return response.data
}
