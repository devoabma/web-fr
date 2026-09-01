import type { Metadata } from 'next'
import { ReportsNotice } from './_components/reports-notice'

export const metadata: Metadata = {
  title: 'Relatórios',
}

export default function AdminReportsPage() {
  return (
    <>
      <header className="flex flex-col gap-1">
        <h1 className="font-semibold text-primary text-xl tracking-tight">Relatórios</h1>

        <p className="max-w-3xl text-muted-foreground text-sm leading-relaxed">
          Gere os fechamentos do atendimento — liberações, tempo consumido e impressões — por período, sala e colaborador.
        </p>
      </header>

      <ReportsNotice />

      <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed p-6 text-center text-muted-foreground text-sm">
        Os relatórios desta tela ainda estão sendo construídos.
      </div>
    </>
  )
}
