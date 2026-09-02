'use client'

import { useQuery } from '@tanstack/react-query'
import { TriangleAlertIcon } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import { queryKeys } from '@/constants/query-keys'
import { getReleasesMetrics } from '@/server/lawyers/get-releases-metrics'
import { getAllRooms, type RoomProps } from '@/server/rooms/get-all'
import { formatMinutes } from '@/utils'
import { ALL_ROOMS, RoomFilter } from '../../_components/shared/filters/room-filter'
import { buildDelta, buildEmptyMessage, buildYearOptions, formatCount, resolveOabUf } from '../_data/metrics-view'
import { MetricKpiCard } from './metric-kpi-card'
import { ReleasesByLawyerCard } from './releases-by-lawyer-card'
import { ReleasesByMonthChart } from './releases-by-month-chart'
import { ReleasesByRoomCard } from './releases-by-room-card'
import { ReleasesByYearChart } from './releases-by-year-chart'
import { YearFilter } from './year-filter'

export function MetricsBoard() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentYear = new Date().getFullYear()

  const {
    data: roomsData,
    isPending: isPendingRooms,
    isError: isErrorRooms,
  } = useQuery({
    queryKey: queryKeys.getRooms(),
    queryFn: getAllRooms,
  })

  // A sala inativa continua na lista: ela saiu de operação, mas as liberações que aconteceram
  // nela continuam contando no histórico.
  const rooms = roomsData?.rooms ?? []

  // Sala e ano moram na URL porque os dois definem *o que* a api-fr agrega — a tela precisa ser
  // recarregável e compartilhável. Um `?sala=` de sala que o funcionário não enxerga cai em "todas".
  const selectedRoomId = rooms.find(room => room.id === searchParams.get('sala'))?.id
  const selectedYear = parseYearParam(searchParams.get('ano'), currentYear)

  const {
    data: metricsData,
    isPending: isPendingMetrics,
    isError: isErrorMetrics,
  } = useQuery({
    queryKey: queryKeys.getReleasesMetrics(selectedRoomId, selectedYear),
    queryFn: () => getReleasesMetrics(selectedRoomId, selectedYear),
    // Espera as salas para não disparar uma consulta com a sala errada e refazer tudo em seguida.
    enabled: !isPendingRooms,
  })

  function handleSelectRoom(roomId: string) {
    const params = new URLSearchParams(searchParams)

    if (roomId === ALL_ROOMS) {
      params.delete('sala')
    } else {
      params.set('sala', roomId)
    }

    pushParams(params)
  }

  function handleSelectYear(year: number) {
    const params = new URLSearchParams(searchParams)

    if (year === currentYear) {
      params.delete('ano')
    } else {
      params.set('ano', String(year))
    }

    pushParams(params)
  }

  function pushParams(params: URLSearchParams) {
    const query = params.toString()

    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  if (isErrorRooms) {
    return (
      <section className="shrink-0 rounded-xl border bg-card p-4 shadow-xs">
        <p className="text-muted-foreground text-sm">
          Não foi possível carregar as salas agora. Atualize a página em alguns instantes.
        </p>
      </section>
    )
  }

  if (isPendingRooms || isPendingMetrics) {
    return <MetricsSkeleton />
  }

  if (isErrorMetrics) {
    return (
      <>
        <MetricsToolbar
          rooms={rooms}
          selectedRoomId={selectedRoomId}
          selectedYear={selectedYear}
          currentYear={currentYear}
          years={buildYearOptions([], currentYear, selectedYear)}
          onSelectRoom={handleSelectRoom}
          onSelectYear={handleSelectYear}
        />

        <section className="shrink-0 rounded-xl border bg-card p-4 shadow-xs">
          <p className="text-muted-foreground text-sm">
            Não foi possível calcular os indicadores agora. Atualize a página em alguns instantes.
          </p>
        </section>
      </>
    )
  }

  const { metrics } = metricsData
  const { kpis } = metrics

  const years = buildYearOptions(
    metrics.byYear.map(({ year }) => year),
    currentYear,
    selectedYear
  )

  // `byYear` cobre todo o histórico visível, então ele é quem sabe se existe algum registro —
  // um ano vazio não significa base vazia.
  const hasAnyHistory = metrics.byYear.length > 0
  const hasDataInYear = kpis.totalReleases > 0

  const oabUf = resolveOabUf(rooms.map(room => room.uf))

  const toolbar = (
    <MetricsToolbar
      rooms={rooms}
      selectedRoomId={selectedRoomId}
      selectedYear={selectedYear}
      currentYear={currentYear}
      years={years}
      onSelectRoom={handleSelectRoom}
      onSelectYear={handleSelectYear}
    />
  )

  if (!hasDataInYear) {
    return (
      <>
        {toolbar}

        <div className="flex shrink-0 items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/8 p-3" role="alert">
          <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-muted-foreground text-sm leading-relaxed">
            {buildEmptyMessage({
              year: selectedYear,
              currentYear,
              hasRoomFilter: !!selectedRoomId,
              hasAnyHistory,
            })}
          </p>
        </div>

        {/* O gráfico por ano continua: é ele que mostra onde existe movimento para escolher. */}
        {hasAnyHistory && <ReleasesByYearChart data={metrics.byYear} selectedYear={selectedYear} />}
      </>
    )
  }

  return (
    <>
      {toolbar}

      <div className="grid shrink-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricKpiCard
          label="Liberações no ano"
          value={formatCount(kpis.totalReleases)}
          delta={buildDelta(kpis.totalReleases, kpis.totalReleasesPreviousYearSamePeriod)}
          caption={`vs. mesmo período de ${selectedYear - 1}`}
        />

        <MetricKpiCard
          label="Média por mês"
          value={formatCount(kpis.averagePerMonth)}
          delta={buildDelta(kpis.averagePerMonth, kpis.averagePerMonthPreviousYearSamePeriod)}
          caption={`${formatCount(kpis.monthsWithData)} ${kpis.monthsWithData === 1 ? 'mês' : 'meses'} com registro`}
        />

        <MetricKpiCard
          label="Advogados atendidos"
          value={formatCount(kpis.distinctLawyers)}
          delta={buildDelta(kpis.distinctLawyers, kpis.distinctLawyersPreviousYearSamePeriod)}
          caption="inscrições distintas no ano"
        />

        <MetricKpiCard
          label="Tempo médio de sessão"
          value={formatMinutes(kpis.averageSessionMinutes)}
          delta={buildDelta(kpis.averageSessionMinutes, kpis.averageSessionMinutesPreviousYearSamePeriod)}
          caption={
            kpis.referenceStandardTime
              ? `limite de ${kpis.referenceStandardTime.minutes} min em ${kpis.referenceStandardTime.roomName}`
              : 'apenas sessões já encerradas'
          }
        />
      </div>

      {/* O mensal leva o dobro da largura: são doze barras contra as poucas do anual, e
          espremê-los em colunas iguais deixaria os meses ilegíveis. */}
      <div className="grid shrink-0 gap-4 xl:grid-cols-3">
        <ReleasesByYearChart data={metrics.byYear} selectedYear={selectedYear} />
        <ReleasesByMonthChart data={metrics.byMonth} year={selectedYear} className="xl:col-span-2" />
      </div>

      <div className="grid shrink-0 gap-4 lg:grid-cols-2">
        <ReleasesByRoomCard data={metrics.byRoom} highlightedRoomId={selectedRoomId} />
        <ReleasesByLawyerCard data={metrics.byLawyer} oabUf={oabUf} year={selectedYear} />
      </div>
    </>
  )
}

