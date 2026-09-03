'use client'

import { CalendarRangeIcon } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDayKey } from '@/utils/day-key'
import { REPORT_PERIOD_MODES, type ReportPeriod, type ReportPeriodMode } from '../_data/report-period'
import { DateField } from './date-field'

const MODE_LABELS: Record<ReportPeriodMode, string> = {
  dia: 'Dia',
  mes: 'Mês',
  ano: 'Ano',
  intervalo: 'Intervalo',
}

const MONTH_LABELS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

/** Primeiro ano com operação informatizada — a mesma faixa que `resolveReportPeriod` aceita. */
const MIN_YEAR = 2000

/**
 * Anos oferecidos, do corrente para trás.
 *
 * O ano de referência sai do fuso da Seccional, e não de `new Date().getFullYear()`: na virada do
 * ano, quem consultasse de um fuso adiantado veria um ano que a resolução do recorte ainda recusa.
 */
function buildYearOptions() {
  const currentYear = Number(formatDayKey(Date.now()).slice(0, 4))

  return Array.from({ length: currentYear - MIN_YEAR + 1 }, (_, index) => currentYear - index)
}

type ReportPeriodFilterProps = {
  period: ReportPeriod
  onChangeMode: (mode: ReportPeriodMode) => void
  onChangeFrom: (from: string) => void
  onChangeTo: (to: string) => void
}

export function ReportPeriodFilter({ period, onChangeMode, onChangeFrom, onChangeTo }: ReportPeriodFilterProps) {
  const years = buildYearOptions()

  // No modo mês o `from` é `2025-03`; no ano, `2025`. As duas partes alimentam os seletores abaixo.
  const [yearPart, monthPart] = period.from.split('-')

  return (
    <>
      <div className="flex w-full flex-col gap-2">
        <Label htmlFor="period-mode" className="text-muted-foreground text-xs uppercase tracking-wider">
          Recorte
        </Label>

        <Select value={period.mode} onValueChange={mode => mode && onChangeMode(mode as ReportPeriodMode)}>
          <SelectTrigger id="period-mode" className="w-full bg-background px-2.5 shadow-xs">
            <CalendarRangeIcon className="text-muted-foreground" />

            <SelectValue className="font-medium">{(mode: ReportPeriodMode) => MODE_LABELS[mode]}</SelectValue>
          </SelectTrigger>

          <SelectContent>
            {REPORT_PERIOD_MODES.map(mode => (
              <SelectItem key={mode} value={mode} className="py-2">
                <span className="font-medium">{MODE_LABELS[mode]}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {period.mode === 'dia' && <DateField id="period-from" label="Dia" value={period.from} onChange={onChangeFrom} />}

      {/*
        Mês e ano não ganham calendário de propósito: escolher "março de 2025" numa grade de dias
        obrigaria a clicar num dia qualquer para significar o mês inteiro. Os seletores dizem
        exatamente o que o recorte é.
      */}
      {period.mode === 'mes' && (
        <>
          <div className="flex w-full flex-col gap-2">
            <Label htmlFor="period-month" className="text-muted-foreground text-xs uppercase tracking-wider">
              Mês
            </Label>

            <Select value={monthPart ?? ''} onValueChange={month => month && onChangeFrom(`${yearPart}-${month}`)}>
              <SelectTrigger id="period-month" className="w-full bg-background px-2.5 shadow-xs">
                <SelectValue className="font-medium">
                  {(month: string) => MONTH_LABELS[Number(month) - 1] ?? 'Escolha o mês'}
                </SelectValue>
              </SelectTrigger>

              <SelectContent>
                {MONTH_LABELS.map((monthLabel, index) => (
                  <SelectItem key={monthLabel} value={String(index + 1).padStart(2, '0')} className="py-2">
                    <span className="font-medium">{monthLabel}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <YearSelect years={years} value={yearPart ?? ''} onValueChange={year => onChangeFrom(`${year}-${monthPart}`)} />
        </>
      )}

      {period.mode === 'ano' && <YearSelect years={years} value={period.from} onValueChange={onChangeFrom} />}

      {period.mode === 'intervalo' && (
        <>
          <DateField id="period-from" label="De" value={period.from} onChange={onChangeFrom} />
          <DateField id="period-to" label="Até" value={period.to} onChange={onChangeTo} />
        </>
      )}
    </>
  )
}

type YearSelectProps = {
  years: number[]
  value: string
  onValueChange: (year: string) => void
}

function YearSelect({ years, value, onValueChange }: YearSelectProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      <Label htmlFor="period-year" className="text-muted-foreground text-xs uppercase tracking-wider">
        Ano
      </Label>

      <Select value={value} onValueChange={year => year && onValueChange(year)}>
        <SelectTrigger id="period-year" className="w-full bg-background px-2.5 shadow-xs">
          <SelectValue className="font-medium tabular-nums">{(year: string) => year}</SelectValue>
        </SelectTrigger>

        <SelectContent>
          {years.map(year => (
            <SelectItem key={year} value={String(year)} className="py-2">
              <span className="font-medium tabular-nums">{year}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
