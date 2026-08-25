import type { Metadata } from 'next'
import { ComputersTable } from './_components/computers-table'
import { NewComputer } from './_components/new-computer'

export const metadata: Metadata = {
  title: 'Computadores',
}

export default function AdminComputersPage() {
  return (
    <>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-semibold text-primary text-xl tracking-tight">Computadores de Liberação</h1>

          <p className="max-w-3xl text-muted-foreground text-sm leading-relaxed">
            Cadastre as máquinas de cada sala. É pelo código MAC que o Desktop pede a liberação do advogado.
          </p>
        </div>

        <NewComputer />
      </header>

      <ComputersTable />
    </>
  )
}
