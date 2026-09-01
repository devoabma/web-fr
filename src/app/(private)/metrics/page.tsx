import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { MetricsBoard } from './_components/metrics-board'
import { MetricsNotice } from './_components/metrics-notice'

export const metadata: Metadata = {
  title: 'Métricas',
}

export default function MetricsPage() {
  return (
    <>
      <header className="flex shrink-0 flex-col gap-1">
        <h1 className="font-semibold text-primary text-xl tracking-tight">Métricas de Liberações</h1>

        <p className="max-w-3xl text-muted-foreground text-sm leading-relaxed">
          Acompanhe a demanda pelas salas: quantas liberações aconteceram em cada ano e mês, quais salas concentram o uso e quais
          advogados mais recorrem ao serviço.
        </p>
      </header>

      <MetricsNotice />

      <Suspense fallback={<Skeleton className="h-24 shrink-0 rounded-xl" />}>
        <MetricsBoard />
      </Suspense>
    </>
  )
}
