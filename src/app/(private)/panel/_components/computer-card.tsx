'use client'

import { CheckIcon, LockOpenIcon, MonitorIcon, PowerIcon, UnplugIcon, UserRoundIcon, WrenchIcon } from 'lucide-react'
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
  const { name, description, macCode, status, maintenanceSince, session, isOnline, version } = computer

  const isAvailable = status === 'available'
  const isInUse = status === 'in-use'
  const isInMaintenance = status === 'maintenance'

  // `null` (o painel não conseguiu consultar quem está conectado) não vale como offline: na dúvida o
  // card se comporta como antes e a liberação segue, com o desfazer automático do board como rede.
  const isOffline = isOnline === false

  // Máquina livre mas muda não é máquina livre: quem libera nela grava sessão numa tela que não abre.
  // Ela ganha o tom de aviso em vez do verde para não ser lida de relance como pronta para uso.
  const isFree = isAvailable && !isOffline
  const isAvailableOffline = isAvailable && isOffline

  // Sala sem cota configurada zeraria o divisor e a barra viraria `NaN%`, que o CSS descarta em silêncio.
  const remainingPercentage = session && standardTime > 0 ? Math.min(100, (session.remainingMinutes / standardTime) * 100) : 0

  return (
    <article
      className={cn(
        'relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-xs transition-shadow hover:shadow-md',
        isFree && 'border-green-600/25',
        isAvailableOffline && 'border-amber-500/30',
        isInUse && 'border-rose-700/30',
        isInMaintenance && 'border-slate-500/30'
      )}
    >
      <span
        aria-hidden
        className={cn(
          'absolute inset-y-0 left-0 w-1',
          isFree && 'bg-green-600',
          isAvailableOffline && 'bg-amber-500',
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
                    isFree && 'border-green-600/25 bg-green-600/10 text-green-600',
                    isAvailableOffline && 'border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400',
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

        <div className="flex shrink-0 flex-col items-end gap-1">
          <span
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 font-medium text-[11px]',
              isFree && 'border-green-600/25 bg-green-600/10 text-green-600',
              isAvailableOffline && 'border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400',
              isInUse && 'border-rose-700/25 bg-rose-700/10 text-rose-700',
              isInMaintenance && 'border-slate-500/25 bg-slate-500/10 text-slate-500'
            )}
          >
            <span
              className={cn(
                'size-1.5 min-w-1.5 animate-pulse rounded-full',
                isFree && 'bg-green-600',
                isAvailableOffline && 'bg-amber-500',
                isInUse && 'bg-rose-700',
                isInMaintenance && 'bg-slate-500'
              )}
            />
            {isFree && 'Disponível'}
            {isAvailableOffline && 'Offline'}
            {isInUse && 'Em uso'}
            {isInMaintenance && 'Manutenção'}
          </span>

          {/* Versão do Desktop instalado na estação. Fica aqui, e não dentro do tooltip do MAC, porque
              o que se quer é varrer a grade e achar a máquina destoante — informação que só aparece no
              hover não responde isso. É `tabular-nums` para os números alinharem entre os cards. */}
          <Tooltip>
            <TooltipTrigger
              render={
                <span
                  className={cn(
                    'cursor-default font-medium text-[11px] tabular-nums',
                    version ? 'text-muted-foreground' : 'text-muted-foreground/60',
                    // Âmbar aparece de novo aqui, e o card já o usa para "offline". A sobreposição é
                    // aceita: são dois avisos legítimos sobre a mesma máquina, cada um no seu lugar,
                    // e o rótulo ao lado do ponto diz qual é qual.
                    version?.isOutdated && 'text-amber-600 dark:text-amber-400'
                  )}
                />
              }
            >
              {version ? `v${version.number}` : 'v—'}
            </TooltipTrigger>

            <TooltipContent>
              {version ? (
                <>
                  {version.isOutdated ? 'Atrás de outras estações desta sala' : 'Versão do aplicativo nesta estação'}
                  {/* O carimbo é de quando ela se apresentou, não de quando esteve online: a versão só
                      viaja na conexão, então máquina que não cai há semanas mostra data antiga estando no ar. */}
                  {version.reportedAt && ` · informada em ${formatDateTime(version.reportedAt)}`}
                </>
              ) : (
                // Não é erro: ou a estação não conectou desde que a api-fr passou a guardar, ou o envio
                // está desligado na configuração dela. Dizer "sem informação" é mais honesto que sumir.
                'Esta estação nunca informou a versão'
              )}
            </TooltipContent>
          </Tooltip>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-2.5 px-4 pb-4">
        {isFree && (
          <p className="flex items-center gap-2 text-muted-foreground text-sm">
            <CheckIcon className="size-4 shrink-0 text-green-600" />
            Livre · cota de {standardTime} min no dia
          </p>
        )}

        {isAvailableOffline && (
          <>
            <p className="flex items-center gap-2 font-medium text-amber-600 text-sm dark:text-amber-400">
              <UnplugIcon className="size-4 shrink-0" />
              Estação offline
            </p>

            <p className="text-muted-foreground text-xs leading-relaxed">
              Desligada, sem rede ou com o programa fechado. Ligue o computador ou use outro.
            </p>
          </>
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

        {/* Encerrar continua valendo — a sessão morre no banco e a máquina volta a livre. O que não
            acontece é a tela dela limpar sozinha, e quem está no balcão precisa saber disso. */}
        {isInUse && isOffline && (
          <p className="text-amber-600 text-xs dark:text-amber-400">
            Estação offline — o encerramento não vai limpar a tela dela.
          </p>
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
            {/* Estação offline não libera: a sessão seria gravada e a tela continuaria trancada. O
                botão de manutenção fica de pé, porque tirar de operação a máquina muda é justamente o
                que o balcão costuma querer fazer em seguida. */}
            <Button className="flex-1" disabled={isMaintenancePending || isOffline} onClick={() => onRelease(computer)}>
              <LockOpenIcon data-icon="inline-start" />
              {isOffline ? 'Offline' : 'Liberar'}
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
