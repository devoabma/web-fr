import type { ReleaseProps } from '@/server/lawyers/get-all-releases'
import type { ComputerProps } from '@/server/rooms/get-all'

export type ComputerStatus = 'available' | 'in-use' | 'maintenance'

export type ComputerVersionView = {
  /** Como a estação informou: texto, sem o `V` que o aplicativo desenha no canto da tela dela. */
  number: string
  /**
   * Quando ela informou. `null` só por segurança de tipo — a api-fr grava o número e o carimbo
   * na mesma escrita, então versão sem data seria defeito de dado.
   */
  reportedAt: string | null
  /**
   * Está atrás de alguma irmã de sala.
   *
   * A régua é a maior versão vista **na própria sala**, e não uma versão "oficial": o painel não
   * sabe o que foi publicado, mas sabe o que as vizinhas estão rodando. É o que faz a máquina que
   * ficou para trás aparecer sozinha — inclusive a que voltou para a versão anterior por conta
   * própria depois de uma atualização falhar, que é justamente o caso que interessa ver.
   */
  isOutdated: boolean
}

export type ComputerView = {
  id: string
  name: string
  description: string
  macCode: string
  status: ComputerStatus
  maintenanceSince: string | null
  /** Está no canal `/ws/computers` e recebe a ordem de abrir a tela. `null` = o painel não conseguiu perguntar. */
  isOnline: boolean | null
  /**
   * Versão do Desktop instalada na estação. `null` = ela nunca informou, o que não é erro:
   * pode nunca ter conectado desde que a api-fr passou a guardar, ou ter o envio desligado.
   */
  version: ComputerVersionView | null
  /** Sessão em curso. `null` mesmo em `in-use` quando a máquina está ocupada sem sessão correspondente. */
  session: {
    id: string
    lawyerName: string
    startDate: string
    usedMinutes: number
    remainingMinutes: number
    usedAllTime: boolean
  } | null
}

/**
 * Compara duas versões segmento a segmento — negativo quando a primeira é mais antiga.
 *
 * Comparar como texto mentiria: `'1.0.10' < '1.0.7'` é verdadeiro em ordem alfabética, e a
 * estação mais atualizada da sala apareceria como a atrasada. Segmento não numérico (um sufixo
 * `-beta`, por exemplo) vale zero: o campo é livre do lado do cliente, e o pior desfecho aceitável
 * aqui é não destacar nada — nunca destacar a máquina errada.
 */
function compareVersions(first: string, second: string): number {
  const firstParts = first.split('.')
  const secondParts = second.split('.')

  for (let index = 0; index < Math.max(firstParts.length, secondParts.length); index++) {
    const difference = (Number(firstParts[index]) || 0) - (Number(secondParts[index]) || 0)

    if (difference !== 0) {
      return difference
    }
  }

  return 0
}

/** Envelhece o saldo de uma sessão em curso pelos minutos que se passaram desde a resposta do servidor. */
function buildSessionView(release: ReleaseProps, elapsedMinutes: number): NonNullable<ComputerView['session']> {
  const remainingMinutes = Math.max(0, release.remainingMinutes - elapsedMinutes)

  return {
    id: release.id,
    lawyerName: release.lawyer.name,
    startDate: release.startDate,
    usedMinutes: release.usedMinutes + elapsedMinutes,
    remainingMinutes,
    // A cota zerada na tela vale como esgotada: a api-fr encerra a sessão por conta própria quando o
    // `expiresAt` chega, e o refetch seguinte só confirma o que o card já mostrou.
    usedAllTime: release.usedAllTime || remainingMinutes === 0,
  }
}

/**
 * Junta as duas rotas que a tela precisa: `/rooms/get-all` dá o inventário da sala e
 * `/lawyers/get-all-releases/:roomId` dá quem está usando o quê.
 *
 * `elapsedMinutes` é quanto tempo passou desde que essas liberações chegaram do servidor. O saldo vem
 * calculado lá e envelhece no instante seguinte; descontar aqui faz o relógio andar sozinho na tela.
 *
 * `onlineComputerIds` vem de `/computers/online/:roomId` e diz quem está no WebSocket. `null` significa
 * que o painel não conseguiu perguntar — ver `ComputerView.isOnline`.
 */
export function buildComputerViews(
  computers: ComputerProps[],
  releases: ReleaseProps[],
  elapsedMinutes = 0,
  onlineComputerIds: ReadonlySet<string> | null = null
): ComputerView[] {
  // A rota devolve o histórico inteiro; só a sessão sem `endDate` está em curso. O `reverse()` antes
  // do Map faz a mais recente vencer, porque a lista chega ordenada da mais nova para a mais antiga.
  const openSessions = new Map(
    releases
      .filter(release => release.endDate === null)
      .reverse()
      .map(release => [release.computer.id, release])
  )

  // Régua da defasagem: a maior versão que alguma máquina desta sala informou. Sala inteira na
  // mesma versão (o caso normal) não destaca ninguém, porque nenhuma fica abaixo do topo.
  const highestVersion = computers.reduce<string | null>((highest, computer) => {
    if (!computer.appVersion) {
      return highest
    }

    return highest === null || compareVersions(computer.appVersion, highest) > 0 ? computer.appVersion : highest
  }, null)

  // A API não ordena os computadores, então a ordem vem do Postgres e muda entre requisições —
  // sem isto a grade embaralha sozinha a cada refetch.
  return [...computers]
    .sort((first, second) => first.number - second.number)
    .map(computer => {
      const session = openSessions.get(computer.id) ?? null

      // Manutenção vence `inUse`: máquina em manutenção com a flag travada não pode aparecer como
      // ocupada, senão o balconista tenta encerrar uma sessão que não existe.
      const status: ComputerStatus = computer.maintenance ? 'maintenance' : session || computer.inUse ? 'in-use' : 'available'

      return {
        id: computer.id,
        name: `ESTAÇÃO-${String(computer.number).padStart(2, '0')}`,
        description: computer.description,
        macCode: computer.macCode,
        status,
        maintenanceSince: computer.maintenance,
        isOnline: onlineComputerIds ? onlineComputerIds.has(computer.id) : null,
        version: computer.appVersion
          ? {
              number: computer.appVersion,
              reportedAt: computer.appVersionReportedAt,
              // `highestVersion` não é nulo aqui: esta própria máquina informou algo, então existe topo.
              isOutdated: highestVersion !== null && compareVersions(computer.appVersion, highestVersion) < 0,
            }
          : null,
        session: session ? buildSessionView(session, elapsedMinutes) : null,
      }
    })
}
