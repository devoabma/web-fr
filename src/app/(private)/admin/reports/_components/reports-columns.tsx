'use client'

import { createColumnHelper } from '@tanstack/react-table'
import { DoorOpenIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { DataTableFeatures } from '@/components/ui/data-table/data-table-features'
import { cn } from '@/lib/utils'
import { formatDayTime } from '@/utils/day-key'
import type { LawyerRankingRow, LawyerReportRow, RoomMovementRow } from '../_data/reports-view'

const numberFormatter = new Intl.NumberFormat('pt-BR')
const percentFormatter = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

/**
 * `2h15` no lugar de `135 min`.
 *
 * A leitura em horas é a que a diretoria usa para falar de ocupação de sala; os minutos crus ficam
 * na exportação, onde a planilha precisa somar.
 */
function formatClock(minutes: number) {
  if (minutes <= 0) return '—'

  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60

  if (hours === 0) return `${rest}min`

  return rest === 0 ? `${hours}h` : `${hours}h${String(rest).padStart(2, '0')}`
}

/** Avatar de iniciais igual ao do resto do painel, para a mesma pessoa se reconhecer entre telas. */
function LawyerCell({ initials, name, oab }: { initials: string; name: string; oab: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full border bg-muted font-medium text-[11px] text-muted-foreground">
        {initials}
      </span>

      <div className="flex min-w-0 flex-col">
        <span className="truncate font-medium leading-tight">{name}</span>
        {/* A inscrição fica sob o nome porque é ela que separa homônimos — e homônimo é comum aqui. */}
        <span className="text-muted-foreground text-xs tabular-nums leading-tight">OAB {oab}</span>
      </div>
    </div>
  )
}

const lawyerHelper = createColumnHelper<DataTableFeatures, LawyerReportRow>()

export const columnsLawyersByRoom = lawyerHelper.columns([
  lawyerHelper.accessor('name', {
    header: 'Advogado(a)',
    meta: { skeletonAnchorClassName: 'rounded-full', skeletonClassName: 'w-40' },
    cell: ({ row }) => <LawyerCell initials={row.original.initials} name={row.original.name} oab={row.original.oab} />,
  }),

  lawyerHelper.accessor('releases', {
    header: 'Acessos',
    meta: { className: 'text-right', skeletonClassName: 'w-8' },
    cell: ({ row }) => <span className="block text-right tabular-nums">{numberFormatter.format(row.original.releases)}</span>,
  }),

  lawyerHelper.accessor('firstAccess', {
    header: 'Primeiro acesso',
    meta: { skeletonClassName: 'w-28' },
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-muted-foreground tabular-nums">{formatDayTime(row.original.firstAccess)}</span>
    ),
  }),

  lawyerHelper.accessor('lastAccess', {
    header: 'Último acesso',
    meta: { skeletonClassName: 'w-28' },
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-muted-foreground tabular-nums">{formatDayTime(row.original.lastAccess)}</span>
    ),
  }),

  lawyerHelper.accessor('minutes', {
    header: 'Tempo',
    meta: { className: 'text-right', skeletonClassName: 'w-12' },
    cell: ({ row }) => <span className="block text-right tabular-nums">{formatClock(row.original.minutes)}</span>,
  }),

  lawyerHelper.accessor('distinctRooms', {
    header: 'Salas',
    meta: { className: 'text-right', skeletonClassName: 'w-8' },
    // `null` quando há sala filtrada: ali a resposta seria sempre 1, e a coluna viraria enfeite.
    cell: ({ row }) => (
      <span className="block text-right text-muted-foreground tabular-nums">{row.original.distinctRooms ?? '—'}</span>
    ),
  }),
])

const roomHelper = createColumnHelper<DataTableFeatures, RoomMovementRow>()

