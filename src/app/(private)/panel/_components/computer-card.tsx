'use client'

import { CheckIcon, LockOpenIcon, MonitorIcon, PowerIcon, UserRoundIcon, WrenchIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { Computer } from '../_data/rooms'

type ComputerCardProps = {
  computer: Computer
  /** Cota da sala, usada como base da barra de tempo restante. */
  standardTime: number
  onRelease: (computer: Computer) => void
  onCloseSession: (computer: Computer) => void
  onToggleMaintenance: (computer: Computer) => void
}

/** `01:12` — no balcão o tempo é lido de relance, e "72 minutos" não se lê de relance. */
function formatMinutesAsClock(totalMinutes: number) {
  const safeMinutes = Math.max(0, Math.floor(totalMinutes))

  const hours = Math.floor(safeMinutes / 60)
  const minutes = safeMinutes % 60

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

/**
 * Fuso fixo do Maranhão em vez do relógio de quem renderiza.
 *
 * O card é client component, mas o Next também o renderiza no servidor — e servidor em UTC
 * formataria uma hora diferente da do navegador, o que o React acusa como erro de hidratação.
 */
function formatDateTime(isoDate: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Fortaleza',
  }).format(new Date(isoDate))
}

export function ComputerCard({ computer, standardTime, onRelease, onCloseSession, onToggleMaintenance }: ComputerCardProps) {
  const isAvailable = computer.status === 'available'
  const isInUse = computer.status === 'in-use'
  const isInMaintenance = computer.status === 'maintenance'

  const remainingMinutes = computer.remainingMinutes ?? 0
  const remainingPercentage = standardTime > 0 ? Math.min(100, Math.max(0, (remainingMinutes / standardTime) * 100)) : 0

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
          <span
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-lg border',
              isAvailable && 'border-green-600/25 bg-green-600/10 text-green-600',
              isInUse && 'border-rose-700/25 bg-rose-700/10 text-rose-700',
              isInMaintenance && 'border-slate-500/25 bg-slate-500/10 text-slate-500'
            )}
          >
            <MonitorIcon className="size-4.5" />
          </span>

          <div className="min-w-0">
            <h3 className="font-semibold text-base text-primary leading-tight">{computer.name}</h3>
            <p className="truncate text-muted-foreground text-xs">{computer.description}</p>
          </div>
        </div>

        <span
          className={cn(
            'flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-medium text-[11px]',
            isAvailable && 'border-green-600/25 bg-green-600/10 text-green-600',
            isInUse && 'border-rose-700/25 bg-rose-700/10 text-rose-700',
            isInMaintenance && 'border-slate-500/25 bg-slate-500/10 text-slate-500'
          )}
        >
          <span
            className={cn(
              'size-1.5 min-w-1.5 rounded-full',
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

      <div className="flex-1 px-4 pb-4">
        {isInUse && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <p className="flex min-w-0 items-center gap-1.5 text-sm">
                <UserRoundIcon className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate font-medium">{computer.lawyerName}</span>
              </p>

              <span className="shrink-0 font-semibold text-rose-700 text-sm tabular-nums">
                {formatMinutesAsClock(remainingMinutes)}
              </span>
            </div>

            {/* Barra do saldo do dia: o número diz quanto falta, a barra diz se é muito ou pouco. */}
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-rose-700 transition-[width]" style={{ width: `${remainingPercentage}%` }} />
            </div>

            <p className="text-muted-foreground text-xs">restante de {standardTime} min da cota do dia</p>
          </div>
        )}

        {isInMaintenance && (
          <p className="text-muted-foreground text-xs leading-relaxed">
            Bloqueado para uso
            {computer.maintenanceSince && ` desde ${formatDateTime(computer.maintenanceSince)}`}.
          </p>
        )}

        {isAvailable && <p className="text-muted-foreground text-xs leading-relaxed">Livre — pronto para receber uma liberação.</p>}
      </div>

      <footer className="flex items-center gap-2 border-t bg-muted/40 p-3">
        {isAvailable && (
          <Button className="flex-1" onClick={() => onRelease(computer)}>
            <LockOpenIcon data-icon="inline-start" />
            Liberar
          </Button>
        )}

        {isInUse && (
          <Button variant="destructive" className="flex-1" onClick={() => onCloseSession(computer)}>
            <PowerIcon data-icon="inline-start" />
            Encerrar sessão
          </Button>
        )}

        {isInMaintenance && (
          <Button variant="outline" className="flex-1" onClick={() => onToggleMaintenance(computer)}>
            <CheckIcon data-icon="inline-start" />
            Voltar ao normal
          </Button>
        )}

        {!isInMaintenance && (
          <Tooltip>
            {/* O gatilho é um `span` porque botão desabilitado não dispara evento de ponteiro —
                sem o wrapper, a explicação de por que ele está travado nunca apareceria. */}
            <TooltipTrigger render={<span className="inline-flex" />}>
              <Button
                variant="outline"
                size="icon"
                disabled={isInUse}
                aria-label="Colocar em manutenção"
                onClick={() => onToggleMaintenance(computer)}
              >
                <WrenchIcon />
              </Button>
            </TooltipTrigger>

            <TooltipContent>
              {isInUse ? 'Encerre a sessão antes de colocar em manutenção' : 'Colocar em manutenção'}
            </TooltipContent>
          </Tooltip>
        )}
      </footer>
    </article>
  )
}
