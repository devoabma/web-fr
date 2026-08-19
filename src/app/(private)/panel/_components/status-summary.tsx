import type { ComputerView } from '../_data/computer-view'

type StatusSummaryProps = {
  computers: ComputerView[]
}

/** Contagem por estado: quem chega no balcão quer saber "tem máquina livre?" antes de olhar card por card. */
export function StatusSummary({ computers }: StatusSummaryProps) {
  const available = computers.filter(computer => computer.status === 'available').length
  const inUse = computers.filter(computer => computer.status === 'in-use').length
  const maintenance = computers.filter(computer => computer.status === 'maintenance').length

  return (
    <div className="flex flex-wrap gap-2">
      <span className="flex items-center gap-1.5 rounded-full border border-green-600/25 bg-green-600/10 px-3 py-1.5 font-medium text-green-600 text-xs">
        <span className="size-1.5 min-w-1.5 rounded-full bg-green-600" />
        {available} disponíveis
      </span>

      <span className="flex items-center gap-1.5 rounded-full border border-rose-700/25 bg-rose-700/10 px-3 py-1.5 font-medium text-rose-700 text-xs">
        <span className="size-1.5 min-w-1.5 rounded-full bg-rose-700" />
        {inUse} em uso
      </span>

      <span className="flex items-center gap-1.5 rounded-full border border-slate-500/25 bg-slate-500/10 px-3 py-1.5 font-medium text-slate-500 text-xs">
        <span className="size-1.5 min-w-1.5 rounded-full bg-slate-500" />
        {maintenance} em manutenção
      </span>
    </div>
  )
}
