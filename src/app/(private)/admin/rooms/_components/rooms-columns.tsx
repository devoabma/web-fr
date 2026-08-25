'use client'

import { createColumnHelper } from '@tanstack/react-table'
import { format, isValid, parseISO } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import type { DataTableFeatures } from '@/components/ui/data-table/data-table-features'
import type { RoomProps } from '@/server/rooms/get-all'
import { formatMinutes } from '@/utils'
import { ActivateRoom } from './activate-room'
import { InactiveRoom } from './inactive-room'
import { UpdateRoom } from './update-room'

const columnHelper = createColumnHelper<DataTableFeatures, RoomProps>()

export const columns = columnHelper.columns([
  columnHelper.accessor('name', {
    header: 'Nome',
    meta: { skeletonClassName: 'w-40' },
    // A UF anda colada no nome porque esta é a única tela onde dá para flagrar uma sala marcada no
    // estado errado — o sintoma do outro lado é mudo: a estação só deixa de receber a atualização.
    cell: ({ row }) => (
      <span className="flex items-center gap-1.5">
        {row.original.name}

        <span className="font-medium text-muted-foreground">· {row.original.uf}</span>
      </span>
    ),
  }),
  columnHelper.accessor('standardTime', {
    header: 'Tempo padrão',
    meta: { skeletonClassName: 'w-20' },
    cell: ({ getValue }) => formatMinutes(getValue()),
  }),
  columnHelper.accessor('description', {
    header: 'Descrição',
    meta: { skeletonClassName: 'w-64' },
  }),
  columnHelper.accessor('inactive', {
    header: 'Status',
    meta: { skeletonClassName: 'h-5 w-20 rounded-full' },
    cell: ({ getValue }) =>
      getValue() ? (
        <Badge variant="destructive">Inativa</Badge>
      ) : (
        <Badge variant="outline">
          <span className="size-1.5 min-w-1.5 animate-pulse rounded-full bg-emerald-600 text-muted-foreground" />
          Ativa
        </Badge>
      ),
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
    cell: ({ row }) => {
      const room = row.original

      return (
        <div className="flex items-center justify-center gap-1">
          <UpdateRoom room={room} />

          {/* Cada sentido do toggle é um componente próprio: rotas, confirmação e mensagens diferentes. */}
          {room.inactive ? <ActivateRoom room={room} /> : <InactiveRoom room={room} />}
        </div>
      )
    },
  }),
])
