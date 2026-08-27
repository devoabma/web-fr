'use client'

import { CalendarRangeIcon } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export type Period = 'all' | 'today' | 'yesterday' | 'last-7-days'

/**
 * Rótulos num lugar só porque a contagem da toolbar repete o período escolhido em texto corrido
 * ("12 impressões nos últimos 7 dias") — não é mapa de estilo, é a mesma frase em dois lugares.
 */
export const PERIOD_LABELS: Record<Period, string> = {
  all: 'desde a última limpeza',
  today: 'hoje',
  yesterday: 'ontem',
  'last-7-days': 'nos últimos 7 dias',
}

interface PeriodFilterProps {
  value: Period
  onValueChange: (period: Period) => void
}

export function PeriodFilter({ value, onValueChange }: PeriodFilterProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      <Label htmlFor="period" className="text-muted-foreground text-xs uppercase tracking-wider">
        Filtre por período
      </Label>

      <Select value={value} onValueChange={period => period && onValueChange(period as Period)}>
        <SelectTrigger id="period" className="w-full bg-background px-2.5 shadow-xs">
          <CalendarRangeIcon className="text-muted-foreground" />

          <SelectValue className="font-medium">
            {(period: Period) =>
              ({ all: 'Todo o período', today: 'Hoje', yesterday: 'Ontem', 'last-7-days': 'Últimos 7 dias' })[period]
            }
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all" className="py-2">
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate font-medium">Todo o período</span>
              <span className="line-clamp-2 whitespace-normal text-muted-foreground text-xs">
                Tudo o que sobrou desde a última limpeza
              </span>
            </div>
          </SelectItem>

          <SelectItem value="today" className="py-2">
            <span className="font-medium">Hoje</span>
          </SelectItem>

          <SelectItem value="yesterday" className="py-2">
            <span className="font-medium">Ontem</span>
          </SelectItem>

          <SelectItem value="last-7-days" className="py-2">
            <span className="font-medium">Últimos 7 dias</span>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
