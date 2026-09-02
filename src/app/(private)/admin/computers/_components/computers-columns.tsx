'use client'

import { createColumnHelper } from '@tanstack/react-table'
import { format, isValid, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { MonitorIcon, WrenchIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { DataTableFeatures } from '@/components/ui/data-table/data-table-features'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { ComputerWithRoomProps } from '@/server/computers/get-all'
import { DeleteComputer } from './delete-computer'
import { UpdateComputer } from './update-computer'
import { UpdateComputerApp } from './update-computer-app'

const columnHelper = createColumnHelper<DataTableFeatures, ComputerWithRoomProps>()

export const columnsComputers = columnHelper.columns([
  columnHelper.accessor('number', {
    header: 'Estação',
    meta: { skeletonAnchorClassName: 'rounded-md', skeletonClassName: 'w-32' },
    // Número e descrição eram duas colunas e viraram uma célula, como o nome e o e-mail do colaborador:
    // ninguém procura "COMPUTADOR 03" sem antes achar a estação, e separá-los fazia o olho pular de uma
    // ponta à outra da linha. O ladrilho é neutro de propósito — o estado da máquina é a coluna Status,
    // e pintá-lo aqui seria dizer a mesma coisa duas vezes.
    cell: ({ row }) => {
      const { number, description } = row.original

      return (
        <div className="flex items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground">
            <MonitorIcon className="size-4" />
          </span>

          <div className="flex flex-col">
            {/* Mesmo rótulo do painel de operação: o balconista procura por "ESTAÇÃO-01", não por "1". */}
            <span className="font-medium tabular-nums leading-tight">ESTAÇÃO-{String(number).padStart(2, '0')}</span>

            <span className="text-muted-foreground text-xs leading-tight">{description}</span>
          </div>
        </div>
      )
    },
  }),
  columnHelper.accessor('room.name', {
    header: 'Sala vinculada',
    meta: { skeletonClassName: 'w-28' },
  }),
  columnHelper.accessor('macCode', {
    header: 'Código MAC',
    meta: { skeletonClassName: 'w-40' },
    // É a chave que casa a máquina física com o Desktop: o app se registra no WebSocket por ela, e o
    // servidor casa byte a byte. Por isso vira ficha monoespaçada em vez de texto corrido — é `font-mono`,
    // e não `tabular-nums`, porque MAC tem letra além de número e só a monoespaçada alinha a coluna
    // inteira para conferir caractere a caractere.
    //
    // Exibido **verbatim**: a api-fr guarda o campo como string opaca e única, sem formato imposto. Um
    // `uppercase` cosmético mostraria na tela algo diferente do que está gravado, e é justamente aqui
    // que alguém compara com a configuração da estação para achar por que ela não conecta.
    cell: ({ getValue }) => (
      <span className="inline-flex items-center rounded-md border bg-muted/40 px-2 py-1 font-mono text-foreground text-xs">
        {getValue()}
      </span>
    ),
  }),
  columnHelper.accessor('appVersion', {
    header: 'Desktop',
    meta: { skeletonClassName: 'w-14 rounded-full' },
    // Companheira do MAC: o código diz com qual máquina o Desktop deveria falar, esta coluna diz se ele
    // chegou a falar. Estação cadastrada e sem versão é o sintoma de instalação que nunca subiu.
    cell: ({ row }) => {
      const { appVersion, appVersionReportedAt } = row.original

      if (!appVersion) {
        return (
          <Tooltip>
            <TooltipTrigger render={<span className="cursor-default text-muted-foreground">—</span>} />

            {/* Não é erro: ou a estação não conectou desde que a api-fr passou a guardar, ou o envio
                está desligado na configuração local dela. */}
            <TooltipContent>Esta estação nunca informou a versão</TooltipContent>
          </Tooltip>
        )
      }

      const reportedAt = appVersionReportedAt ? parseISO(appVersionReportedAt) : null

      return (
        <Tooltip>
          <TooltipTrigger render={<Badge variant="outline" className="cursor-default font-mono tabular-nums" />}>
            v{appVersion}
          </TooltipTrigger>

          {/* O carimbo é de quando ela se apresentou, não de quando esteve online: a versão só viaja no
              `register` do WebSocket, então máquina que não cai há semanas mostra data antiga estando no ar. */}
          <TooltipContent>
            {reportedAt && isValid(reportedAt)
              ? `Informada em ${format(reportedAt, "dd MMM. yyyy 'às' HH:mm", { locale: ptBR })}`
              : 'Versão do aplicativo nesta estação'}
          </TooltipContent>
        </Tooltip>
      )
    },
  }),
  columnHelper.accessor('maintenance', {
    header: 'Status',
    meta: { skeletonClassName: 'w-16 rounded-full' },
    // Manutenção vence `inUse`: máquina fora de operação com a flag travada não pode aparecer como
    // ocupada, senão o balconista tenta encerrar uma sessão que não existe.
    cell: ({ row }) => {
      const { maintenance, inUse } = row.original

      if (maintenance) {
        return (
          <Badge variant="destructive">
            <WrenchIcon data-icon="inline-start" /> Manutenção
          </Badge>
        )
      }

      return (
        <Badge variant="outline">
          <span className={cn('size-1.5 min-w-1.5 animate-pulse rounded-full', inUse ? 'bg-rose-700' : 'bg-emerald-600')} />
          {inUse ? 'Em uso' : 'Disponível'}
        </Badge>
      )
    },
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
    meta: { className: 'text-center', skeletonClassName: 'w-14' },
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-1">
        {/* Primeiro na fila de propósito: é a única ação da linha que aparece sozinha, sem ninguém
            pedir, e some quando a máquina está em dia. Vindo antes, o olho a encontra no lugar em
            que ela apareceu — e não empurra as outras duas de posição quando desaparece. */}
        <UpdateComputerApp computer={row.original} />

        <UpdateComputer computer={row.original} />

        <DeleteComputer computer={row.original} />
      </div>
    ),
  }),
])
