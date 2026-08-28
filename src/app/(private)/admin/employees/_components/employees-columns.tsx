'use client'

import { createColumnHelper } from '@tanstack/react-table'
import { format, isValid, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ShieldCheckIcon, UserRoundIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { DataTableFeatures } from '@/components/ui/data-table/data-table-features'
import { cn } from '@/lib/utils'
import type { EmployeeProps } from '@/server/employees/get-all'
import { getAvatarColor, getInitials } from '@/utils'
import { maskCpf } from '@/utils/masks/cpf'
import { ActivateEmployee } from './activate-employee'
import { InactiveEmployee } from './inactive-employee'
import { ManageEmployeeRooms } from './manage-employee-rooms'
import { UpdateEmployee } from './update-employee'

const columnHelper = createColumnHelper<DataTableFeatures, EmployeeProps>()

export const columnsEmployees = columnHelper.columns([
  columnHelper.accessor('name', {
    header: 'Colaborador',
    meta: { skeletonAnchorClassName: 'rounded-full', skeletonClassName: 'w-40' },
    cell: ({ row }) => {
      const { id, name, email, imageUrl } = row.original

      return (
        <div className="flex items-center gap-3">
          <Avatar>
            {imageUrl && <AvatarImage src={imageUrl} alt={name} />}

            <AvatarFallback className={cn('font-medium text-xs', getAvatarColor(id))}>{getInitials(name)}</AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <span className="font-medium leading-tight">{name}</span>

            <span className="text-muted-foreground text-xs leading-tight">{email}</span>
          </div>
        </div>
      )
    },
  }),
  columnHelper.accessor('cpf', {
    header: 'CPF',
    meta: { skeletonClassName: 'w-28' },
    cell: ({ getValue }) => <span className="tabular-nums">{maskCpf(getValue())}</span>,
  }),
  columnHelper.accessor('role', {
    header: 'Papel',
    meta: { skeletonClassName: 'w-24 rounded-full' },
    cell: ({ getValue }) =>
      getValue() === 'ADMIN' ? (
        <Badge className="border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-300">
          <ShieldCheckIcon data-icon="inline-start" /> Administrador
        </Badge>
      ) : (
        <Badge variant="outline" className="bg-muted text-muted-foreground">
          <UserRoundIcon data-icon="inline-start" /> Colaborador
        </Badge>
      ),
  }),
  columnHelper.accessor('inactive', {
    header: 'Status',
    meta: { skeletonClassName: 'w-20 rounded-full' },
    cell: ({ getValue }) =>
      getValue() ? (
        <Badge variant="destructive">Inativo</Badge>
      ) : (
        <Badge variant="outline">
          <span className="size-1.5 min-w-1.5 animate-pulse rounded-full bg-emerald-600 text-muted-foreground" />
          Ativo
        </Badge>
      ),
  }),
  columnHelper.accessor('createdAt', {
    header: 'Data da criação',
    meta: { skeletonClassName: 'w-24' },
    cell: ({ getValue }) => {
      const createdAt = parseISO(getValue())

      return isValid(createdAt) ? format(createdAt, 'dd MMM. yyyy', { locale: ptBR }) : '—'
    },
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Ações',
    meta: { className: 'text-center', skeletonClassName: 'w-14' },
    cell: ({ row }) => {
      const employee = row.original

      return (
        <div className="flex items-center justify-center gap-1">
          <UpdateEmployee employee={employee} />

          <ManageEmployeeRooms employee={employee} />

          {/* Cada sentido do toggle é um componente próprio: rotas, confirmação e mensagens diferentes. */}
          {employee.inactive ? <ActivateEmployee employee={employee} /> : <InactiveEmployee employee={employee} />}
        </div>
      )
    },
  }),
])
