'use client'

import { createColumnHelper } from '@tanstack/react-table'
import { format, isValid, parseISO } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import type { DataTableFeatures } from '@/components/ui/data-table/data-table-features'
import { cn } from '@/lib/utils'
import type { ComputerWithRoomProps } from '@/server/computers/get-all'
import { DeleteComputer } from './delete-computer'

const columnHelper = createColumnHelper<DataTableFeatures, ComputerWithRoomProps>()

export const columnsComputers = columnHelper.columns([
  columnHelper.accessor('number', {
    header: 'Número',
    meta: { skeletonClassName: 'w-10' },
    // Mesmo rótulo do painel de operação: o balconista procura a máquina por "ESTAÇÃO-01", não por "1".
    cell: ({ getValue }) => <span className="tabular-nums">ESTAÇÃO-{String(getValue()).padStart(2, '0')}</span>,
  }),
  columnHelper.accessor('description', {
    header: 'Descrição',
    meta: { skeletonClassName: 'w-48' },
  }),
  columnHelper.accessor('room.name', {
    header: 'Sala vinculada',
    meta: { skeletonClassName: 'w-32' },
  }),
  columnHelper.accessor('macCode', {
    header: 'Código MAC',
    meta: { skeletonClassName: 'w-40' },
    cell: ({ getValue }) => <span className="tabular-nums tracking-wider">{getValue()}</span>,
  }),
  columnHelper.accessor('maintenance', {
    header: 'Status',
    meta: { skeletonClassName: 'h-5 w-20 rounded-full' },
    // Manutenção vence `inUse`: máquina fora de operação com a flag travada não pode aparecer como
    // ocupada, senão o balconista tenta encerrar uma sessão que não existe.
    cell: ({ row }) => {
      const { maintenance, inUse } = row.original

      if (maintenance) {
        return <Badge variant="destructive">Manutenção</Badge>
      }

      return (
        <Badge variant="outline">
          <span className={cn('size-1.5 min-w-1.5 animate-pulse rounded-full', inUse ? 'bg-rose-700' : 'bg-emerald-600')} />
          {inUse ? 'Em uso' : 'Disponível'}
        </Badge>
      )
    },
  }),
  columnHelper.accessor('createdAt', {
    header: 'Data da criação',
    meta: { skeletonClassName: 'w-24' },
    cell: ({ getValue }) => {
      const createdAt = parseISO(getValue())

      return isValid(createdAt) ? format(createdAt, 'dd/MM/yyyy') : '—'
    },
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Ações',
    meta: { className: 'text-center', skeletonClassName: 'h-7 w-16' },
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-1">
        <DeleteComputer computer={row.original} />
      </div>
    ),
  }),
])
