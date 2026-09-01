import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatDelta, type MetricDelta } from '../_data/metrics-view'

type MetricKpiCardProps = {
  label: string
  value: string
  /** `null` quando não há ano anterior com que comparar — o card simplesmente omite a variação. */
  delta: MetricDelta | null
  caption: string
}

export function MetricKpiCard({ label, value, delta, caption }: MetricKpiCardProps) {
  return (
    <Card className="shadow-xs">
      <CardContent className="flex flex-col gap-1">
        <span className="text-muted-foreground text-xs uppercase tracking-wider">{label}</span>

        <div className="flex flex-wrap items-baseline gap-2">
          <strong className="font-semibold text-2xl text-primary tabular-nums tracking-tight">{value}</strong>

          {!!delta && (
            <span
              className={cn(
                'font-medium text-xs tabular-nums',
                delta.direction === 'up' && 'text-green-600',
                delta.direction === 'down' && 'text-rose-700',
                delta.direction === 'flat' && 'text-muted-foreground'
              )}
            >
              {formatDelta(delta)}
            </span>
          )}
        </div>

        <span className="text-muted-foreground text-xs leading-relaxed">{caption}</span>
      </CardContent>
    </Card>
  )
}
