import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { MetricsByRoomProps } from '@/server/lawyers/get-releases-metrics'
import { buildRoomRanking, formatCount } from '../_data/metrics-view'

type ReleasesByRoomCardProps = {
  className?: string
  data: MetricsByRoomProps[]
  /** Sala escolhida no filtro do topo, para marcá-la dentro do ranking. */
  highlightedRoomId?: string
}

export function ReleasesByRoomCard({ data, highlightedRoomId, className }: ReleasesByRoomCardProps) {
  const rooms = buildRoomRanking(data)

  return (
    <Card className={cn('shrink-0 shadow-xs', className)}>
      <CardHeader>
        <CardTitle className="font-semibold text-base text-primary">Liberações por sala</CardTitle>
        <CardDescription>
          Ranking de utilização no período — sempre entre todas as suas salas, mesmo com uma sala filtrada
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {rooms.map((room, index) => (
          <div key={room.roomId} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <span
                className={cn(
                  'min-w-0 truncate font-medium text-sm',
                  room.roomId === highlightedRoomId ? 'text-primary' : 'text-foreground'
                )}
              >
                {room.name}
              </span>

              <span className="shrink-0 text-muted-foreground text-xs tabular-nums">
                {formatCount(room.total)} · {Math.round(room.share)}%
              </span>
            </div>

            {/* A barra é medida contra a líder, e o percentual ao lado contra o total — uma
                compara salas entre si, o outro responde quanto da operação passa por ali. */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn('h-full rounded-full', index === 0 && room.total > 0 ? 'bg-chart-4' : 'bg-primary/60')}
                style={{ width: `${room.width}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
