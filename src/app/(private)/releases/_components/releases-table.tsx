'use client'

import { useQuery } from '@tanstack/react-query'
import { SearchIcon, TriangleAlertIcon } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { DataTable } from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { queryKeys } from '@/constants/query-keys'
import { useElapsedMinutes } from '@/hooks/use-elapsed-minutes'
import { getAllReleases } from '@/server/lawyers/get-all-releases'
import { getAllRooms } from '@/server/rooms/get-all'
import { createPeriodMatcher } from '../../_components/shared/filters/match-period'
import { PERIOD_LABELS, type Period, PeriodFilter } from '../../_components/shared/filters/period-filter'
import { ALL_ROOMS, RoomFilter } from '../../_components/shared/filters/room-filter'
import { buildReleaseViews, RELEASE_STATUS_SENTENCES, type ReleaseStatus } from '../_data/release-view'
import { columnsReleases } from './releases-columns'
import { ALL_STATUSES, StatusFilter, type StatusFilterValue } from './status-filter'

/** Nada some do histórico de sessões, então aqui "todo o período" é mesmo tudo — e a janela é longa. */
const RELEASE_PERIODS: Period[] = ['all', 'today', 'yesterday', 'last-7-days', 'last-30-days']

export function ReleasesTable() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState('')

  // Período, situação e busca ficam no estado, e não na URL como a sala: a sala define *o que* a tela
  // carrega da api-fr, enquanto os outros três só estreitam o que já está na mão.
  const [period, setPeriod] = useState<Period>('all')
  const [status, setStatus] = useState<StatusFilterValue>(ALL_STATUSES)

  const {
    data: roomsData,
    isPending: isPendingRooms,
    isError: isErrorRooms,
  } = useQuery({
    queryKey: queryKeys.getRooms(),
    queryFn: getAllRooms,
  })

  // A sala inativa continua na lista: ela saiu de operação, mas as sessões que aconteceram nela
  // continuam valendo como registro — esconder a sala esconderia o passado dela junto.
  const rooms = roomsData?.rooms ?? []

  // A sala vive na URL para a tela ser recarregável e compartilhável. Um `?sala=` inválido ou de uma
  // sala que o funcionário não enxerga cai em "todas" — a auditoria não tem por que ficar vazia.
  const selectedRoomId = rooms.find(room => room.id === searchParams.get('sala'))?.id

  const {
    data: releasesData,
    dataUpdatedAt: releasesUpdatedAt,
    isPending: isPendingReleases,
    isError,
  } = useQuery({
    queryKey: queryKeys.getReleases(selectedRoomId),
    queryFn: () => getAllReleases(selectedRoomId),
    // Sem as salas resolvidas, um `?sala=` na URL ainda não virou id validado: buscar agora traria o
    // histórico inteiro e o trocaria pelo da sala um instante depois, gastando dois requests.
    enabled: !isPendingRooms,
  })

  // A duração das sessões abertas é calculada no servidor e envelhece parada na tela. Contar o tempo
  // aqui faz o relógio da linha andar sem uma chamada por minuto na api-fr.
  const elapsedMinutes = useElapsedMinutes(releasesUpdatedAt)

  const releases = useMemo(() => buildReleaseViews(releasesData?.releases ?? [], elapsedMinutes), [releasesData, elapsedMinutes])

  // Duas etapas de propósito: os ladrilhos de contagem mostram o que a *situação* está separando, então
  // eles contam o conjunto já estreitado por período e busca, mas ainda inteiro quanto ao estado.
  const scopedReleases = useMemo(() => {
    const lowerSearch = search.trim().toLowerCase()

    const matchesPeriod = createPeriodMatcher(period)

    return releases.filter(release => {
      if (!matchesPeriod(release.startDate)) return false

      if (!lowerSearch) return true

      return (
        release.lawyer.name.toLowerCase().includes(lowerSearch) ||
        release.computer.description.toLowerCase().includes(lowerSearch) ||
        release.room.name.toLowerCase().includes(lowerSearch)
      )
    })
  }, [releases, search, period])

  const filteredReleases = useMemo(
    () => (status === ALL_STATUSES ? scopedReleases : scopedReleases.filter(release => release.status === status)),
    [scopedReleases, status]
  )

  const statusCounts = useMemo(
    () =>
      scopedReleases.reduce(
        (counts, release) => {
          counts[release.status] += 1

          return counts
        },
        { 'in-progress': 0, exhausted: 0, closed: 0 } as Record<ReleaseStatus, number>
      ),
    [scopedReleases]
  )

  function handleSelectRoom(roomId: string) {
    const params = new URLSearchParams(searchParams)

    if (roomId === ALL_ROOMS) {
      params.delete('sala')
    } else {
      params.set('sala', roomId)
    }

    const query = params.toString()

    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  // Só as salas seguram a tela inteira: elas decidem qual sala está selecionada, e renderizar a
  // toolbar antes disso faria o seletor mostrar "Todas as salas" para depois pular para a da URL.
  // A espera pelas liberações é a própria tabela quem mostra, sem trocar o layout de lugar.
  if (isPendingRooms) {
    return (
      <>
        <section className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-xs">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => `filter-skeleton-${index}`).map(key => (
              <div key={key} className="flex w-full flex-col gap-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>

          <Skeleton className="h-3 w-56" />
        </section>

        <DataTable columns={columnsReleases} data={[]} isLoading />
      </>
    )
  }

  if (isError) {
    return (
      <section className="rounded-xl border bg-card p-4 shadow-xs">
        <p className="text-muted-foreground text-sm">
          Não foi possível carregar as liberações agora. Atualize a página em alguns instantes.
        </p>
      </section>
    )
  }

  const searchTerm = search.trim()

  // A lista vazia tem quatro causas — não há nada registrado, a busca não achou, o período não alcança,
  // a situação não existe no recorte — e cada uma pede uma saída diferente de quem está olhando a tela.
  let emptyMessage =
    'Nenhuma liberação registrada. Toda sessão aberta no painel de operação passa a aparecer aqui, e nada é apagado.'

  if (releases.length > 0) {
    emptyMessage = `Nenhuma das ${releases.length} liberações combina com a busca. Ajuste o texto para ver o restante.`
  }

  if (releases.length > 0 && period !== 'all') {
    emptyMessage = `Nenhuma liberação ${PERIOD_LABELS[period]}${searchTerm ? ' combina com a busca' : ''}. Amplie o período${searchTerm ? ' ou limpe a busca' : ''} para ver o restante.`
  }

  // A situação é o filtro mais estreito, então ela fala por último: dizer "amplie o período" quando o
  // que zerou a lista foi pedir só as sessões em andamento mandaria a pessoa mexer no controle errado.
  if (releases.length > 0 && status !== ALL_STATUSES && scopedReleases.length > 0) {
    emptyMessage = `Nenhuma liberação ${RELEASE_STATUS_SENTENCES[status]} neste recorte. Escolha "Todas as situações" para ver as outras ${scopedReleases.length}.`
  }

  return (
    <>
      <section className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-xs">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <RoomFilter
            rooms={rooms}
            value={selectedRoomId ?? ALL_ROOMS}
            onValueChange={handleSelectRoom}
            allRoomsDescription="Todas as liberações que você tem permissão para ver"
          />

          <PeriodFilter
            value={period}
            onValueChange={setPeriod}
            periods={RELEASE_PERIODS}
            allPeriodDescription="Todo o histórico, desde a primeira liberação"
          />

          <StatusFilter value={status} onValueChange={setStatus} />

          <div className="flex w-full flex-col gap-2">
            <Label htmlFor="search-release" className="text-muted-foreground text-xs uppercase tracking-wider">
              Buscar liberação
            </Label>

            <div className="relative flex items-center">
              <SearchIcon className="pointer-events-none absolute left-2.5 size-4 text-muted-foreground" />

              {/* Altura e recuo copiados do `SelectTrigger` (h-8, px-2.5) para os quatro controles da
                  toolbar terminarem na mesma linha; o recuo maior à esquerda é o lugar do ícone. */}
              <Input
                id="search-release"
                placeholder="Advogado, computador ou sala"
                className="bg-background pr-2.5 pl-8 shadow-xs"
                value={search}
                onChange={({ target }) => setSearch(target.value)}
              />
            </div>
          </div>
        </div>

        {/* Contar antes de a lista chegar diria "00 liberações" a cada troca de sala — e um zero é uma
            afirmação, não uma espera. */}
        {isPendingReleases ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Skeleton className="h-6 w-64 rounded-full" />

            <Skeleton className="h-3 w-56" />
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* A mesma leitura de relance do painel: quantas sessões estão de pé agora e como as
                outras terminaram, sem ter de percorrer a coluna de situação linha a linha. */}
            <div className="flex flex-wrap gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-rose-700/25 bg-rose-700/10 px-3 py-1.5 font-medium text-rose-700 text-xs">
                <span className="size-1.5 min-w-1.5 rounded-full bg-rose-700" />
                {statusCounts['in-progress']} em andamento
              </span>

              <span className="flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1.5 font-medium text-amber-600 text-xs dark:text-amber-400">
                <span className="size-1.5 min-w-1.5 rounded-full bg-amber-500" />
                {statusCounts.exhausted} com tempo esgotado
              </span>

              <span className="flex items-center gap-1.5 rounded-full border border-slate-500/25 bg-slate-500/10 px-3 py-1.5 font-medium text-slate-500 text-xs">
                <span className="size-1.5 min-w-1.5 rounded-full bg-slate-500" />
                {statusCounts.closed} encerradas
              </span>
            </div>

            <p className="text-right text-muted-foreground text-xs">
              <span className="font-semibold text-foreground tabular-nums">
                {String(filteredReleases.length).padStart(2, '0')}
              </span>{' '}
              {filteredReleases.length === 1 ? 'liberação' : 'liberações'} {PERIOD_LABELS[period]}
              {/* Só faz sentido comparar com o total quando algum filtro está escondendo alguma coisa. */}
              {filteredReleases.length !== releases.length && ` · ${releases.length} no total`}
            </p>
          </div>
        )}
      </section>

      {/* Sem as salas o filtro perde as opções, mas a lista não: sem `roomId` a api-fr já devolve
          tudo o que este funcionário pode ver. Calar isso deixaria o seletor vazio sem explicação. */}
      {isErrorRooms && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/8 p-3" role="alert">
          <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />

          <p className="text-muted-foreground text-sm leading-relaxed">
            As salas não puderam ser carregadas, então o filtro por sala está indisponível. A lista abaixo continua mostrando
            todas as liberações que você tem permissão para ver.
          </p>
        </div>
      )}

      {/* A paginação é da própria tabela: o histórico inteiro de sessões não cabe numa tela, e a
          api-fr ainda devolve a lista sem paginar. Quando ela paginar, é aqui que a troca acontece. */}
      <DataTable columns={columnsReleases} data={filteredReleases} isLoading={isPendingReleases} emptyMessage={emptyMessage} />
    </>
  )
}
