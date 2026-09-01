import { formatCount, NO_DATA_MARK } from '../_data/metrics-view'

/** Distância do topo da área do gráfico até a linha de rótulos. */
const LABEL_BASELINE = 12

type ChartValueLabelProps = {
  x?: string | number
  width?: string | number
  index?: number
}

/**
 * Rótulos de valor numa linha fixa no alto do gráfico, e não colados no topo de cada barra.
 *
 * O `position="top"` do recharts acompanha a altura da barra — o que esconde justamente os
 * valores que mais precisam ser lidos: a barra zerada não tem topo onde pousar o rótulo, e o mês
 * que ainda não chegou desapareceria da leitura em vez de mostrar o traço.
 */
export function buildChartValueLabel(values: (number | null)[]) {
  return function ChartValueLabel({ x = 0, width = 0, index = 0 }: ChartValueLabelProps) {
    const value = values[index]

    return (
      <text
        x={Number(x) + Number(width) / 2}
        y={LABEL_BASELINE}
        textAnchor="middle"
        className="fill-muted-foreground text-[11px] tabular-nums"
      >
        {value === null || value === undefined ? NO_DATA_MARK : formatCount(value)}
      </text>
    )
  }
}
