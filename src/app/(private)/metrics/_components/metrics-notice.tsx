import { InfoIcon } from 'lucide-react'

export function MetricsNotice() {
  return (
    <div className="hidden shrink-0 items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/8 p-4 sm:flex">
      <InfoIcon className="mt-0.5 size-4.5 shrink-0 text-amber-600 dark:text-amber-400" />

      <div className="flex flex-col gap-1.5 text-muted-foreground text-sm leading-relaxed">
        <p>
          Os números são <strong className="font-semibold text-foreground">um retrato do período escolhido</strong> e mudam
          conforme as liberações acontecem — use-os para acompanhar a demanda, não como registro oficial.
        </p>

        <p>
          Você enxerga apenas as <strong className="font-semibold text-foreground">salas em que está vinculado(a).</strong>
        </p>
      </div>
    </div>
  )
}
