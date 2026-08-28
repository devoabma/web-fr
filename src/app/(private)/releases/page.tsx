import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { ReleasesNotice } from './_components/releases-notice'
import { ReleasesTable } from './_components/releases-table'

export const metadata: Metadata = {
  title: 'Liberações',
}

export default function ReleasesPage() {
  return (
    <>
      <header className="flex flex-col gap-1">
        <h1 className="font-semibold text-primary text-xl tracking-tight">Histórico de Liberações</h1>

        <p className="max-w-3xl text-muted-foreground text-sm leading-relaxed">
          Consulte todas as sessões já abertas na sala: quem foi liberado, em qual máquina, quanto tempo usou e como a sessão
          terminou.
        </p>
      </header>

      <ReleasesNotice />

      <Suspense fallback={<Skeleton className="h-24 rounded-xl" />}>
        <ReleasesTable />
      </Suspense>
    </>
  )
}
