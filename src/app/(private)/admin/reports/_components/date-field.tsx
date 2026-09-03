'use client'

import { ptBR } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const displayFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

/**
 * Converte a chave de dia (`2025-03-12`) no `Date` que o calendário entende.
 *
 * O `Date` é montado **local**, com `new Date(ano, mês, dia)`, e não por `new Date('2025-03-12')`:
 * a string ISO seca é interpretada como meia-noite **UTC**, e num fuso a oeste ela retrocede para o
 * dia anterior — o calendário abriria marcando 11 de março para quem escolheu 12.
 */
function parseDayKey(value: string) {
  const [year, month, day] = value.split('-').map(Number)

  if (!year || !month || !day) return undefined

  return new Date(year, month - 1, day)
}

/** O caminho de volta, pelas partes locais do `Date` — mesma razão do `parseDayKey`. */
function toDayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

type DateFieldProps = {
  id: string
  label: string
  /** Chave de dia, `2025-03-12`. */
  value: string
  onChange: (dayKey: string) => void
}

export function DateField({ id, label, value, onChange }: DateFieldProps) {
  const [open, setOpen] = useState(false)

  const selected = parseDayKey(value)

  return (
    <div className="flex w-full flex-col gap-2">
      <Label htmlFor={id} className="text-muted-foreground text-xs uppercase tracking-wider">
        {label}
      </Label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              id={id}
              variant="outline"
              // `font-normal` e `justify-start` para o gatilho ler como campo de formulário, e não
              // como botão de ação — ele fica lado a lado com os `Select` da mesma barra.
              className="w-full justify-start bg-background px-2.5 font-normal shadow-xs"
            >
              <CalendarIcon className="text-muted-foreground" />
              {selected ? displayFormatter.format(selected) : 'Escolha a data'}
            </Button>
          }
        />

        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selected}
            defaultMonth={selected}
            // `captionLayout="dropdown"` troca o "março de 2025" fixo por seletores de mês e ano:
            // sem eles, chegar a um relatório de dois anos atrás custa 24 cliques na seta.
            captionLayout="dropdown"
            locale={ptBR}
            onSelect={date => {
              if (!date) return

              onChange(toDayKey(date))
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
