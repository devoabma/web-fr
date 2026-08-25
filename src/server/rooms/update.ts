import type { Uf } from '@/constants/ufs'
import { API } from '@/lib/axios'

interface UpdateRoomRequest {
  roomId: string
  name?: string
  /**
   * Campo ausente = mantém a UF atual. Diferente da descrição, não existe "limpar": mandar `''`
   * ou `null` volta 400 do enum, então quem chama só passa `uf` quando ela realmente mudou —
   * `undefined` some no `JSON.stringify` e a chave nem chega ao corpo da requisição.
   */
  uf?: Uf
  standardTime?: number
  description?: string | null
}

interface UpdateRoomResponse {
  message: string
}

export async function updateRoom({ roomId, name, uf, standardTime, description }: UpdateRoomRequest): Promise<UpdateRoomResponse> {
  const response = await API.patch<UpdateRoomResponse>(`/rooms/update/${roomId}`, {
    name,
    uf,
    standardTime,
    description,
  })

  return response.data
}
