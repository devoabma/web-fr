import type { Uf } from '@/constants/ufs'
import { API } from '@/lib/axios'

interface CreateRoomRequest {
  name: string
  /**
   * Opcional na api-fr — omitir cadastra a sala em 'MA'. O painel manda sempre: o campo existe
   * justamente para o estado ser uma escolha, não um padrão herdado em silêncio.
   */
  uf?: Uf
  standardTime: number
  /** Opcional na api-fr — omitir deixa a sala sem descrição em vez de gravar uma string vazia. */
  description?: string
}

interface CreateRoomResponse {
  roomId: string
}

export async function createRoom({ name, uf, standardTime, description }: CreateRoomRequest): Promise<CreateRoomResponse> {
  const response = await API.post<CreateRoomResponse>('/rooms/create', {
    name,
    uf,
    standardTime,
    description,
  })

  return response.data
}
