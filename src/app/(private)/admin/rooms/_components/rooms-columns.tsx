'use client'

import { createColumnHelper } from '@tanstack/react-table'
import { format, isValid, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { DoorOpenIcon, MonitorIcon, PowerOffIcon, WrenchIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { DataTableFeatures } from '@/components/ui/data-table/data-table-features'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { RoomProps } from '@/server/rooms/get-all'
import { formatMinutes, getAvatarColor, getInitials } from '@/utils'
import { ActivateRoom } from './activate-room'
import { InactiveRoom } from './inactive-room'
import { UpdateRoom } from './update-room'

/** Acima disso a fileira empurra a coluna e alarga a linha; o excedente vira contador com a lista no tooltip. */
const MAX_VISIBLE_AVATARS = 3

const columnHelper = createColumnHelper<DataTableFeatures, RoomProps>()

export const columns = columnHelper.columns([
  columnHelper.accessor('name', {
    header: 'Sala',
    meta: { skeletonClassName: 'h-8 w-52' },
    // Nome e descrição na mesma célula, como o colaborador e a estação. A UF continua colada no nome, e
    // não desceu para a segunda linha, porque esta é a única tela onde dá para flagrar uma sala marcada
    // no estado errado — o sintoma do outro lado é mudo: a estação só deixa de receber a atualização.
    cell: ({ row }) => {
      const { name, uf, description } = row.original

      return (
        <div className="flex items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground">
            <DoorOpenIcon className="size-4" />
          </span>

          <div className="flex flex-col">
            <span className="flex items-center gap-1.5 font-medium leading-tight">
              {name}

              <span className="text-muted-foreground">· {uf}</span>
            </span>

            {description && <span className="text-muted-foreground text-xs leading-tight">{description}</span>}
          </div>
        </div>
      )
    },
  }),
  columnHelper.accessor('standardTime', {
    header: 'Tempo padrão',
    meta: { skeletonClassName: 'w-24' },
    cell: ({ getValue }) => <span className="tabular-nums">{formatMinutes(getValue())}</span>,
  }),
  columnHelper.display({
    id: 'team',
    header: 'Equipe',
    meta: { skeletonClassName: 'h-8 w-20 rounded-full' },
    // Quem responde pela sala já vinha em `/rooms/get-all` e a tela de administração não mostrava — era
    // preciso abrir Colaboradores e cruzar na mão. Mesmos avatares e mesmas cores da tabela de
    // colaboradores, de propósito: a cor é a pista que liga a mesma pessoa entre as duas telas.
    //
    // A API já filtra aqui os colaboradores **inativos** (`where: { employees: { inactive: null } }`),
    // então esta coluna é a equipe em exercício, não o histórico de vínculos.
    cell: ({ row }) => {
      const employees = row.original.employeesRooms.map(({ employees }) => employees)

      if (employees.length === 0) {
        return <span className="text-muted-foreground text-xs">Sem equipe</span>
      }

      const visibleEmployees = employees.slice(0, MAX_VISIBLE_AVATARS)
      const hiddenEmployees = employees.slice(MAX_VISIBLE_AVATARS)

      return (
        <AvatarGroup>
          {visibleEmployees.map(employee => (
            <Tooltip key={employee.id}>
              <TooltipTrigger render={<Avatar size="sm" role="img" aria-label={employee.name} />}>
                {employee.imageUrl && <AvatarImage src={employee.imageUrl} alt={employee.name} />}

                <AvatarFallback className={cn('font-medium', getAvatarColor(employee.id))}>
                  {getInitials(employee.name)}
                </AvatarFallback>
              </TooltipTrigger>

              <TooltipContent>{employee.name}</TooltipContent>
            </Tooltip>
          ))}

          {hiddenEmployees.length > 0 && (
            <Tooltip>
              <TooltipTrigger render={<AvatarGroupCount className="text-xs" />}>+{hiddenEmployees.length}</TooltipTrigger>

              <TooltipContent className="flex-col items-start gap-0.5">
                {hiddenEmployees.map(employee => (
                  <span key={employee.id}>{employee.name}</span>
                ))}
              </TooltipContent>
            </Tooltip>
          )}
        </AvatarGroup>
      )
    },
  }),
  columnHelper.display({
    id: 'computers',
    header: 'Estações',
    meta: { skeletonClassName: 'h-5 w-16 rounded-full' },
    // Sala sem máquina nenhuma não aparecia em lugar algum do painel — a de operação simplesmente não
    // desenha card, o que se lê como "está tudo certo aqui".
    //
    // A manutenção entra junto, e o "em uso" não: manutenção é condição de inventário, que é o assunto
    // desta tela, enquanto ocupação é estado do momento e muda enquanto se olha — esse é o painel.
    cell: ({ row }) => {
      const { computers } = row.original

      if (computers.length === 0) {
        return <span className="text-muted-foreground text-xs">Nenhuma</span>
      }

      const inMaintenance = computers.filter(computer => computer.maintenance).length

      return (
        <div className="flex items-center gap-1.5">
          <Tooltip>
            <TooltipTrigger render={<Badge variant="outline" className="cursor-default tabular-nums" />}>
              <MonitorIcon data-icon="inline-start" /> {computers.length}
            </TooltipTrigger>

            <TooltipContent>
              {computers.length === 1 ? '1 estação cadastrada' : `${computers.length} estações cadastradas`}
            </TooltipContent>
          </Tooltip>

          {inMaintenance > 0 && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Badge className="cursor-default border-amber-500/25 bg-amber-500/10 text-amber-700 tabular-nums dark:text-amber-400" />
                }
              >
                <WrenchIcon data-icon="inline-start" /> {inMaintenance}
              </TooltipTrigger>

              <TooltipContent>
                {inMaintenance === 1 ? '1 estação em manutenção' : `${inMaintenance} estações em manutenção`}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      )
    },
  }),
  columnHelper.accessor('inactive', {
    header: 'Status',
    meta: { skeletonClassName: 'h-5 w-20 rounded-full' },
    cell: ({ getValue }) =>
      getValue() ? (
        <Badge variant="destructive">
          <PowerOffIcon data-icon="inline-start" /> Inativa
        </Badge>
      ) : (
        <Badge variant="outline">
          <span className="size-1.5 min-w-1.5 animate-pulse rounded-full bg-emerald-600 text-muted-foreground" />
          Ativa
        </Badge>
      ),
  }),
  columnHelper.accessor('createdAt', {
    header: 'Data da criação',
    meta: { skeletonClassName: 'w-28' },
    cell: ({ getValue }) => {
      const createdAt = parseISO(getValue())

      // O ponto é literal na máscara: o locale pt-BR do date-fns v4 devolve o mês curto sem abreviação
      // gráfica ("ago"), e o painel escreve datas no padrão "23 ago. 2026".
      return isValid(createdAt) ? format(createdAt, 'dd MMM. yyyy', { locale: ptBR }) : '—'
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
