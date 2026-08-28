'use client'

import { CalendarRangeIcon } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export type Period = 'all' | 'today' | 'yesterday' | 'last-7-days' | 'last-30-days'

/** Como cada período se chama dentro do seletor — texto curto, que cabe no gatilho. */
export const PERIOD_OPTION_LABELS: Record<Period, string> = {
  all: 'Todo o período',
  today: 'Hoje',
  yesterday: 'Ontem',
  'last-7-days': 'Últimos 7 dias',
  'last-30-days': 'Últimos 30 dias',
}

/**
 * O mesmo período dito em frase corrida, porque a contagem da toolbar repete a escolha em texto
 * ("12 impressões nos últimos 7 dias"). A tela que tenha um "todo o período" mais específico
 * sobrescreve só o `all` — é o caso das impressões, que somem na limpeza semanal.
 */
export const PERIOD_LABELS: Record<Period, string> = {
  all: 'em todo o período',
  today: 'hoje',
  yesterday: 'ontem',
  'last-7-days': 'nos últimos 7 dias',
  'last-30-days': 'nos últimos 30 dias',
}

/** Sem os 30 dias: onde o histórico é semanal, um mês seria uma opção que nunca muda o resultado. */
const DEFAULT_PERIODS: Period[] = ['all', 'today', 'yesterday', 'last-7-days']

interface PeriodFilterProps {
  value: Period
  onValueChange: (period: Period) => void
  /** O que "todo o período" alcança nesta tela — a única opção que precisa se explicar. */
  allPeriodDescription: string
  periods?: Period[]
}

export function PeriodFilter({ value, onValueChange, allPeriodDescription, periods = DEFAULT_PERIODS }: PeriodFilterProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      <Label htmlFor="period" className="text-muted-foreground text-xs uppercase tracking-wider">
        Filtre por período
      </Label>

      <Select value={value} onValueChange={period => period && onValueChange(period as Period)}>
        <SelectTrigger id="period" className="w-full bg-background px-2.5 shadow-xs">
          <CalendarRangeIcon className="text-muted-foreground" />

          <SelectValue className="font-medium">{(period: Period) => PERIOD_OPTION_LABELS[period]}</SelectValue>
        </SelectTrigger>

        <SelectContent>
          {periods.map(period => (
            <SelectItem key={period} value={period} className="py-2">
              {period === 'all' ? (
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate font-medium">{PERIOD_OPTION_LABELS.all}</span>
                  <span className="line-clamp-2 whitespace-normal text-muted-foreground text-xs">{allPeriodDescription}</span>
                </div>
              ) : (
                <span className="font-medium">{PERIOD_OPTION_LABELS[period]}</span>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
