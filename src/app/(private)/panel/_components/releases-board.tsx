'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MonitorOffIcon, TriangleAlertIcon } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { queryKeys } from '@/constants/query-keys'
import { formatWaitTime, getApiErrorMessage, getRetryAfterInSeconds } from '@/lib/http/api-error'
import { putIntoMaintenance } from '@/server/computers/put-into-maintenance'
import { takeOutOfMaintenance } from '@/server/computers/take-out-of-maintenance'
import { closeSession } from '@/server/lawyers/close-session'
import { getAllReleases } from '@/server/lawyers/get-all-releases'
import { releaseComputer } from '@/server/lawyers/release-computer'
import { getAllRooms } from '@/server/rooms/get-all'
import { buildComputerViews, type ComputerView } from '../_data/computer-view'
import { CloseSessionDialog } from './close-session-dialog'
import { ComputerCard } from './computer-card'
import { ReleaseComputerDialog } from './release-computer-dialog'
import type { ReleaseComputerFormType } from './release-computer-schema'
import { RoomEmployees } from './room-employees'
import { RoomSelect } from './room-select'
import { StatusSummary } from './status-summary'

/** O relógio de cada sessão é calculado no servidor: sem revalidar, o saldo na tela congela. */
const RELEASES_REFETCH_INTERVAL = 30_000

