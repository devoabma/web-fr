import { API } from '@/lib/axios'

export type ReleaseProps = {
  id: string
  startDate: string
  /** `null` marca a sessão em curso — é assim que se sabe quem está na máquina agora. */
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
 * Sessões de liberação da sala.
 *
 * A rota devolve o **histórico inteiro** ordenado por `startedAt desc`, não só as sessões abertas —
 * quem filtra `endDate === null` é o front. Sem `roomId` viriam as sessões de todas as salas visíveis
 * ao funcionário, então o painel sempre passa a sala selecionada.
 */
export async function getAllReleases(roomId: string): Promise<GetAllReleasesResponse> {
  const response = await API.get<GetAllReleasesResponse>(`/lawyers/get-all-releases/${roomId}`)

  return response.data
}
