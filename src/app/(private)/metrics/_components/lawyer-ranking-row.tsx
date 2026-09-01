import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { formatCount, formatOab, type RankedLawyer } from '../_data/metrics-view'

/** Do quarto lugar em diante a barra deixa de ser destaque e vira só referência de tamanho. */
const HIGHLIGHTED_POSITIONS = 3

type LawyerRankingRowProps = {
  lawyer: RankedLawyer
  /** Sigla da seccional, quando todas as salas visíveis são da mesma UF. */
  oabUf: string | null
}

export function LawyerRankingRow({ lawyer, oabUf }: LawyerRankingRowProps) {
  const isHighlighted = lawyer.position <= HIGHLIGHTED_POSITIONS

  return (
    <li className="flex items-center gap-3 py-2.5">
      <span className="w-6 shrink-0 text-muted-foreground text-xs tabular-nums">{String(lawyer.position).padStart(2, '0')}</span>

      <Avatar>
        <AvatarFallback className={cn('font-medium text-xs', isHighlighted && 'bg-chart-4/15 text-chart-4')}>
          {lawyer.initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-medium text-sm">{lawyer.name}</span>
        <span className="truncate text-muted-foreground text-xs tabular-nums">{formatOab(lawyer.oab, oabUf)}</span>
      </div>

      <div className="hidden h-1.5 w-24 shrink-0 overflow-hidden rounded-full bg-muted sm:block">
        <div
          className={cn('h-full rounded-full', isHighlighted ? 'bg-chart-4' : 'bg-primary/60')}
          style={{ width: `${lawyer.width}%` }}
        />
      </div>

      <span className="w-10 shrink-0 text-right font-semibold text-sm tabular-nums">{formatCount(lawyer.total)}</span>
    </li>
  )
}
