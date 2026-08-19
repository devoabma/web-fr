import { API } from '@/lib/axios'

interface PutIntoMaintenanceResponse {
  message: string
}

/**
 * Manutenção é operação, não inventário: ADMIN age em qualquer máquina, MEMBER só nas salas dele —
 * fora disso a API responde `404` com a mesma mensagem de "não encontrado".
 *
 * Recusa com `400` a máquina que já está em manutenção e a que está **em uso**: a sessão do advogado
 * precisa ser encerrada antes, para ninguém ser derrubado em silêncio.
 */
export async function putIntoMaintenance(computerId: string): Promise<PutIntoMaintenanceResponse> {
  const response = await API.patch<PutIntoMaintenanceResponse>(`/computers/maintenance/${computerId}`)

  return response.data
}
