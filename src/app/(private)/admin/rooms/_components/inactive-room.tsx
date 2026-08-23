'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2Icon, ToggleRightIcon, TriangleAlertIcon } from 'lucide-react'
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
import type { RoomProps } from '@/server/rooms/get-all'
import { deactivateRoom } from '@/server/rooms/inactive'

type InactiveRoomProps = {
  room: RoomProps
}

export function InactiveRoom({ room }: InactiveRoomProps) {
  const [open, setOpen] = useState(false)

  const queryClient = useQueryClient()

  const { mutateAsync: deactivateRoomMutation, isPending: isDeactivating } = useMutation({
    mutationFn: deactivateRoom,
  })

  const computersCount = room.computers.length

  /** Fechar no meio da chamada esconderia o contexto da ação: o toast de erro chegaria sem a sala na tela. */
  function handleOpenChange(value: boolean) {
    if (!value && isDeactivating) return

    setOpen(value)
  }

  async function handleDeactivateRoom() {
    try {
      await deactivateRoomMutation(room.id)

      await queryClient.invalidateQueries({ queryKey: queryKeys.getRooms() })

      toast.success(`Sala ${room.name} inativada.`, {
        description: 'Ela continua na lista, marcada como inativa, e pode ser reativada a qualquer momento.',
      })

      setOpen(false)
    } catch (err) {
      const retryAfterInSeconds = getRetryAfterInSeconds(err)

      toast.error(
        retryAfterInSeconds
          ? `Muitas tentativas. Tente novamente em ${formatWaitTime(retryAfterInSeconds)}.`
          : getApiErrorMessage(err, 'Não foi possível inativar a sala. Verifique sua conexão e tente novamente.')
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
              aria-label={`Inativar a sala ${room.name}`}
              className="text-emerald-600"
              onClick={() => setOpen(true)}
            />
          }
        >
          <ToggleRightIcon />
        </TooltipTrigger>

        <TooltipContent>Inativar sala</TooltipContent>
      </Tooltip>

      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <TriangleAlertIcon />
            </AlertDialogMedia>

            <AlertDialogTitle>Inativar a sala {room.name}?</AlertDialogTitle>

            <AlertDialogDescription>
              Ela sai do quadro de liberação e{' '}
              {computersCount === 0
                ? 'nenhum computador é afetado'
                : `${computersCount} computador${computersCount === 1 ? '' : 'es'} ${
                    computersCount === 1 ? 'deixa' : 'deixam'
                  } de aparecer para os funcionários`}
              . Nada é apagado: você pode reativar depois.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeactivating}>Cancelar</AlertDialogCancel>

            {/* Sem `disabled`, o duplo clique dispara dois PATCH: o segundo volta como "Sala já está
                inativa." e o usuário vê um erro para uma sala que acabou de ser inativada com sucesso. */}
            <AlertDialogAction variant="destructive" disabled={isDeactivating} onClick={handleDeactivateRoom}>
              {isDeactivating ? (
                <>
                  <Loader2Icon data-icon="inline-start" className="animate-spin" /> Inativando
                </>
              ) : (
                'Inativar sala'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
