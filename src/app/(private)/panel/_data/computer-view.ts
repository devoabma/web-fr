import type { ReleaseProps } from '@/server/lawyers/get-all-releases'
import type { ComputerProps } from '@/server/rooms/get-all'

export type ComputerStatus = 'available' | 'in-use' | 'maintenance'

export type ComputerView = {
  id: string
  name: string
  description: string
  macCode: string
  status: ComputerStatus
  maintenanceSince: string | null
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
 */
export function buildComputerViews(computers: ComputerProps[], releases: ReleaseProps[], elapsedMinutes = 0): ComputerView[] {
  // A rota devolve o histórico inteiro; só a sessão sem `endDate` está em curso. O `reverse()` antes
  // do Map faz a mais recente vencer, porque a lista chega ordenada da mais nova para a mais antiga.
  const openSessions = new Map(
    releases
      .filter(release => release.endDate === null)
      .reverse()
      .map(release => [release.computer.id, release])
  )

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
        name: `PC-${String(computer.number).padStart(2, '0')}`,
        description: computer.description,
        macCode: computer.macCode,
        status,
        maintenanceSince: computer.maintenance,
        session: session ? buildSessionView(session, elapsedMinutes) : null,
      }
    })
}
