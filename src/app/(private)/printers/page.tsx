import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { PrintersNotice } from './_components/printers-notice'
import { PrintersTable } from './_components/printers-table'

export const metadata: Metadata = {
  title: 'Impressões',
}

export default function PrintersPage() {
  return (
    <>
      <header className="flex flex-col gap-1">
        <h1 className="font-semibold text-primary text-xl tracking-tight">Painel de Impressões</h1>

        <p className="max-w-3xl text-muted-foreground text-sm leading-relaxed">
          Acompanhe as máquinas cadastradas e gerencie salas, computadores e filas de impressão. Tudo no mesmo lugar.
        </p>
      </header>

      <PrintersNotice />

      <Suspense fallback={<Skeleton className="h-24 rounded-xl" />}>
        <PrintersTable />
      </Suspense>
    </>
  )
}
