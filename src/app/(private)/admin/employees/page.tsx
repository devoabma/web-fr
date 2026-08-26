import type { Metadata } from 'next'
import { NewEmployee } from './_components/new-employee'

export const metadata: Metadata = {
  title: 'Colaboradores',
}

export default function AdminEmployeesPage() {
  return (
    <>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-semibold text-primary text-xl tracking-tight">Colaboradores</h1>

          <p className="max-w-3xl text-muted-foreground text-sm leading-relaxed">
            Cadastre os colaboradores responsáveis pela gestão e vincule-os às respectivas salas de liberação.
          </p>
        </div>

        <NewEmployee />
      </header>

      {/* <EmployeesTable /> */}
    </>
  )
}