/**
 * Ano vindo da URL. Qualquer coisa fora de um ano plausível vira o ano corrente: a tela não deve
 * ficar em branco porque alguém editou o endereço à mão.
 */
function parseYearParam(value: string | null, currentYear: number) {
  const year = Number(value)

  return Number.isInteger(year) && year >= 2000 && year <= currentYear + 1 ? year : currentYear
}

type MetricsToolbarProps = {
  rooms: RoomProps[]
  selectedRoomId?: string
  selectedYear: number
  currentYear: number
  years: number[]
  onSelectRoom: (roomId: string) => void
  onSelectYear: (year: number) => void
}

function MetricsToolbar({
  rooms,
  selectedRoomId,
  selectedYear,
  currentYear,
  years,
  onSelectRoom,
  onSelectYear,
}: MetricsToolbarProps) {
  return (
    <section className="flex shrink-0 flex-col gap-4 rounded-xl border bg-card p-4 shadow-xs">
      <div className="grid gap-4 sm:grid-cols-2">
        <YearFilter years={years} value={selectedYear} onValueChange={onSelectYear} currentYear={currentYear} />

        <RoomFilter
          rooms={rooms}
          value={selectedRoomId ?? ALL_ROOMS}
          onValueChange={onSelectRoom}
          allRoomsDescription="Todas as liberações que você tem permissão para ver"
        />
      </div>
    </section>
  )
}

function MetricsSkeleton() {
  return (
    <>
      <section className="flex shrink-0 flex-col gap-4 rounded-xl border bg-card p-4 shadow-xs">
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }, (_, index) => `filter-skeleton-${index}`).map(key => (
            <div key={key} className="flex w-full flex-col gap-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      </section>

      <div className="grid shrink-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => `kpi-skeleton-${index}`).map(key => (
          <Skeleton key={key} className="h-24 shrink-0 rounded-xl" />
        ))}
      </div>

      <div className="grid shrink-0 gap-4 xl:grid-cols-3">
        <Skeleton className="h-80 shrink-0 rounded-xl" />
        <Skeleton className="h-80 shrink-0 rounded-xl xl:col-span-2" />
      </div>

      <div className="grid shrink-0 gap-4 lg:grid-cols-2">
        <Skeleton className="h-64 shrink-0 rounded-xl" />
        <Skeleton className="h-64 shrink-0 rounded-xl" />
      </div>
    </>
  )
}