export function ReleasesBoard() {
  const queryClient = useQueryClient()

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [computerToRelease, setComputerToRelease] = useState<ComputerView | null>(null)
  const [computerToClose, setComputerToClose] = useState<ComputerView | null>(null)

  const { data: roomsData, isPending, isError } = useQuery({
    queryKey: queryKeys.getRooms(),
    queryFn: getAllRooms,
  })

  // Sala inativa fica de fora: ninguém deve liberar máquina de uma sala fora de operação.
  const rooms = roomsData?.rooms.filter(room => !room.inactive) ?? []

  // A sala vive na URL para a tela ser recarregável e compartilhável. Um `?sala=` inválido ou de uma
  // sala que o funcionário não enxerga cai na primeira da lista em vez de deixar a tela vazia.
  const selectedRoom = rooms.find(room => room.id === searchParams.get('sala')) ?? rooms.at(0)
  const selectedRoomId = selectedRoom?.id

  const { data: releasesData, isPending: isPendingReleases, isError: isErrorReleases } = useQuery({
    queryKey: queryKeys.getReleases(selectedRoomId),
    // Só roda com `enabled`, então o id nunca chega indefinido aqui.
    queryFn: () => getAllReleases(selectedRoomId as string),
    enabled: !!selectedRoomId,
    refetchInterval: RELEASES_REFETCH_INTERVAL,
  })

  const { mutateAsync: releaseComputerFn, isPending: isReleasing } = useMutation({
    mutationFn: releaseComputer,
  })

  const { mutateAsync: closeSessionFn, isPending: isClosing } = useMutation({
    mutationFn: closeSession,
  })

  const {
    mutateAsync: putIntoMaintenanceFn,
    isPending: isPuttingIntoMaintenance,
    variables: computerEnteringMaintenance,
  } = useMutation({
    mutationFn: putIntoMaintenance,
  })

  const {
    mutateAsync: takeOutOfMaintenanceFn,
    isPending: isLeavingMaintenance,
    variables: computerLeavingMaintenance,
  } = useMutation({
    mutationFn: takeOutOfMaintenance,
  })

  // Trava só o card clicado: um `isPending` solto desabilitaria a grade inteira a cada manutenção.
  const maintenancePendingId =
    (isPuttingIntoMaintenance && computerEnteringMaintenance) || (isLeavingMaintenance && computerLeavingMaintenance) || null

  function handleSelectRoom(roomId: string) {
    const params = new URLSearchParams(searchParams)

    params.set('sala', roomId)

    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  /** O 429 precisa dizer quanto falta, senão o balconista fica insistindo contra uma porta fechada. */
  function notifyError(err: unknown, fallback: string) {
    const retryAfterInSeconds = getRetryAfterInSeconds(err)

    toast.error(
      retryAfterInSeconds
        ? `Muitas tentativas seguidas. Tente novamente em ${formatWaitTime(retryAfterInSeconds)}.`
        : getApiErrorMessage(err, fallback)
    )
  }

  async function refreshBoard() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.getRooms() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.getReleases(selectedRoomId) }),
    ])
  }

  async function handleReleaseComputer(data: ReleaseComputerFormType) {
    if (!computerToRelease) return

    try {
      const result = await releaseComputerFn({
        cpf: data.cpf,
        oab: data.oab,
        // A API compara a data com o cadastro da OAB em `DDMMYYYY`; o formulário digita `dd/mm/aaaa`.
        birth: data.birth.replace(/\D/g, ''),
        macCode: computerToRelease.macCode,
      })

      toast.success(`${result.lawyerName} liberado(a) no ${computerToRelease.name}.`, {
        description: `Saldo de ${result.remainingTime} min para o dia.`,
      })

      // Liberando do balcão, quem confirma não vê a tela da máquina. Sem este aviso o advogado
      // caminha até um computador que continua travado.
      if (!result.notified) {
        toast.warning(`O ${computerToRelease.name} não respondeu ao aviso.`, {
          description: 'A sessão foi gravada, mas a estação está offline e não vai destravar sozinha.',
        })
      }

      setComputerToRelease(null)

      await refreshBoard()
    } catch (err) {
      notifyError(err, 'Não foi possível liberar o computador agora. Verifique sua conexão e tente novamente.')
    }
  }

  async function handleCloseSession(computer: ComputerView) {
    if (!computer.session) return

    try {
      const result = await closeSessionFn(computer.session.id)

      toast.success(`Sessão do ${computer.name} encerrada.`, {
        description: `${computer.session.lawyerName} ainda tem ${result.remainingTime} min na cota do dia.`,
      })

      setComputerToClose(null)

      await refreshBoard()
    } catch (err) {
      notifyError(err, 'Não foi possível encerrar a sessão agora. Verifique sua conexão e tente novamente.')
    }
  }

  async function handlePutIntoMaintenance(computer: ComputerView) {
    try {
      await putIntoMaintenanceFn(computer.id)

      toast.success(`${computer.name} enviado para manutenção.`, {
        description: 'A máquina sai da operação e não aceita novas liberações.',
      })

      await refreshBoard()
    } catch (err) {
      notifyError(err, 'Não foi possível enviar o computador para manutenção. Verifique sua conexão e tente novamente.')
    }
  }

  async function handleTakeOutOfMaintenance(computer: ComputerView) {
    try {
      await takeOutOfMaintenanceFn(computer.id)

      toast.success(`${computer.name} devolvido à operação.`)

      await refreshBoard()
    } catch (err) {
      notifyError(err, 'Não foi possível devolver o computador à operação. Verifique sua conexão e tente novamente.')
    }
  }

  if (isPending) {
    return (
      <>
        <section className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-xs sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div className="flex w-full flex-col gap-2 sm:max-w-80">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="flex flex-col gap-2 sm:items-end">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-24" />

              <div className="flex -space-x-2">
                <Skeleton className="size-6 rounded-full" />
                <Skeleton className="size-6 rounded-full" />
                <Skeleton className="size-6 rounded-full" />
              </div>
            </div>

            <Skeleton className="h-3 w-52" />
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => `skeleton-${index}`).map(key => (
            <Skeleton key={key} className="h-52 rounded-xl" />
          ))}
        </div>
      </>
    )
  }

  if (isError) {
    return (
      <section className="rounded-xl border bg-card p-4 shadow-xs">
        <p className="text-muted-foreground text-sm">
          Não foi possível carregar as salas agora. Atualize a página em alguns instantes.
        </p>
      </section>
    )
  }

  if (!selectedRoom) {
    return (
      <section className="rounded-xl border bg-card p-4 shadow-xs">
        <p className="text-muted-foreground text-sm">Nenhuma sala ativa cadastrada para a sua Seccional.</p>
      </section>
    )
  }

  const computers = buildComputerViews(selectedRoom.computers, releasesData?.releases ?? [])
  const totalComputers = computers.length

  return (
    <>
      <section className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-xs sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <RoomSelect rooms={rooms} value={selectedRoom.id} onValueChange={handleSelectRoom} />

        <div className="flex flex-col gap-2 sm:items-end">
          <RoomEmployees employeesRooms={selectedRoom.employeesRooms} />

          <p className="text-muted-foreground text-xs">
            Cota de <span className="font-semibold text-foreground">{selectedRoom.standardTime} min</span> por dia nesta sala ·{' '}
            {String(totalComputers).padStart(2, '0')} {totalComputers === 1 ? 'computador' : 'computadores'}
          </p>

          <StatusSummary computers={computers} />
        </div>
      </section>

      {totalComputers === 0 ? (
        <section className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-10 text-center">
          <MonitorOffIcon className="size-6 text-muted-foreground" />

          <p className="font-medium text-primary text-sm">Nenhum computador nesta sala</p>

          <p className="max-w-sm text-muted-foreground text-sm">
            O cadastro de máquinas é feito por um administrador. Fale com a coordenação da sua Seccional para incluir as desta
            sala.
          </p>
        </section>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {computers.map(computer => (
            <ComputerCard
              key={computer.id}
              computer={computer}
              standardTime={selectedRoom.standardTime}
              isMaintenancePending={maintenancePendingId === computer.id}
              onRelease={setComputerToRelease}
              onCloseSession={setComputerToClose}
              onPutIntoMaintenance={handlePutIntoMaintenance}
              onTakeOutOfMaintenance={handleTakeOutOfMaintenance}
            />
          ))}
        </div>
      )}

      {/* Enquanto as liberações não chegam, a grade já aparece com todas as máquinas como disponíveis.
          Dizer isso evita que alguém libere por cima de uma sessão que ainda não foi carregada. */}
      {isPendingReleases && (
        <p className="text-center text-muted-foreground text-xs">Carregando as sessões em andamento desta sala...</p>
      )}

      {/* Sem as liberações a grade continua de pé, porque o `inUse` da sala ainda marca as máquinas
          ocupadas — mas sem advogado, sem relógio e sem o botão de encerrar. Calar isso deixaria a
          tela parecendo correta e incompleta ao mesmo tempo. */}
      {isErrorReleases && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/8 p-3" role="alert">
          <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />

          <p className="text-muted-foreground text-sm leading-relaxed">
            As sessões em andamento desta sala não puderam ser carregadas. As máquinas ocupadas continuam sinalizadas, mas sem
            o nome do advogado, o tempo restante e a ação de encerrar. Atualize a página em alguns instantes.
          </p>
        </div>
      )}

      <ReleaseComputerDialog
        computer={computerToRelease}
        roomName={selectedRoom.name}
        isPending={isReleasing}
        onClose={() => setComputerToRelease(null)}
        onConfirm={handleReleaseComputer}
      />

      <CloseSessionDialog
        computer={computerToClose}
        isPending={isClosing}
        onClose={() => setComputerToClose(null)}
        onConfirm={handleCloseSession}
      />
    </>
  )
}
