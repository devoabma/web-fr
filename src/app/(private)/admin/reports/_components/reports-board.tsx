'use client'

import { useQuery } from '@tanstack/react-query'
import { TriangleAlertIcon } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import { DataTable } from '@/components/ui/data-table'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { queryKeys } from '@/constants/query-keys'
import { getAllReleases } from '@/server/lawyers/get-all-releases'
import { getAllRooms } from '@/server/rooms/get-all'
import { formatDuration } from '@/utils'
import { ALL_ROOMS, RoomFilter } from '../../../_components/shared/filters/room-filter'
import { buildReportDocument, DEFAULT_REPORT_KIND, REPORT_KINDS, REPORT_TITLES, type ReportKind } from '../_data/report-documents'
import { type ReportPeriodMode, resolveReportPeriod } from '../_data/report-period'
import { buildReportsView, type ReportSection, type ReportSummary } from '../_data/reports-view'
import { ExportActions } from './export-actions'
import { ReportPeriodFilter } from './report-period-filter'
import { columnsLawyerRanking, columnsLawyersByRoom, columnsRoomMovement } from './reports-columns'

export function ReportsBoard() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const {
    data: roomsData,
    isPending: isPendingRooms,
    isError: isErrorRooms,
  } = useQuery({ queryKey: queryKeys.getRooms(), queryFn: getAllRooms })

  /**
   * O histórico **inteiro**, sem sala.
   *
   * Dois dos três relatórios comparam todas as salas de propósito, então pedir só a sala filtrada
   * mutilaria o comparativo. É também o que faz a troca de filtro não disparar requisição: sala,
   * período e relatório recortam o que já está na mão.
   */
  const {
    data: releasesData,
    isPending: isPendingReleases,
    isError: isErrorReleases,
  } = useQuery({
    queryKey: queryKeys.getReleases(),
    queryFn: () => getAllReleases(),
    enabled: !isPendingRooms,
  })

  const rooms = roomsData?.rooms ?? []

  // A sala é normalizada contra a lista antes de qualquer coisa: um `?sala=` de sala inexistente
  // esvaziaria o recorte e a tela culparia o período por uma ausência de movimento que não existe.
  const selectedRoomId = rooms.find(room => room.id === searchParams.get('sala'))?.id ?? null
  const roomLabel = selectedRoomId ? (rooms.find(room => room.id === selectedRoomId)?.name ?? 'Todas as salas') : 'Todas as salas'

  const periodMode = searchParams.get('periodo')
  const periodFrom = searchParams.get('de')
  const periodTo = searchParams.get('ate')

  // O recorte é memoizado sobre os três parâmetros crus da URL: `resolveReportPeriod` devolve um
  // objeto novo a cada chamada, e sem isso o view-model abaixo recalcularia o histórico inteiro a
  // cada render — inclusive nos que não têm nada a ver com o filtro.
  const period = useMemo(
    () => resolveReportPeriod({ mode: periodMode, from: periodFrom, to: periodTo }),
    [periodMode, periodFrom, periodTo]
  )

  const kind = REPORT_KINDS.find(candidate => candidate === searchParams.get('relatorio')) ?? DEFAULT_REPORT_KIND

  const releases = releasesData?.releases

  /**
   * O view-model só é montado com as **duas** consultas resolvidas.
   *
   * Com as salas ainda vazias, o comparativo rotularia toda sala do histórico como "inativa" — ela
   * não estaria na lista conhecida. Um relatório que chama de desativada uma sala em operação é pior
   * que um esqueleto por mais meio segundo.
   */
  const view = useMemo(() => {
    if (!releases || isPendingRooms) return null

    return buildReportsView({ releases, rooms, period, roomId: selectedRoomId })
  }, [releases, rooms, period, isPendingRooms, selectedRoomId])

  function pushParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams)

    mutate(params)

    const query = params.toString()

    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  function handleSelectRoom(roomId: string) {
    pushParams(params => (roomId === ALL_ROOMS ? params.delete('sala') : params.set('sala', roomId)))
  }

  function handleSelectKind(next: ReportKind) {
    pushParams(params => (next === DEFAULT_REPORT_KIND ? params.delete('relatorio') : params.set('relatorio', next)))
  }

  /**
   * Trocar de recorte limpa as datas.
   *
   * `?de=` carrega o formato do modo (`2025-03-12` no dia, `2025-03` no mês). Levar o valor antigo
   * para o modo novo cairia no padrão em silêncio, e o usuário veria o campo saltar para outro
   * período sem entender por quê — melhor recomeçar do recorte corrente, que é visível.
   */
  function handleChangeMode(mode: ReportPeriodMode) {
    pushParams(params => {
      params.set('periodo', mode)
      params.delete('de')
      params.delete('ate')
    })
  }

  if (isErrorRooms || isErrorReleases) {
    return (
      <section className="shrink-0 rounded-xl border bg-card p-4 shadow-xs">
        <p className="text-muted-foreground text-sm">
          Não foi possível carregar o histórico agora. Atualize a página em alguns instantes.
        </p>
      </section>
    )
  }

  const toolbar = (
    <section className="flex shrink-0 flex-col gap-4 rounded-xl border bg-card p-4 shadow-xs">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="flex w-full flex-col gap-2">
          <Label htmlFor="report-kind" className="text-muted-foreground text-xs uppercase tracking-wider">
            Relatório
          </Label>

          <Select value={kind} onValueChange={value => value && handleSelectKind(value as ReportKind)}>
            <SelectTrigger id="report-kind" className="w-full bg-background px-2.5 shadow-xs">
              <SelectValue className="font-medium">{(value: ReportKind) => REPORT_TITLES[value]}</SelectValue>
            </SelectTrigger>

            <SelectContent>
              {REPORT_KINDS.map(value => (
                <SelectItem key={value} value={value} className="py-2">
                  <span className="font-medium">{REPORT_TITLES[value]}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ReportPeriodFilter
          period={period}
          onChangeMode={handleChangeMode}
          onChangeFrom={from => pushParams(params => params.set('de', from))}
          onChangeTo={to => pushParams(params => params.set('ate', to))}
        />

        <RoomFilter
          rooms={rooms}
          value={selectedRoomId ?? ALL_ROOMS}
          onValueChange={handleSelectRoom}
          allRoomsDescription="Todas as salas da Seccional, inclusive as que você não atende"
        />
      </div>
    </section>
  )

  if (isPendingRooms || isPendingReleases || !view) {
    return (
      <>
        {toolbar}
        <Skeleton className="h-16 shrink-0 rounded-xl" />
        <DataTable columns={columnsLawyersByRoom} data={[]} isLoading />
      </>
    )
  }

  const sections = {
    'advogados-por-sala': view.lawyersByRoom,
    'movimento-por-sala': view.roomMovement,
    'ranking-de-advogados': view.lawyerRanking,
  }

  const section = sections[kind]

  // O documento só existe quando há linhas e o recorte é válido — é o que faz o botão sumir sozinho.
  const document =
    period.status === 'ok' && section.rows.length > 0
      ? buildReportDocument(section as ReportSection<unknown>, { kind, period, roomLabel })
      : null

  return (
    <>
      {toolbar}

      {section.emptyMessage ? (
        <div className="flex shrink-0 items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/8 p-3" role="alert">
          <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-muted-foreground text-sm leading-relaxed">{section.emptyMessage}</p>
        </div>
      ) : (
        <ReportSummaryBar
          summary={section.summary}
          periodLabel={period.status === 'ok' ? period.label : ''}
          ignoresRoomFilter={section.ignoresRoomFilter}
          roomLabel={roomLabel}
          document={document}
        />
      )}

      {!section.emptyMessage && (
        <div className="shrink-0">
          {kind === 'advogados-por-sala' && <DataTable columns={columnsLawyersByRoom} data={view.lawyersByRoom.rows} />}
          {kind === 'movimento-por-sala' && <DataTable columns={columnsRoomMovement} data={view.roomMovement.rows} />}
          {kind === 'ranking-de-advogados' && <DataTable columns={columnsLawyerRanking} data={view.lawyerRanking.rows} />}
        </div>
      )}
    </>
  )
}

type ReportSummaryBarProps = {
  summary: ReportSummary
  periodLabel: string
  ignoresRoomFilter: boolean
  roomLabel: string
  document: Parameters<typeof ExportActions>[0]['document']
}

/**
 * O resumo do recorte, acima da tabela.
 *
 * É o número que alguém copia para a ata, então ele carrega o período por extenso ao lado — sem
 * isso, "412 liberações" numa captura de tela perde a única informação que a torna verificável.
 */
function ReportSummaryBar({ summary, periodLabel, ignoresRoomFilter, roomLabel, document }: ReportSummaryBarProps) {
  const numbers = [
    { label: 'Liberações', value: summary.releases.toLocaleString('pt-BR') },
    { label: 'Advogados', value: summary.distinctLawyers.toLocaleString('pt-BR') },
    { label: 'Salas com movimento', value: summary.distinctRooms.toLocaleString('pt-BR') },
    { label: 'Tempo total', value: formatDuration(summary.minutes) ?? '0min' },
    { label: 'Média por sessão', value: formatDuration(summary.averageMinutes) ?? '0min' },
  ]

  return (
    <section className="flex shrink-0 flex-col gap-3 rounded-xl border bg-card p-4 shadow-xs">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-6 gap-y-2">
          {numbers.map(item => (
            <div key={item.label} className="flex flex-col">
              <span className="font-semibold text-lg text-primary tabular-nums leading-tight">{item.value}</span>
              <span className="text-muted-foreground text-xs">{item.label}</span>
            </div>
          ))}
        </div>

        <ExportActions document={document} />
      </div>

      <div className="flex flex-col gap-1 border-t pt-3 text-muted-foreground text-xs leading-relaxed">
        <span>{periodLabel}</span>

        {/* Sem esta linha, uma folha listando todas as salas sob um filtro de sala parece defeito. */}
        {ignoresRoomFilter && <span>Este relatório compara todas as salas e não aplica o filtro &ldquo;{roomLabel}&rdquo;.</span>}

        {summary.openSessions > 0 && (
          <span>
            {summary.openSessions === 1
              ? '1 sessão estava em andamento e conta como acesso, sem somar tempo.'
              : `${summary.openSessions} sessões estavam em andamento e contam como acesso, sem somar tempo.`}
          </span>
        )}
      </div>
    </section>
  )
}
