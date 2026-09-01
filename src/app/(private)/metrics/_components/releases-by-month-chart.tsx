'use client'

import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { type ChartConfig, ChartContainer } from '@/components/ui/chart'
import { cn } from '@/lib/utils'
import type { MetricsByMonthProps } from '@/server/lawyers/get-releases-metrics'
import { buildMonthSeries } from '../_data/metrics-view'
import { buildChartValueLabel } from './chart-value-label'

const chartConfig = {
  value: { label: 'Liberações' },
} satisfies ChartConfig

type ReleasesByMonthChartProps = {
  className?: string
  data: MetricsByMonthProps[]
  year: number
}

export function ReleasesByMonthChart({ data, year, className }: ReleasesByMonthChartProps) {
  const series = buildMonthSeries(data)

  // O mês de maior movimento é o que a leitura procura primeiro; destacá-lo poupa a comparação
  // visual entre doze barras quase iguais.
  const peak = series.reduce((accumulator, point) => Math.max(accumulator, point.total ?? 0), 0)

  return (
    <Card className={cn('shrink-0 shadow-xs', className)}>
      <CardHeader>
        <CardTitle className="font-semibold text-base text-primary">Liberações por mês</CardTitle>
        <CardDescription>Distribuição mensal em {year}</CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-60 w-full">
          <BarChart data={series} margin={{ top: 24 }} accessibilityLayer>
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />

            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} interval={0} />

            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={44} minPointSize={2} isAnimationActive={false}>
              {series.map(point => (
                <Cell
                  key={point.month}
                  className={
                    point.total !== null && point.total === peak && peak > 0 ? 'fill-chart-4' : 'fill-muted-foreground/25'
                  }
                />
              ))}

              {/* Mês que ainda não chegou mostra o traço, não "0": zero afirmaria que ninguém usou. */}
              <LabelList dataKey="value" content={buildChartValueLabel(series.map(point => point.total))} />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
