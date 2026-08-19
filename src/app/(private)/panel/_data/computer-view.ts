import type { ReleaseProps } from '@/server/lawyers/get-all-releases'
import type { ComputerProps } from '@/server/rooms/get-all'

export type ComputerStatus = 'available' | 'in-use' | 'maintenance'

export type ComputerView = {
  id: string
  /** `PC-01` — o número da máquina é o que o balconista lê no gabinete. */
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

/**
 * Junta as duas rotas que a tela precisa: `/rooms/get-all` dá o inventário da sala e
 * `/lawyers/get-all-releases/:roomId` dá quem está usando o quê.
 */
export function buildComputerViews(computers: ComputerProps[], releases: ReleaseProps[]): ComputerView[] {
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
        session: session
          ? {
              id: session.id,
              lawyerName: session.lawyer.name,
              startDate: session.startDate,
              usedMinutes: session.usedMinutes,
              remainingMinutes: session.remainingMinutes,
              usedAllTime: session.usedAllTime,
            }
          : null,
      }
    })
}