export const columnsRoomMovement = roomHelper.columns([
  roomHelper.accessor('name', {
    header: 'Sala',
    meta: { skeletonAnchorClassName: 'rounded-md', skeletonClassName: 'w-36' },
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground">
          <DoorOpenIcon className="size-4" />
        </span>

        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate font-medium leading-tight">{row.original.name}</span>

          {row.original.inactive && (
            <Badge variant="outline" className="border-slate-500/25 bg-slate-500/10 text-slate-500">
              Inativa
            </Badge>
          )}
        </div>
      </div>
    ),
  }),

  roomHelper.accessor('releases', {
    header: 'Liberações',
    meta: { className: 'text-right', skeletonClassName: 'w-10' },
    cell: ({ row }) => <span className="block text-right tabular-nums">{numberFormatter.format(row.original.releases)}</span>,
  }),

  roomHelper.accessor('distinctLawyers', {
    header: 'Advogados',
    meta: { className: 'text-right', skeletonClassName: 'w-10' },
    cell: ({ row }) => (
      <span className="block text-right tabular-nums">{numberFormatter.format(row.original.distinctLawyers)}</span>
    ),
  }),

  roomHelper.accessor('minutes', {
    header: 'Tempo total',
    meta: { className: 'text-right', skeletonClassName: 'w-14' },
    cell: ({ row }) => <span className="block text-right tabular-nums">{formatClock(row.original.minutes)}</span>,
  }),

  roomHelper.accessor('averageMinutes', {
    header: 'Média',
    meta: { className: 'text-right', skeletonClassName: 'w-12' },
    cell: ({ row }) => (
      <span className="block text-right text-muted-foreground tabular-nums">{formatClock(row.original.averageMinutes)}</span>
    ),
  }),

  roomHelper.accessor('share', {
    header: 'Fatia',
    meta: { skeletonClassName: 'w-20' },
    // A barra é medida contra a sala líder e o percentual contra o total — mesma leitura de `/metrics`:
    // com a fatia na barra, um comparativo equilibrado viraria cinco tracinhos idênticos.
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-2">
        <span className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-muted sm:block">
          <span className="block h-full rounded-full bg-primary" style={{ width: `${row.original.width}%` }} />
        </span>

        <span className="w-12 text-right tabular-nums">{percentFormatter.format(row.original.share)}%</span>
      </div>
    ),
  }),
])

const rankingHelper = createColumnHelper<DataTableFeatures, LawyerRankingRow>()

export const columnsLawyerRanking = rankingHelper.columns([
  rankingHelper.accessor('position', {
    header: '#',
    meta: { className: 'w-12 text-center', skeletonClassName: 'w-6' },
    cell: ({ row }) => (
      <span
        className={cn(
          'block text-center font-medium tabular-nums',
          // Só o pódio ganha destaque: numerar 300 linhas em negrito não hierarquiza nada.
          row.original.position <= 3 ? 'text-primary' : 'text-muted-foreground'
        )}
      >
        {row.original.position}
      </span>
    ),
  }),

  rankingHelper.accessor('name', {
    header: 'Advogado(a)',
    meta: { skeletonAnchorClassName: 'rounded-full', skeletonClassName: 'w-40' },
    cell: ({ row }) => <LawyerCell initials={row.original.initials} name={row.original.name} oab={row.original.oab} />,
  }),

  rankingHelper.accessor('releases', {
    header: 'Acessos',
    meta: { className: 'text-right', skeletonClassName: 'w-8' },
    cell: ({ row }) => <span className="block text-right tabular-nums">{numberFormatter.format(row.original.releases)}</span>,
  }),

  rankingHelper.accessor('distinctRooms', {
    header: 'Salas',
    meta: { className: 'text-right', skeletonClassName: 'w-8' },
    // A coluna que revela quem circula entre salas para esticar a cota diária.
    cell: ({ row }) => <span className="block text-right tabular-nums">{row.original.distinctRooms}</span>,
  }),

  rankingHelper.accessor('minutes', {
    header: 'Tempo',
    meta: { className: 'text-right', skeletonClassName: 'w-12' },
    cell: ({ row }) => <span className="block text-right tabular-nums">{formatClock(row.original.minutes)}</span>,
  }),

  rankingHelper.accessor('lastAccess', {
    header: 'Último acesso',
    meta: { skeletonClassName: 'w-28' },
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-muted-foreground tabular-nums">{formatDayTime(row.original.lastAccess)}</span>
    ),
  }),
])
