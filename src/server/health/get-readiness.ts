import { API } from '@/lib/axios'

/**
 * Teto de espera desta chamada, e só dela.
 *
 * O `API` não tem `timeout` global: nas rotas de dado, esperar é melhor do que abortar uma leitura que
 * ia chegar. Aqui é o contrário — uma requisição pendurada não é "carregando", é justamente o sintoma
 * que o selo existe para mostrar. Sem teto, uma API que aceita a conexão e nunca responde deixaria o
 * selo em "Verificando" para sempre, que é a única leitura pior do que um selo errado.
 *
 * Folgado o bastante para caber a sondagem do outro lado, que desiste do banco em 3s.
 */
const READINESS_TIMEOUT_IN_MS = 8_000

export interface GetReadinessResponse {
  status: string
  database: string
}

/**
 * A `api-fr` consegue **atender**?
 *
 * Pergunta em `/ready`, e não em `/health`: o `/health` responde 200 só por o processo estar de pé,
 * sem tocar no banco — de propósito, porque é dele que o `HEALTHCHECK` do Docker decide reiniciar o
 * contêiner. Um selo verde com o Postgres fora seria exatamente a mentira que este componente existe
 * para não contar. O `/ready` devolve `503` nesse caso, e o React Query trata como erro.
 */
export async function getReadiness(): Promise<GetReadinessResponse> {
  const response = await API.get<GetReadinessResponse>('/ready', { timeout: READINESS_TIMEOUT_IN_MS })

  return response.data
}
