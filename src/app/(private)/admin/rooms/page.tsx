import type { Metadata } from 'next'
import { NewRoom } from './_components/new-room'
import { RoomsTable } from './_components/rooms-table'

export const metadata: Metadata = {
  title: 'Salas',
}

export default function AdminRoomsPage() {
  return (
    <>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-semibold text-primary text-xl tracking-tight">Salas de Liberação</h1>

          <p className="max-w-3xl text-muted-foreground text-sm leading-relaxed">
            Cadastre as salas do atendimento e defina o tempo padrão que cada advogado recebe por dia nelas.
          </p>
        </div>

        <NewRoom />
      </header>

      <RoomsTable />
    </>
  )
}
