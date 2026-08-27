'use client'

import { createColumnHelper } from '@tanstack/react-table'
import { format, isValid, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { DoorOpenIcon, ShieldCheckIcon, SquarePen, UserRoundIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { DataTableFeatures } from '@/components/ui/data-table/data-table-features'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { EmployeeProps } from '@/server/employees/get-all'
import { getAvatarColor, getInitials } from '@/utils'
import { maskCpf } from '@/utils/masks/cpf'

const columnHelper = createColumnHelper<DataTableFeatures, EmployeeProps>()

export const columnsEmployees = columnHelper.columns([
  columnHelper.accessor('name', {
    header: 'Colaborador',
    meta: { skeletonClassName: 'h-8 w-56' },
    // Nome e e-mail andam na mesma célula porque é o e-mail que desempata homônimo — e ele não rende
    // uma coluna própria: seria a mais larga da tabela para um dado que quase nunca se lê inteiro.
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
    // A api-fr guarda e devolve só os 11 dígitos; a pontuação existe para o olho conferir de bater.
    cell: ({ getValue }) => <span className="tabular-nums">{maskCpf(getValue())}</span>,
  }),
  columnHelper.accessor('role', {
    header: 'Papel',
    meta: { skeletonClassName: 'h-5 w-24 rounded-full' },
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
    meta: { skeletonClassName: 'h-5 w-20 rounded-full' },
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
    meta: { skeletonClassName: 'w-28' },
    cell: ({ getValue }) => {
      const createdAt = parseISO(getValue())

      return isValid(createdAt) ? format(createdAt, 'dd MMM. yyyy', { locale: ptBR }) : '—'
    },
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Ações',
    meta: { className: 'text-center', skeletonClassName: 'h-7 w-16' },
    // Os dois botões estão só desenhados: a anatomia da linha fica fechada agora, e cada diálogo entra
    // depois no seu próprio componente, como em salas e computadores. `aria-disabled` em vez de
    // `disabled` porque botão desabilitado não dispara hover — e é o tooltip que explica a espera.
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-1">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="outline"
                size="icon-sm"
                aria-disabled
                aria-label={`Atualizar o colaborador ${row.original.name}`}
                className="aria-disabled:opacity-50"
              />
            }
          >
            <SquarePen />
          </TooltipTrigger>

          <TooltipContent>Atualizar colaborador — em breve</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="outline"
                size="icon-sm"
                aria-disabled
                aria-label={`Gerenciar as salas de ${row.original.name}`}
                className="aria-disabled:opacity-50"
              />
            }
          >
            <DoorOpenIcon />
          </TooltipTrigger>

          <TooltipContent>Salas vinculadas — em breve</TooltipContent>
        </Tooltip>
      </div>
    ),
  }),
])
