'use client'

import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { type ChartConfig, ChartContainer } from '@/components/ui/chart'
import { cn } from '@/lib/utils'
import type { MetricsByYearProps } from '@/server/lawyers/get-releases-metrics'
import { buildChartValueLabel } from './chart-value-label'

const chartConfig = {
  total: { label: 'Liberações' },
} satisfies ChartConfig

type ReleasesByYearChartProps = {
  className?: string
  data: MetricsByYearProps[]
  /** Ano em foco na tela — é ele que ganha destaque entre as barras. */
  selectedYear: number
}

export function ReleasesByYearChart({ data, selectedYear, className }: ReleasesByYearChartProps) {
  return (
    <Card className={cn('shrink-0 shadow-xs', className)}>
      <CardHeader>
        <CardTitle className="font-semibold text-base text-primary">Liberações por ano</CardTitle>
        <CardDescription>Total consolidado de todas as salas</CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-60 w-full">
          <BarChart data={data} margin={{ top: 24 }} accessibilityLayer>
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />

            <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={8} />

            <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={72} minPointSize={2} isAnimationActive={false}>
              {data.map(item => (
                <Cell key={item.year} className={item.year === selectedYear ? 'fill-chart-4' : 'fill-muted-foreground/25'} />
              ))}

              <LabelList dataKey="total" content={buildChartValueLabel(data.map(item => item.total))} />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
