import { API } from '@/lib/axios'

export type ReleaseProps = {
  id: string
  startDate: string
  endDate: string | null
  lawyer: {
    id: string
    name: string
  }
  room: {
    id: string
    name: string
    standardTime: number
  }
  computer: {
    id: string
    description: string
  }
  usedMinutes: number
  remainingMinutes: number
  usedAllTime: boolean
}

export interface GetAllReleasesResponse {
  releases: ReleaseProps[]
}

/**
 * Sessões de liberação, já ordenadas da mais nova para a mais antiga.
 *
 * A rota devolve o **histórico inteiro**, não só as sessões abertas — quem filtra `endDate === null`
 * é o front, e é o que o painel de operação faz para saber quem está usando cada máquina. A tela de
 * auditoria usa a lista como ela vem.
 *
 * O escopo por papel é resolvido na api-fr: ADMIN enxerga todas as salas, MEMBER só as salas em que
 * está vinculado. Sem `roomId` a rota devolve tudo o que aquele funcionário pode ver — é isso que a
 * opção "Todas as salas" da auditoria usa. O painel de operação, que trabalha uma sala por vez,
 * sempre passa a sala selecionada.
 */
export async function getAllReleases(roomId?: string): Promise<GetAllReleasesResponse> {
  const response = await API.get<GetAllReleasesResponse>(`/lawyers/get-all-releases${roomId ? `/${roomId}` : ''}`)

  return response.data
}
