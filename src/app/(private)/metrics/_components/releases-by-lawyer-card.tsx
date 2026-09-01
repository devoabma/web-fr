'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { MetricsByLawyerProps } from '@/server/lawyers/get-releases-metrics'
import { buildLawyerRanking, formatCount } from '../_data/metrics-view'
import { LawyerRankingRow } from './lawyer-ranking-row'
import { LawyersRankingDrawer } from './lawyers-ranking-drawer'

/** Quantos cabem no card sem transformá-lo numa tabela — o resto vive no painel lateral. */
const TOP_LAWYERS = 10

type ReleasesByLawyerCardProps = {
  className?: string
  data: MetricsByLawyerProps[]
  oabUf: string | null
  year: number
}

export function ReleasesByLawyerCard({ data, oabUf, year, className }: ReleasesByLawyerCardProps) {
  const [isRankingOpen, setIsRankingOpen] = useState(false)

  // O ranking é montado sobre a lista inteira de propósito: fatiar antes faria a barra do
  // décimo colocado ser medida contra ele mesmo, e todo mundo apareceria com a barra cheia.
  const ranking = buildLawyerRanking(data)
  const topLawyers = ranking.slice(0, TOP_LAWYERS)
  const hasMore = ranking.length > TOP_LAWYERS

  return (
    <>
      <Card className={cn('shrink-0 shadow-xs', className)}>
        <CardHeader>
          <CardTitle className="font-semibold text-base text-primary">Liberações por advogado</CardTitle>
          <CardDescription>
            {hasMore ? `${TOP_LAWYERS} maiores utilizadores do período` : 'Utilizadores do período'}
          </CardDescription>

          {hasMore && (
            <CardAction>
              <Button variant="ghost" size="sm" className="text-chart-4" onClick={() => setIsRankingOpen(true)}>
                Ver todos
              </Button>
            </CardAction>
          )}
        </CardHeader>

        <CardContent>
          <ul className="divide-y">
            {topLawyers.map(lawyer => (
              <LawyerRankingRow key={lawyer.lawyerId} lawyer={lawyer} oabUf={oabUf} />
            ))}
          </ul>

          {hasMore && (
            <p className="pt-3 text-muted-foreground text-xs">
              Mais {formatCount(ranking.length - TOP_LAWYERS)} advogados fora desta lista.
            </p>
          )}
        </CardContent>
      </Card>

      <LawyersRankingDrawer open={isRankingOpen} onOpenChange={setIsRankingOpen} lawyers={ranking} oabUf={oabUf} year={year} />
    </>
  )
}
