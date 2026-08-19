import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { ReleasesBoard } from './_components/releases-board'
import { ReleasesNotice } from './_components/releases-notice'

export default function PanelPage() {
  return (
    <>
      <header className="flex flex-col gap-1">
        <h1 className="font-semibold text-primary text-xl tracking-tight">Painel de Liberações</h1>

        <p className="max-w-3xl text-muted-foreground text-sm leading-relaxed">
          Acompanhe as máquinas cadastradas e gerencie salas, computadores e filas de impressão. Tudo no mesmo lugar.
        </p>
      </header>

      <ReleasesNotice />

      {/* O board lê a sala da URL com `useSearchParams`, e sem esta fronteira o build falha
          ao tentar pré-renderizar a página. */}
      <Suspense fallback={<Skeleton className="h-24 rounded-xl" />}>
        <ReleasesBoard />
      </Suspense>
    </>
  )
}
