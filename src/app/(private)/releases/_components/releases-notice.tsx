import { InfoIcon } from 'lucide-react'

export function ReleasesNotice() {
  return (
    <div className="hidden items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/8 p-4 sm:flex">
      <InfoIcon className="mt-0.5 size-4.5 shrink-0 text-amber-600 dark:text-amber-400" />

      <div className="flex flex-col gap-1.5 text-muted-foreground text-sm leading-relaxed">
        <p>
          Esta tela é o <strong className="font-semibold text-foreground">registro das liberações</strong>: toda sessão aberta
          no painel fica aqui, inclusive as que ainda estão em andamento. Nada é apagado — para liberar ou encerrar uma
          máquina, use o painel de operação.
        </p>

        <p>
          Você enxerga as liberações das{' '}
          <strong className="font-semibold text-foreground">salas em que está vinculado(a).</strong>
        </p>
      </div>
    </div>
  )
}
