'use client'

import { CircleDotIcon } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RELEASE_STATUS_LABELS, type ReleaseStatus } from '../_data/release-view'

/** Como o filtro por sala, "todas" é um valor de mentira: ele nunca vira consulta, só limpa o filtro. */
export const ALL_STATUSES = 'all'

export type StatusFilterValue = typeof ALL_STATUSES | ReleaseStatus

const STATUS_DESCRIPTIONS: Record<ReleaseStatus, string> = {
  'in-progress': 'Alguém está na máquina agora',
  exhausted: 'Usou a cota inteira da sala',
  closed: 'Encerrada no balcão antes do tempo',
}

const STATUSES: ReleaseStatus[] = ['in-progress', 'exhausted', 'closed']

interface StatusFilterProps {
  value: StatusFilterValue
  onValueChange: (status: StatusFilterValue) => void
}

export function StatusFilter({ value, onValueChange }: StatusFilterProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      <Label htmlFor="status" className="text-muted-foreground text-xs uppercase tracking-wider">
        Filtre por situação
      </Label>

      <Select value={value} onValueChange={status => status && onValueChange(status as StatusFilterValue)}>
        <SelectTrigger id="status" className="w-full bg-background px-2.5 shadow-xs">
          <CircleDotIcon className="text-muted-foreground" />

          <SelectValue className="font-medium">
            {(status: StatusFilterValue) =>
              status === ALL_STATUSES ? 'Todas as situações' : RELEASE_STATUS_LABELS[status]
            }
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          <SelectItem value={ALL_STATUSES} className="py-2">
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate font-medium">Todas as situações</span>
              <span className="line-clamp-2 whitespace-normal text-muted-foreground text-xs">
                Abertas e encerradas, do jeito que aconteceram
              </span>
            </div>
          </SelectItem>

          {STATUSES.map(status => (
            <SelectItem key={status} value={status} className="py-2">
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate font-medium">{RELEASE_STATUS_LABELS[status]}</span>
                <span className="line-clamp-2 whitespace-normal text-muted-foreground text-xs">
                  {STATUS_DESCRIPTIONS[status]}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
