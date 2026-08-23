'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2Icon, ToggleLeftIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { queryKeys } from '@/constants/query-keys'
import { formatWaitTime, getApiErrorMessage, getRetryAfterInSeconds } from '@/lib/http/api-error'
import { activateRoom } from '@/server/rooms/activate'
import type { RoomProps } from '@/server/rooms/get-all'

type ActivateRoomProps = {
  room: RoomProps
}

/** Reativar é construtivo e reversível pelo botão ao lado: vai direto, sem confirmação. */
export function ActivateRoom({ room }: ActivateRoomProps) {
  const queryClient = useQueryClient()

  const { mutateAsync: activateRoomMutation, isPending: isActivating } = useMutation({
    mutationFn: activateRoom,
  })

  async function handleActivateRoom() {
    try {
      await activateRoomMutation(room.id)

      await queryClient.invalidateQueries({ queryKey: queryKeys.getRooms() })

      toast.success(`Sala ${room.name} reativada.`, {
        description: 'Ela volta a aparecer no quadro de liberação dos funcionários.',
      })
    } catch (err) {
      const retryAfterInSeconds = getRetryAfterInSeconds(err)

      toast.error(
        retryAfterInSeconds
          ? `Muitas tentativas. Tente novamente em ${formatWaitTime(retryAfterInSeconds)}.`
          : getApiErrorMessage(err, 'Não foi possível reativar a sala. Verifique sua conexão e tente novamente.')
      )
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={`Reativar a sala ${room.name}`}
            className="text-destructive"
            disabled={isActivating}
            onClick={handleActivateRoom}
          />
        }
      >
        {isActivating ? <Loader2Icon className="animate-spin" /> : <ToggleLeftIcon />}
      </TooltipTrigger>

      <TooltipContent>Reativar sala</TooltipContent>
    </Tooltip>
  )
}
