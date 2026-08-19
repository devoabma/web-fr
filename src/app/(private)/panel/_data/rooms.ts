export type ComputerStatus = 'available' | 'in-use' | 'maintenance'

export type Computer = {
  id: string
  name: string
  description: string
  status: ComputerStatus
  lawyerName?: string
  remainingMinutes?: number
  maintenanceSince?: string
}

export type Room = {
  id: string
  name: string
  description: string
  standardTime: number
  computers: Computer[]
}

/**
 * Dados fake enquanto a tela não fala com a API.
 *
 * Tudo aqui é constante — nada de `new Date()` ou `Math.random()`, que dariam valores diferentes
 * no servidor e no navegador e quebrariam a hidratação do React.
 */

function buildComputers(roomId: string, total: number): Computer[] {
  return Array.from({ length: total }, (_, index) => ({
    id: `${roomId}-pc-${index + 1}`,
    name: `PC-${String(index + 1).padStart(2, '0')}`,
    description: 'Computador',
    status: 'available',
  }))
}

export const ROOMS: Room[] = [
  {
    id: 'room-bacabal',
    name: 'Sala Bacabal',
    description: 'Sala de fórum · Subseção de Bacabal',
    standardTime: 120,
    computers: buildComputers('room-bacabal', 8).map(computer => {
      if (computer.name === 'PC-02') {
        return { ...computer, status: 'in-use', lawyerName: 'Marcos A. Silva', remainingMinutes: 42 }
      }

      if (computer.name === 'PC-06') {
        return { ...computer, status: 'in-use', lawyerName: 'Renata Costa', remainingMinutes: 65 }
      }

      if (computer.name === 'PC-04') {
        return { ...computer, status: 'maintenance', maintenanceSince: '2026-08-18T11:20:00.000Z' }
      }

      return computer
    }),
  },
  {
    id: 'room-sao-luis',
    name: 'Escritório Compartilhado · São Luís',
    description: 'Sede da OAB-MA · Térreo',
    standardTime: 180,
    computers: buildComputers('room-sao-luis', 6).map(computer => {
      if (computer.name === 'PC-01') {
        return { ...computer, status: 'in-use', lawyerName: 'Paulo Henrique Muniz', remainingMinutes: 112 }
      }

      if (computer.name === 'PC-05') {
        return { ...computer, status: 'maintenance', maintenanceSince: '2026-08-17T18:05:00.000Z' }
      }

      return computer
    }),
  },
  {
    id: 'room-imperatriz',
    name: 'Sala Imperatriz',
    description: 'Sala de fórum · Subseção de Imperatriz',
    standardTime: 120,
    computers: buildComputers('room-imperatriz', 4),
  },
]
