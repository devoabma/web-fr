'use client'

import { CalendarRangeIcon } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type YearFilterProps = {
  years: number[]
  value: number
  onValueChange: (year: number) => void
  currentYear: number
}

export function YearFilter({ years, value, onValueChange, currentYear }: YearFilterProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      <Label htmlFor="year" className="text-muted-foreground text-xs uppercase tracking-wider">
        Filtre por ano
      </Label>

      <Select value={String(value)} onValueChange={year => year && onValueChange(Number(year))}>
        <SelectTrigger id="year" className="w-full bg-background px-2.5 shadow-xs">
          <CalendarRangeIcon className="text-muted-foreground" />
          <SelectValue className="font-medium tabular-nums">{(year: string) => year}</SelectValue>
        </SelectTrigger>

        <SelectContent>
          {years.map(year => (
            <SelectItem key={year} value={String(year)} className="py-2">
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate font-medium tabular-nums">{year}</span>
                <span className="line-clamp-2 whitespace-normal text-muted-foreground text-xs">
                  {year === currentYear ? 'Ano em curso, com os meses ainda por vir' : 'Ano fechado'}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
