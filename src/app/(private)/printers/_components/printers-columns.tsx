'use client'

import { createColumnHelper } from '@tanstack/react-table'
import { DoorOpenIcon, ExternalLinkIcon, FileTextIcon, MonitorIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import type { DataTableFeatures } from '@/components/ui/data-table/data-table-features'
import { cn } from '@/lib/utils'
import type { PrinterProps } from '@/server/printers/get-all'

// O fuso é fixo no da Seccional, e não o do navegador: a impressão aconteceu no balcão. Sem isso, a
// impressão das 22h apareceria no dia seguinte para quem estivesse com o relógio em outro fuso.
const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'America/Fortaleza',
})

const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Fortaleza',
})

const columnHelper = createColumnHelper<DataTableFeatures, PrinterProps>()

export const columnsPrinters = columnHelper.columns([
  columnHelper.accessor('lawyer.name', {
    header: 'Advogado(a)',
    meta: { skeletonAnchorClassName: 'rounded-md', skeletonClassName: 'w-40' },
    // Quem imprimiu é a chave da linha: é por nome que o balcão procura quando alguém volta pedindo
    // o arquivo. O ladrilho é neutro — não há estado a sinalizar numa impressão já registrada.
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground">
          <FileTextIcon className="size-4" />
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
  columnHelper.accessor('createdAt', {
    header: 'Impresso em',
    meta: { skeletonClassName: 'w-32' },
    // Data e hora na mesma célula, monoespaçadas pelo `tabular-nums`: a lista é cronológica e o olho
    // desce a coluna procurando um horário, não uma data isolada.
    cell: ({ getValue }) => {
      const printedAt = new Date(getValue())

      const date = dateFormatter.format(printedAt)
      const isToday = date === dateFormatter.format(new Date())

      return (
        <div className="flex items-center gap-2">
          <span className="tabular-nums">
            {date} às {timeFormatter.format(printedAt)}
          </span>

          {isToday && <Badge variant="outline">Hoje</Badge>}
        </div>
      )
    },
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Ações',
    meta: { className: 'text-center', skeletonClassName: 'w-16' },
    cell: ({ row }) => {
      const { fileUrl, lawyer } = row.original

      return (
        <div className="flex items-center justify-center">
          {/* Link de verdade, vestido de botão: o arquivo está no Storage, em outro domínio, então o
              atributo `download` seria ignorado pelo navegador. Abrir em aba nova é a ação honesta —
              de lá o usuário salva, imprime de novo ou copia o endereço. */}
          <a
            href={fileUrl}
            target="_blank"
            rel="noreferrer"
            // Começa com o texto visível, para quem navega por voz pedir "abrir" e acertar; o nome
            // depois é o que diferencia uma linha da outra na lista de links da página.
            aria-label={`Abrir arquivo impresso por ${lawyer.name}`}
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
          >
            <ExternalLinkIcon data-icon="inline-start" />
            Abrir
          </a>
        </div>
      )
    },
  }),
])
