'use client'

import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { RoomProps } from '@/server/rooms/get-all'
import { getInitials } from '@/utils'

/** Acima disso a fileira encosta no Select no desktop; o excedente vira contador com a lista no tooltip. */
const MAX_VISIBLE_AVATARS = 4

type RoomEmployeesProps = {
  employeesRooms: RoomProps['employeesRooms']
}

export function RoomEmployees({ employeesRooms }: RoomEmployeesProps) {
  // A API devolve o vínculo, não o funcionário: um mesmo nome pode aparecer duas vezes se houver
  // dois registros para a mesma pessoa. O Map mantém um avatar por `id`.
  const employees = [...new Map(employeesRooms.map(({ employees }) => [employees.id, employees])).values()]

  if (employees.length === 0) return null

  const visibleEmployees = employees.slice(0, MAX_VISIBLE_AVATARS)
  const hiddenEmployees = employees.slice(MAX_VISIBLE_AVATARS)

  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground text-xs">Colaboradores</span>

      <AvatarGroup>
        {visibleEmployees.map(employee => (
          <Tooltip key={employee.id}>
            <TooltipTrigger render={<Avatar size="sm" role="img" aria-label={employee.name} />}>
              {employee.imageUrl && <AvatarImage src={employee.imageUrl} alt={employee.name} />}

              <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
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
    </div>
  )
}
