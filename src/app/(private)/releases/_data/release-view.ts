import type { ReleaseProps } from '@/server/lawyers/get-all-releases'

/**
 * O desfecho de uma sessão, que é o que a auditoria procura:
 *
 * - `in-progress`: ainda aberta, o advogado(a) está na máquina agora;
 * - `exhausted`: consumiu a cota inteira da sala — foi a api-fr que fechou, no `expiresAt`;
 * - `closed`: fechada antes da cota acabar, ou seja, alguém encerrou pelo balcão.
 */
export type ReleaseStatus = 'in-progress' | 'exhausted' | 'closed'

/** Como o estado aparece no ladrilho da linha. */
export const RELEASE_STATUS_LABELS: Record<ReleaseStatus, string> = {
  'in-progress': 'Em andamento',
  exhausted: 'Tempo esgotado',
  closed: 'Encerrada',
}

/** O mesmo estado em frase corrida, para a contagem da toolbar e para a lista vazia. */
export const RELEASE_STATUS_SENTENCES: Record<ReleaseStatus, string> = {
  'in-progress': 'em andamento',
  exhausted: 'com o tempo esgotado',
  closed: 'encerrada antes do tempo',
}

export type ReleaseView = ReleaseProps & {
  status: ReleaseStatus
}

/**
 * Classifica cada sessão e envelhece o relógio das que ainda estão abertas.
 *
 * `usedMinutes` e `remainingMinutes` são calculados no servidor e já nascem defasados: para uma
 * sessão fechada isso não importa, porque o número congelou junto com ela, mas para uma aberta o
 * tempo de tela continua correndo. `elapsedMinutes` é quanto tempo passou desde a resposta da api-fr
 * — descontar aqui faz a duração andar sozinha sem uma requisição por minuto.
 */
export function buildReleaseViews(releases: ReleaseProps[], elapsedMinutes = 0): ReleaseView[] {
  return releases.map(release => {
    const isInProgress = release.endDate === null

    if (!isInProgress) {
      // A cota consumida é o que separa "a api-fr fechou no fim do tempo" de "o balcão encerrou antes".
      return { ...release, status: release.usedAllTime ? 'exhausted' : 'closed' }
    }

    const remainingMinutes = Math.max(0, release.remainingMinutes - elapsedMinutes)

    return {
      ...release,
      usedMinutes: release.usedMinutes + elapsedMinutes,
      remainingMinutes,
      // A cota zerada na tela vale como esgotada: a api-fr encerra a sessão por conta própria quando o
      // `expiresAt` chega, e o refetch seguinte só confirma o que a linha já mostrou.
      usedAllTime: release.usedAllTime || remainingMinutes === 0,
      // Sessão aberta continua "em andamento" mesmo com a cota no fim — o encerramento é da api-fr, e
      // anunciá-lo antes da hora mostraria como fechada uma sessão em que ainda há alguém sentado.
      status: 'in-progress',
    }
  })
}
