'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format, isValid, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Loader2Icon, MonitorUpIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { queryKeys } from '@/constants/query-keys'
import { formatWaitTime, getApiErrorMessage, getRetryAfterInSeconds } from '@/lib/http/api-error'
import { type ComputerWithRoomProps, getAllComputers } from '@/server/computers/get-all'
import { updateComputerApp } from '@/server/computers/update-app'

type UpdateComputerAppProps = {
  computer: ComputerWithRoomProps
}

/**
 * "Atualizar agora" de uma estação.
 *
 * A versão publicada vem do envelope da própria listagem, lido da cache do React Query em vez de
 * descer por props através das colunas da tabela: é a mesma `queryKey`, então não há requisição
 * nova — e a coluna de ações não precisa saber que existe uma versão publicada no mundo.
 */
export function UpdateComputerApp({ computer }: UpdateComputerAppProps) {
  const [open, setOpen] = useState(false)

  const queryClient = useQueryClient()

  const { data } = useQuery({
    queryKey: queryKeys.getComputers(),
    queryFn: getAllComputers,
  })

  const { mutateAsync: updateComputerAppMutation, isPending: isUpdating } = useMutation({
    mutationFn: updateComputerApp,
  })

  const latestVersion = data?.latestVersion ?? null

  const stationName = `ESTAÇÃO-${String(computer.number).padStart(2, '0')}`

  // Máquina comprovadamente em dia não ganha botão: seria oferecer uma ação que a api-fr recusa com
  // 400. A coluna Desktop já diz em que versão ela está, e isso basta.
  //
  // `unknown` só ganha botão quando a estação está no ar. Máquina conectada que não diz a versão é
  // justamente a que o suporte quer sacudir — e a api-fr aceita o pedido nesse caso. Desconectada e
  // sem versão conhecida não há o que oferecer: não se sabe se está atrasada, e ela não ouviria.
  const isOutdated = computer.updateStatus === 'outdated'
  const isUnknown = computer.updateStatus === 'unknown'

  if (!(isOutdated || (isUnknown && computer.isOnline))) {
    return null
  }

  // As duas travas que a api-fr aplica antes de gastar o canal, espelhadas aqui para o botão não
  // acender prometendo o que vai virar erro. `aria-disabled` em vez de `disabled` porque botão
  // desabilitado não dispara hover — e o tooltip é exatamente o que explica o porquê.
  const isBlocked = computer.inUse || !computer.isOnline

  // A bolinha só pulsa quando o clique tem para onde ir: versão nova, estação no ar e livre. Pulsar
  // numa máquina desconectada seria chamar atenção para um botão que não faz nada.
  const shouldPulse = isOutdated && !isBlocked

  const generatedAt = latestVersion?.generatedAt ? parseISO(latestVersion.generatedAt) : null

  function buildTooltip() {
    if (computer.inUse) return 'Em uso — a atualização espera o advogado(a) encerrar'

    if (!computer.isOnline) return 'Estação desconectada — ela busca a versão sozinha ao ser ligada'

    if (isUnknown) return 'Esta estação não informou a versão — mande conferir agora'

    return latestVersion ? `Nova versão v${latestVersion.version} disponível` : 'Nova versão disponível'
  }

  function handleOpenChange(value: boolean) {
    if (value) {
      setOpen(true)
      return
    }

    // Fechar no meio da chamada esconderia o contexto: o toast chegaria sem a máquina na tela.
    if (isUpdating) return

    setOpen(false)
  }

  async function handleUpdateComputerApp() {
    try {
      const result = await updateComputerAppMutation(computer.id)

      // A listagem carrega três coisas que mudam com o disparo — quem está online, em que versão
      // cada um está e qual é a publicada. Vale reler mesmo que a troca em si leve minutos.
      await queryClient.invalidateQueries({ queryKey: queryKeys.getComputers() })

      toast.success(`Pedido enviado para ${computer.description}.`, {
        description: result.version
          ? `Ela vai buscar a v${result.version} agora. A troca leva alguns minutos e a estação reinicia sozinha.`
          : 'Ela vai consultar o servidor de atualizações agora.',
      })

      setOpen(false)
    } catch (err) {
      const retryAfterInSeconds = getRetryAfterInSeconds(err)

      toast.error(
        retryAfterInSeconds
          ? `Muitas tentativas. Tente novamente em ${formatWaitTime(retryAfterInSeconds)}.`
          : getApiErrorMessage(err, 'Não foi possível pedir a atualização. Verifique sua conexão e tente novamente.')
      )
    }
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="outline"
              size="icon-sm"
              aria-disabled={isBlocked}
              aria-label={`Atualizar o aplicativo de ${computer.description}`}
              className="relative aria-disabled:opacity-50"
              onClick={() => !isBlocked && setOpen(true)}
            />
          }
        >
          <MonitorUpIcon />

          {/* O aviso de que há algo novo: o anel que se expande chama o olho de longe, e o ponto
              sólido embaixo continua legível quando a animação está desligada por preferência do
              sistema — `animate-ping` respeita `prefers-reduced-motion`, o ponto não depende dela. */}
          {shouldPulse && (
            <span className="absolute -top-0.5 -right-0.5 flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-600" />
            </span>
          )}
        </TooltipTrigger>

        <TooltipContent>{buildTooltip()}</TooltipContent>
      </Tooltip>

      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-emerald-600/10 text-emerald-700 dark:text-emerald-500">
              <MonitorUpIcon />
            </AlertDialogMedia>

            <AlertDialogTitle>Atualizar {computer.description}?</AlertDialogTitle>

            <AlertDialogDescription>
              {stationName} na {computer.room.name}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* De onde para onde. Sem a versão publicada em mãos o pedido continua válido — vira um
              "vá conferir agora" —, e a tela diz isso em vez de inventar um número. */}
          {latestVersion ? (
            <div className="flex items-center justify-center gap-3 rounded-lg border bg-muted/40 px-4 py-3">
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-muted-foreground text-xs">Instalada</span>
                <span className="font-mono text-sm tabular-nums">{computer.appVersion ? `v${computer.appVersion}` : '—'}</span>
              </div>

              <span aria-hidden className="text-muted-foreground">
                →
              </span>

              <div className="flex flex-col items-center gap-0.5">
                <span className="text-muted-foreground text-xs">Nova</span>
                <span className="font-medium font-mono text-emerald-700 text-sm tabular-nums dark:text-emerald-500">
                  v{latestVersion.version}
                </span>
              </div>
            </div>
          ) : (
            <p className="rounded-lg border bg-muted/40 px-4 py-3 text-center text-muted-foreground text-sm">
              O painel ainda não sabe qual é a versão publicada. A estação vai consultar o servidor de atualizações e instalar o
              que encontrar lá.
            </p>
          )}

          {/* As notas vêm do manifesto assinado, escritas em português pelo time do Desktop. É o que
              responde "o que muda nesta versão" sem ninguém precisar perguntar. */}
          {latestVersion?.notes && (
            <div className="flex flex-col gap-1.5">
              <span className="font-medium text-xs">O que muda nesta versão</span>

              <p className="text-muted-foreground text-sm leading-snug">{latestVersion.notes}</p>

              {generatedAt && isValid(generatedAt) && (
                <span className="text-muted-foreground text-xs">
                  Publicada em {format(generatedAt, "dd MMM. yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
              )}
            </div>
          )}

          {/* A promessa que o sistema inteiro faz: nenhuma versão interrompe advogado(a). Dizer isso
              aqui é o que dá coragem para o funcionário clicar no meio do expediente. */}
          <p className="text-muted-foreground text-sm leading-snug">
            A estação baixa em segundo plano e reinicia sozinha em poucos minutos. Se alguém começar a usar antes, a troca espera
            a sessão terminar — nenhuma atualização interrompe advogado(a).
          </p>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancelar</AlertDialogCancel>

            <AlertDialogAction disabled={isUpdating} onClick={handleUpdateComputerApp}>
              {isUpdating ? (
                <>
                  <Loader2Icon data-icon="inline-start" className="animate-spin" /> Enviando
                </>
              ) : (
                'Atualizar agora'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
