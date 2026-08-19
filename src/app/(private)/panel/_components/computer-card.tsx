'use client'

import { CheckIcon, LockOpenIcon, MonitorIcon, PowerIcon, UserRoundIcon, WrenchIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { ComputerView } from '../_data/computer-view'

/** `01:12` — no balcão o tempo é lido de relance, e "72 minutos" não se lê de relance. */
function formatMinutesAsClock(totalMinutes: number) {
  const safeMinutes = Math.max(0, Math.floor(totalMinutes))

  const hours = Math.floor(safeMinutes / 60)
  const minutes = safeMinutes % 60

  return `${String(hours).padStart(2, '0')}h:${String(minutes).padStart(2, '0')}min`
}

function formatDateTime(isoDate: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Fortaleza',
  }).format(new Date(isoDate))
}

type ComputerCardProps = {
  computer: ComputerView
  /** Cota diária da sala, usada como base da barra de saldo. */
  standardTime: number
  /** Trava só as ações deste card enquanto a manutenção dele está em andamento. */
  isMaintenancePending: boolean
  onRelease: (computer: ComputerView) => void
  onCloseSession: (computer: ComputerView) => void
  onPutIntoMaintenance: (computer: ComputerView) => void
  onTakeOutOfMaintenance: (computer: ComputerView) => void
}

export function ComputerCard({
  computer,
  standardTime,
  isMaintenancePending,
  onRelease,
  onCloseSession,
  onPutIntoMaintenance,
  onTakeOutOfMaintenance,
}: ComputerCardProps) {
  const { name, description, macCode, status, maintenanceSince, session } = computer

  const isAvailable = status === 'available'
  const isInUse = status === 'in-use'
  const isInMaintenance = status === 'maintenance'

  // Sala sem cota configurada zeraria o divisor e a barra viraria `NaN%`, que o CSS descarta em silêncio.
  const remainingPercentage = session && standardTime > 0 ? Math.min(100, (session.remainingMinutes / standardTime) * 100) : 0

  return (
    <article
      className={cn(
        'relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-xs transition-shadow hover:shadow-md',
        isAvailable && 'border-green-600/25',
        isInUse && 'border-rose-700/30',
        isInMaintenance && 'border-slate-500/30'
      )}
    >
      <span
        aria-hidden
        className={cn(
          'absolute inset-y-0 left-0 w-1',
          isAvailable && 'bg-green-600',
          isInUse && 'bg-rose-700',
          isInMaintenance && 'bg-slate-500'
        )}
      />

      <header className="flex items-start justify-between gap-3 p-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <Tooltip>
            <TooltipTrigger
              render={
                <span
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-lg border',
                    isAvailable && 'border-green-600/25 bg-green-600/10 text-green-600',
                    isInUse && 'border-rose-700/25 bg-rose-700/10 text-rose-700',
                    isInMaintenance && 'border-slate-500/25 bg-slate-500/10 text-slate-500'
                  )}
                />
              }
            >
              <MonitorIcon className="size-4.5" />
            </TooltipTrigger>

            {/* O MAC é o que identifica a máquina fisicamente quando há dúvida sobre qual gabinete é qual. */}
            <TooltipContent>{macCode}</TooltipContent>
          </Tooltip>

          <div className="min-w-0">
            <h3 className="font-semibold text-base text-primary leading-tight">{name}</h3>
            <p className="truncate text-muted-foreground text-xs">{description}</p>
          </div>
        </div>

        <span
          className={cn(
            'flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 font-medium text-[11px]',
            isAvailable && 'border-green-600/25 bg-green-600/10 text-green-600',
            isInUse && 'border-rose-700/25 bg-rose-700/10 text-rose-700',
            isInMaintenance && 'border-slate-500/25 bg-slate-500/10 text-slate-500'
          )}
        >
          <span
            className={cn(
              'size-1.5 min-w-1.5 animate-pulse rounded-full',
              isAvailable && 'bg-green-600',
              isInUse && 'bg-rose-700',
              isInMaintenance && 'bg-slate-500'
            )}
          />
          {isAvailable && 'Disponível'}
          {isInUse && 'Em uso'}
          {isInMaintenance && 'Manutenção'}
        </span>
      </header>

      <div className="flex flex-1 flex-col gap-2.5 px-4 pb-4">
        {isAvailable && (
          <p className="flex items-center gap-2 text-muted-foreground text-sm">
            <CheckIcon className="size-4 shrink-0 text-green-600" />
            Livre · cota de {standardTime} min no dia
          </p>
        )}

        {isInUse && session && (
          <>
            <p className="flex min-w-0 items-center gap-2">
              <UserRoundIcon className="size-4 shrink-0 text-muted-foreground" />
              <span className="truncate font-medium text-sm">{session.lawyerName}</span>
            </p>

            <div className="flex items-baseline justify-between gap-2">
              <span className="font-semibold text-lg text-rose-700 tabular-nums">
                {formatMinutesAsClock(session.remainingMinutes)}
              </span>

              <span className="truncate text-muted-foreground text-xs">desde {formatDateTime(session.startDate)}</span>
            </div>

            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-rose-700 transition-all" style={{ width: `${remainingPercentage}%` }} />
            </div>

            {session.usedAllTime && <p className="text-amber-600 text-xs dark:text-amber-400">Cota do dia esgotada.</p>}
          </>
        )}

        {/* Ocupada sem sessão aberta que responda por ela. Pode ser o Desktop que caiu sem encerrar,
            ou as liberações da sala que não carregaram — o board avisa qual dos dois. Encerrar exige um
            `sessionId`, então em nenhum dos casos há ação a oferecer aqui. */}
        {isInUse && !session && (
          <p className="text-muted-foreground text-sm">Em uso sem sessão registrada — não há o que encerrar daqui.</p>
        )}

        {isInMaintenance && (
          <p className="flex items-center gap-2 text-muted-foreground text-sm">
            <WrenchIcon className="size-4 shrink-0 text-slate-500" />
            {maintenanceSince ? `Fora de operação desde ${formatDateTime(maintenanceSince)}` : 'Fora de operação'}
          </p>
        )}
      </div>

      <footer className="mt-auto flex items-center gap-2 border-t bg-muted/40 p-3">
        {isAvailable && (
          <>
            <Button className="flex-1" disabled={isMaintenancePending} onClick={() => onRelease(computer)}>
              <LockOpenIcon data-icon="inline-start" />
              Liberar
            </Button>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label={`Colocar o ${name} em manutenção`}
                    disabled={isMaintenancePending}
                    onClick={() => onPutIntoMaintenance(computer)}
                  />
                }
              >
                <WrenchIcon />
              </TooltipTrigger>

              <TooltipContent>Colocar em manutenção</TooltipContent>
            </Tooltip>
          </>
        )}

        {/* Sem ação de manutenção aqui de propósito: a API recusa com 400 a máquina em uso, e a sessão
            do advogado tem de ser encerrada antes. Oferecer o botão só entregaria um erro no clique. */}
        {isInUse && (
          <Button variant="outline" className="flex-1" disabled={!session} onClick={() => session && onCloseSession(computer)}>
            <PowerIcon data-icon="inline-start" />
            Encerrar sessão
          </Button>
        )}

        {isInMaintenance && (
          <Button
            variant="outline"
            className="flex-1"
            disabled={isMaintenancePending}
            onClick={() => onTakeOutOfMaintenance(computer)}
          >
            <WrenchIcon data-icon="inline-start" />
            {isMaintenancePending ? 'Devolvendo...' : 'Devolver à operação'}
          </Button>
        )}
      </footer>
    </article>
  )
}
