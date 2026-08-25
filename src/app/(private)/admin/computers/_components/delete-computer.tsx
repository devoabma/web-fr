'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2Icon, Trash2Icon } from 'lucide-react'
import { type KeyboardEvent, useId, useState } from 'react'
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
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { queryKeys } from '@/constants/query-keys'
import { formatWaitTime, getApiErrorMessage, getRetryAfterInSeconds } from '@/lib/http/api-error'
import { deleteComputer } from '@/server/computers/delete'
import type { ComputerWithRoomProps } from '@/server/computers/get-all'

type DeleteComputerProps = {
  computer: ComputerWithRoomProps
}

export function DeleteComputer({ computer }: DeleteComputerProps) {
  const [open, setOpen] = useState(false)
  const [confirmation, setConfirmation] = useState('')

  const confirmationId = useId()

  const queryClient = useQueryClient()

  const { mutateAsync: deleteComputerMutation, isPending: isDeleting } = useMutation({
    mutationFn: deleteComputer,
  })

  const stationName = `ESTAÇÃO-${String(computer.number).padStart(2, '0')}`

  // A api-fr recusa com 400 a máquina em uso, e a sessão do advogado tem de ser encerrada antes.
  // `aria-disabled` em vez de `disabled` porque botão desabilitado não dispara hover: o tooltip é
  // justamente o que explica por que a ação está fora do ar.
  const isInUse = computer.inUse

  // Exclusão que apaga histórico não pode cair num clique errado. A conferência é insensível a caixa
  // e a espaço nas pontas: o atrito serve para o usuário reler o nome, não para brigar com o teclado.
  const isConfirmed = confirmation.trim().toUpperCase() === computer.description.trim().toUpperCase()

  function closeDialog() {
    setOpen(false)
    // Sem limpar, reabrir o diálogo já viria confirmado — o atrito valeria só na primeira vez.
    setConfirmation('')
  }

  /** Fechar no meio da chamada esconderia o contexto da ação: o toast de erro chegaria sem a máquina na tela. */
  function handleOpenChange(value: boolean) {
    if (value) {
      setOpen(true)
      return
    }

    if (isDeleting) return

    closeDialog()
  }

  /** O Enter no campo confirma, como em qualquer formulário — mas só quando o nome já bate. */
  function handleConfirmationKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return

    event.preventDefault()

    if (isConfirmed && !isDeleting) handleDeleteComputer()
  }

  async function handleDeleteComputer() {
    try {
      await deleteComputerMutation(computer.id)

      // A máquina some de duas listas: a tabela desta tela e o inventário embutido nas salas, que
      // alimenta o painel de operação e a sugestão de próximo número livre no cadastro.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.getComputers() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.getRooms() }),
      ])

      toast.success(`${computer.description} excluído.`, {
        description: `Saiu do inventário da ${computer.room.name}.`,
      })

      closeDialog()
    } catch (err) {
      const retryAfterInSeconds = getRetryAfterInSeconds(err)

      toast.error(
        retryAfterInSeconds
          ? `Muitas tentativas. Tente novamente em ${formatWaitTime(retryAfterInSeconds)}.`
          : getApiErrorMessage(err, 'Não foi possível excluir o computador. Verifique sua conexão e tente novamente.')
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
              aria-disabled={isInUse}
              aria-label={`Excluir o computador ${computer.description}`}
              className="text-destructive aria-disabled:opacity-50"
              onClick={() => !isInUse && setOpen(true)}
            />
          }
        >
          <Trash2Icon />
        </TooltipTrigger>

        <TooltipContent>{isInUse ? 'Em uso — encerre a sessão para poder excluir' : 'Excluir computador'}</TooltipContent>
      </Tooltip>

      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <Trash2Icon />
            </AlertDialogMedia>

            <AlertDialogTitle>Excluir {computer.description}?</AlertDialogTitle>

            <AlertDialogDescription>
              {stationName} na {computer.room.name}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <p className="text-muted-foreground text-sm">Apaga também o histórico de liberações e as impressões — não tem volta.</p>

          <Field>
            <FieldLabel htmlFor={confirmationId} className="block text-center text-muted-foreground text-xs sm:text-left">
              Digite <span className="font-medium text-foreground">{computer.description}</span> para confirmar
            </FieldLabel>

            <Input
              id={confirmationId}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              disabled={isDeleting}
              value={confirmation}
              onChange={({ target }) => setConfirmation(target.value)}
              onKeyDown={handleConfirmationKeyDown}
              className="h-10 text-sm uppercase"
            />
          </Field>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>

            <AlertDialogAction variant="destructive" disabled={!isConfirmed || isDeleting} onClick={handleDeleteComputer}>
              {isDeleting ? (
                <>
                  <Loader2Icon data-icon="inline-start" className="animate-spin" /> Excluindo
                </>
              ) : (
                'Excluir'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
