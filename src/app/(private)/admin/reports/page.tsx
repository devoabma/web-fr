import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { ReportsBoard } from './_components/reports-board'
import { ReportsNotice } from './_components/reports-notice'

export const metadata: Metadata = {
  title: 'Relatórios',
}

export default function AdminReportsPage() {
  return (
    <>
      <header className="flex shrink-0 flex-col gap-1">
        <h1 className="font-semibold text-primary text-xl tracking-tight">Relatórios</h1>

        <p className="max-w-3xl text-muted-foreground text-sm leading-relaxed">
          Gere os fechamentos do atendimento por dia, mês, ano ou intervalo — quais advogados usaram cada sala, como o movimento
          se distribui entre elas e quem mais recorre ao serviço. Exportáveis em Excel e PDF.
        </p>
      </header>

      <ReportsNotice />

      <Suspense fallback={<Skeleton className="h-24 shrink-0 rounded-xl" />}>
        <ReportsBoard />
      </Suspense>
    </>
  )
}
