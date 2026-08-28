'use client'

import { createColumnHelper } from '@tanstack/react-table'
import { DoorOpenIcon, MonitorIcon, UserRoundIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { DataTableFeatures } from '@/components/ui/data-table/data-table-features'
import { cn } from '@/lib/utils'
import { RELEASE_STATUS_LABELS, type ReleaseStatus, type ReleaseView } from '../_data/release-view'

// O fuso é fixo no da Seccional, e não o do navegador: a liberação aconteceu no balcão. Sem isso, a
// sessão das 22h apareceria no dia seguinte para quem estivesse com o relógio em outro fuso.
const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'America/Fortaleza',
})

const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Fortaleza',
})

/**
 * `23 ago. 2026` — a mesma máscara de Salas e Computadores, para a data se ler igual em todo o painel.
 * Lá o `date-fns` monta isso direto; aqui o formatador precisa continuar sendo o do `Intl`, que é quem
 * aceita o fuso fixo, e ele intercala " de " entre as partes ("23 de ago. de 2026") — por isso os
 * literais caem fora e sobram dia, mês e ano.
 */
function formatDate(date: Date) {
  return dateFormatter
    .formatToParts(date)
    .filter(part => part.type !== 'literal')
    .map(part => part.value)
    .join(' ')
}

/** `01h:12min` — o mesmo formato do card do painel, para quem cruza as duas telas ler o mesmo número. */
function formatMinutesAsClock(totalMinutes: number) {
  const safeMinutes = Math.max(0, Math.floor(totalMinutes))

  const hours = Math.floor(safeMinutes / 60)
  const minutes = safeMinutes % 60

  return `${String(hours).padStart(2, '0')}h:${String(minutes).padStart(2, '0')}min`
}

/**
 * A mesma paleta tri-estado do painel de operação: quem está na máquina agora é a cor da sala ocupada,
 * o tempo esgotado é o âmbar do aviso, e a sessão encerrada no balcão é neutra — não houve nada a
 * sinalizar nela.
 */
const STATUS_BADGE_CLASSNAMES: Record<ReleaseStatus, string> = {
  'in-progress': 'border-rose-700/25 bg-rose-700/10 text-rose-700',
  exhausted: 'border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400',
  closed: 'border-slate-500/25 bg-slate-500/10 text-slate-500',
}

const columnHelper = createColumnHelper<DataTableFeatures, ReleaseView>()

export const columnsReleases = columnHelper.columns([
  columnHelper.accessor('lawyer.name', {
    header: 'Advogado(a)',
    meta: { skeletonAnchorClassName: 'rounded-full', skeletonClassName: 'w-40' },
    // Quem foi liberado é a chave da linha: é por nome que se confere uma reclamação de "não consegui
    // usar" ou se levanta quantas vezes alguém sentou na sala.
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full border bg-muted text-muted-foreground">
          <UserRoundIcon className="size-4" />
        </span>

        <span className="font-medium leading-tight">{row.original.lawyer.name}</span>
      </div>
    ),
  }),
  columnHelper.accessor('room.name', {
    header: 'Sala',
    meta: { skeletonClassName: 'w-28' },
    cell: ({ getValue }) => (
      <span className="inline-flex items-center gap-2">
        <DoorOpenIcon className="size-4 shrink-0 text-muted-foreground" />
        {getValue()}
      </span>
    ),
  }),
  columnHelper.accessor('computer.description', {
    header: 'Computador',
    meta: { skeletonClassName: 'w-32' },
    cell: ({ getValue }) => (
      <span className="inline-flex items-center gap-2 text-muted-foreground">
        <MonitorIcon className="size-4 shrink-0" />
        {getValue()}
      </span>
    ),
  }),
  columnHelper.accessor('startDate', {
    header: 'Liberado em',
    meta: { skeletonClassName: 'w-32' },
    // Data e hora na mesma célula, monoespaçadas pelo `tabular-nums`: a lista é cronológica e o olho
    // desce a coluna procurando um horário, não uma data isolada.
    cell: ({ getValue }) => {
      const startedAt = new Date(getValue())

      const date = formatDate(startedAt)
      const isToday = date === formatDate(new Date())

      return (
        <div className="flex items-center gap-2">
          <span className="tabular-nums">
            {date} às {timeFormatter.format(startedAt)}
          </span>

          {isToday && <Badge variant="outline">Hoje</Badge>}
        </div>
      )
    },
  }),
  columnHelper.accessor('usedMinutes', {
    header: 'Duração',
    meta: { skeletonClassName: 'w-24' },
    // Duração e cota lado a lado: sozinho, "01h:07min" não diz se a pessoa usou pouco ou usou tudo —
    // e a cota é por sala, então o mesmo número significa coisas diferentes em salas diferentes.
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5 tabular-nums">
        <span className="font-medium leading-tight">{formatMinutesAsClock(row.original.usedMinutes)}</span>

        <span className="text-muted-foreground text-xs leading-tight">
          de {formatMinutesAsClock(row.original.room.standardTime)}
        </span>
      </div>
    ),
  }),
  columnHelper.accessor('status', {
    header: 'Situação',
    meta: { skeletonClassName: 'w-24' },
    cell: ({ row }) => {
      const { status, endDate } = row.original

      return (
        <div className="flex flex-col items-start gap-1">
          <Badge variant="outline" className={cn(STATUS_BADGE_CLASSNAMES[status])}>
            {RELEASE_STATUS_LABELS[status]}
          </Badge>

          {/* O horário do fim mora aqui em vez de virar coluna: só a linha encerrada tem um, e uma
              coluna inteira com traço na maioria das linhas custa espaço sem responder nada. */}
          {!!endDate && (
            <span className="text-muted-foreground text-xs tabular-nums">às {timeFormatter.format(new Date(endDate))}</span>
          )}
        </div>
      )
    },
  }),
])
