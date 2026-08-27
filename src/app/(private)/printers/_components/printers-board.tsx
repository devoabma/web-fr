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
import { getAllPrinters } from '@/server/printers/get-all'
import { getAllRooms } from '@/server/rooms/get-all'
import { PERIOD_LABELS, type Period, PeriodFilter } from './period-filter'
import { columnsPrinters } from './printers-columns'
import { ALL_ROOMS, RoomFilter } from './room-filter'

/**
 * `en-CA` formata como `2026-08-27`, que compara e ordena como texto — é o que deixa "últimos 7 dias"
 * ser um `>=` de strings. O fuso é o da Seccional: o corte do dia tem de ser a meia-noite do balcão,
 * não a de quem está com o navegador em outro lugar.
 */
const dayKeyFormatter = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: 'America/Fortaleza',
})

const MS_IN_DAY = 86_400_000

export function PrintersBoard() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState('')

  // Período e busca ficam no estado, e não na URL como a sala: a sala define *o que* a tela carrega
  // da api-fr, enquanto estes dois só estreitam o que já está na mão.
  const [period, setPeriod] = useState<Period>('all')

  const {
    data: roomsData,
    isPending: isPendingRooms,
    isError: isErrorRooms,
  } = useQuery({
    queryKey: queryKeys.getRooms(),
    queryFn: getAllRooms,
  })

  const rooms = roomsData?.rooms.filter(room => !room.inactive) ?? []

  // A sala vive na URL para a tela ser recarregável e compartilhável. Um `?sala=` inválido ou de uma
  // sala que o funcionário não enxerga cai em "todas" — o histórico não tem por que ficar vazio.
  const selectedRoomId = rooms.find(room => room.id === searchParams.get('sala'))?.id

  const {
    data: printersData,
    isPending: isPendingPrinters,
    isError,
  } = useQuery({
    queryKey: queryKeys.getPrinters(selectedRoomId),
    queryFn: () => getAllPrinters(selectedRoomId),
    // Sem as salas resolvidas, um `?sala=` na URL ainda não virou id validado: buscar agora traria o
    // histórico inteiro e o trocaria pelo da sala um instante depois, gastando dois requests.
    enabled: !isPendingRooms,
  })

  const printers = printersData?.printers ?? []

  const filteredPrinters = useMemo(() => {
    const lowerSearch = search.trim().toLowerCase()

    const now = Date.now()

    const today = dayKeyFormatter.format(now)
    const yesterday = dayKeyFormatter.format(now - MS_IN_DAY)
    // Sete dias contando com o de hoje, senão "últimos 7 dias" mostraria oito.
    const weekStart = dayKeyFormatter.format(now - 6 * MS_IN_DAY)

    return printers.filter(printer => {
      const day = dayKeyFormatter.format(new Date(printer.createdAt))

      const matchesPeriod =
        period === 'all' ||
        (period === 'today' && day === today) ||
        (period === 'yesterday' && day === yesterday) ||
        (period === 'last-7-days' && day >= weekStart)

      if (!matchesPeriod) return false

      if (!lowerSearch) return true

      return (
        printer.lawyer.name.toLowerCase().includes(lowerSearch) ||
        printer.computer.description.toLowerCase().includes(lowerSearch) ||
        printer.room.name.toLowerCase().includes(lowerSearch)
      )
    })
  }, [printers, search, period])

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
  // A espera pelas impressões é a própria tabela quem mostra, sem trocar o layout de lugar.
  if (isPendingRooms) {
    return (
      <>
        <section className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-xs">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => `filter-skeleton-${index}`).map(key => (
              <div key={key} className="flex w-full flex-col gap-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>

          <Skeleton className="h-3 w-56" />
        </section>

        <DataTable columns={columnsPrinters} data={[]} isLoading />
      </>
    )
  }

  if (isError) {
    return (
      <section className="rounded-xl border bg-card p-4 shadow-xs">
        <p className="text-muted-foreground text-sm">
          Não foi possível carregar as impressões agora. Atualize a página em alguns instantes.
        </p>
      </section>
    )
  }

  const searchTerm = search.trim()

  // A lista vazia tem três causas — não há nada guardado, a busca não achou, o período não alcança —
  // e cada uma pede uma saída diferente de quem está olhando a tela.
  let emptyMessage =
    'Nenhuma impressão registrada. As enviadas pelas estações aparecem aqui, e a lista é zerada toda sexta-feira às 23:59.'

  if (printers.length > 0 && period === 'all') {
    emptyMessage = `Nenhuma das ${printers.length} impressões combina com a busca. Ajuste o texto para ver o restante.`
  }

  if (printers.length > 0 && period !== 'all') {
    emptyMessage = `Nenhuma impressão ${PERIOD_LABELS[period]}${searchTerm ? ' combina com a busca' : ''}. Amplie o período${searchTerm ? ' ou limpe a busca' : ''} para ver o restante.`
  }

  return (
    <>
      <section className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-xs">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <RoomFilter rooms={rooms} value={selectedRoomId ?? ALL_ROOMS} onValueChange={handleSelectRoom} />

          <PeriodFilter value={period} onValueChange={setPeriod} />

          <div className="flex w-full flex-col gap-2">
            <Label htmlFor="search-printer" className="text-muted-foreground text-xs uppercase tracking-wider">
              Buscar impressão
            </Label>

            <div className="relative flex items-center">
              <SearchIcon className="pointer-events-none absolute left-2.5 size-4 text-muted-foreground" />

              {/* Altura e recuo copiados do `SelectTrigger` (h-8, px-2.5) para os três controles da
                  toolbar terminarem na mesma linha; o recuo maior à esquerda é o lugar do ícone. */}
              <Input
                id="search-printer"
                placeholder="Advogado, computador ou sala"
                className="bg-background pr-2.5 pl-8 shadow-xs"
                value={search}
                onChange={({ target }) => setSearch(target.value)}
              />
            </div>
          </div>
        </div>

        {/* Contar antes de a lista chegar diria "00 impressões" a cada troca de sala — e um zero é uma
            afirmação, não uma espera. */}
        {isPendingPrinters ? (
          <Skeleton className="h-3 w-56 self-end" />
        ) : (
          <p className="text-right text-muted-foreground text-xs">
            <span className="font-semibold text-foreground tabular-nums">{String(filteredPrinters.length).padStart(2, '0')}</span>{' '}
            {filteredPrinters.length === 1 ? 'impressão' : 'impressões'} {PERIOD_LABELS[period]}
            {/* Só faz sentido comparar com o total quando algum filtro está escondendo alguma coisa. */}
            {filteredPrinters.length !== printers.length && ` · ${printers.length} no total`}
          </p>
        )}
      </section>

      {/* Sem as salas o filtro perde as opções, mas a lista não: sem `roomId` a api-fr já devolve
          tudo o que este funcionário pode ver. Calar isso deixaria o seletor vazio sem explicação. */}
      {isErrorRooms && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/8 p-3" role="alert">
          <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />

          <p className="text-muted-foreground text-sm leading-relaxed">
            As salas não puderam ser carregadas, então o filtro por sala está indisponível. A lista abaixo continua mostrando
            todas as impressões que você tem permissão para ver.
          </p>
        </div>
      )}

      {/* A paginação é da própria tabela: o histórico de uma semana inteira não cabe numa tela, e a
          api-fr ainda devolve a lista sem paginar. Quando ela paginar, é aqui que a troca acontece. */}
      <DataTable columns={columnsPrinters} data={filteredPrinters} isLoading={isPendingPrinters} emptyMessage={emptyMessage} />
    </>
  )
}
