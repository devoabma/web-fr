import { API } from '@/lib/axios'

export type MetricsKpisProps = {
  totalReleases: number
  totalReleasesPreviousYearSamePeriod: number
  monthsWithData: number
  averagePerMonth: number
  averagePerMonthPreviousYearSamePeriod: number
  distinctLawyers: number
  distinctLawyersPreviousYearSamePeriod: number
  averageSessionMinutes: number
  averageSessionMinutesPreviousYearSamePeriod: number
  /** Sala que dá contexto ao tempo médio: a filtrada, ou a mais movimentada do período. */
  referenceStandardTime: {
    roomName: string
    minutes: number
  } | null
}

export type MetricsByYearProps = {
  year: number
  total: number
}

export type MetricsByMonthProps = {
  month: number
  /** `null` = mês que ainda não aconteceu. Não é a mesma coisa que zero liberações. */
  total: number | null
}

export type MetricsByRoomProps = {
  roomId: string
  name: string
  total: number
}

export type MetricsByLawyerProps = {
  lawyerId: string
  name: string
  oab: string
  total: number
}

export type MetricsProps = {
  year: number
  kpis: MetricsKpisProps
  byYear: MetricsByYearProps[]
  byMonth: MetricsByMonthProps[]
  byRoom: MetricsByRoomProps[]
  byLawyer: MetricsByLawyerProps[]
}

export interface GetReleasesMetricsResponse {
  metrics: MetricsProps
}

/**
 * Liberações já **agregadas** pela api-fr: indicadores do ano, série por ano, série por mês,
 * ranking de salas e ranking de advogados.
 *
 * A contagem é feita no Postgres de propósito. A rota irmã `get-all-releases` devolve a lista
 * bruta e sem paginação — desenhar o gráfico "por ano" em cima dela obrigaria o navegador a
 * baixar o histórico inteiro só para produzir quatro números.
 *
 * O escopo por papel é resolvido na api-fr: ADMIN enxerga todas as salas, MEMBER só as salas em
 * que está vinculado. Pedir uma sala à qual não se tem acesso devolve zeros, não erro.
 *
 * Atenção ao `byRoom`: ele **ignora** o `roomId` de propósito, porque é um ranking ENTRE salas.
 * Os demais blocos respeitam o filtro.
 */
export async function getReleasesMetrics(roomId?: string, year?: number): Promise<GetReleasesMetricsResponse> {
  const response = await API.get<GetReleasesMetricsResponse>(`/lawyers/releases-metrics${roomId ? `/${roomId}` : ''}`, {
    params: year ? { year } : undefined,
  })

  return response.data
}
