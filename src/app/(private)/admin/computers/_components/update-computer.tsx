'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2Icon, SaveIcon, SquarePen, TriangleAlertIcon } from 'lucide-react'
import { useState } from 'react'
import { Controller, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { queryKeys } from '@/constants/query-keys'
import { formatWaitTime, getApiErrorMessage, getRetryAfterInSeconds } from '@/lib/http/api-error'
import type { ComputerWithRoomProps } from '@/server/computers/get-all'
import { updateComputer } from '@/server/computers/update'
import { getAllRooms } from '@/server/rooms/get-all'
import { maskMacCode } from '@/utils/masks/mac-code'
import { type UpdateComputerFormType, useUpdateComputerForm } from './update-computer-schema'

type UpdateComputerProps = {
  computer: ComputerWithRoomProps
}

export function UpdateComputer({ computer }: UpdateComputerProps) {
  const [open, setOpen] = useState(false)

  const queryClient = useQueryClient()

  const computerFormValues: UpdateComputerFormType = {
    macCode: computer.macCode,
    number: computer.number,
    description: computer.description,
    roomId: computer.room.id,
  }

  const {
    register,
    reset,
    control,
    setFocus,
    handleSubmit,
    formState: { errors, isDirty },
  } = useUpdateComputerForm(computerFormValues)

  const {
    data,
    isPending: isLoadingRooms,
    isError: hasRoomsError,
  } = useQuery({
    queryKey: queryKeys.getRooms(),
    queryFn: getAllRooms,
  })

  const rooms = data?.rooms ?? []
  const activeRooms = rooms.filter(room => room.inactive === null)

  // A sala atual entra na lista mesmo inativa. Sem isso, a máquina que está justamente numa sala desativada
  // abriria o seletor sem valor algum, e a edição pareceria quebrada antes de o usuário tocar em nada.
  const currentRoom = rooms.find(room => room.id === computer.room.id)
  const selectableRooms = currentRoom && currentRoom.inactive !== null ? [currentRoom, ...activeRooms] : activeRooms

  const roomId = useWatch({ control, name: 'roomId' })

  const selectedRoom = selectableRooms.find(room => room.id === roomId)

  // Os números da própria máquina não contam como ocupados para ela mesma — a API compara com
  // `id: { not: id }`, e listar o próprio número como "em uso" mandaria trocar um número que já é válido.
  const usedNumbers =
    selectedRoom?.computers
      .filter(({ id }) => id !== computer.id)
      .map(({ number }) => number)
      .sort((a, b) => a - b) ?? []

  const isMovingRoom = roomId !== computer.room.id

  const { mutateAsync: updateComputerMutation, isPending: isUpdating } = useMutation({
    mutationFn: updateComputer,
  })

  /** Reabrir descarta o rascunho anterior: o diálogo é uma correção pontual, não um formulário em curso. */
  function handleOpenChange(value: boolean) {
    if (value) {
      reset(computerFormValues)
      setOpen(true)

      return
    }

    // Fechar no meio da chamada esconderia o contexto: o toast de erro chegaria sem os dados na tela.
    if (isUpdating) return

    setOpen(false)
  }

  async function handleUpdateComputer({ macCode, number, description, roomId }: UpdateComputerFormType) {
    try {
      await updateComputerMutation({ computerId: computer.id, macCode, number, description, roomId })

      // As mesmas duas listas do cadastro: a tabela desta tela e o inventário embutido nas salas, que
      // alimenta a grade do painel — e que muda de lugar quando a máquina troca de sala.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.getComputers() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.getRooms() }),
      ])

      toast.success(`${description.toUpperCase()} atualizado.`, {
        description: `MAC ${macCode} na sala ${selectedRoom?.name}.`,
      })

      setOpen(false)
    } catch (err) {
      // O MAC é o campo que a API mais recusa e o único que não dá para conferir olhando a máquina.
      setFocus('macCode')

      const retryAfterInSeconds = getRetryAfterInSeconds(err)

      toast.error(
        retryAfterInSeconds
          ? `Muitas tentativas. Tente novamente em ${formatWaitTime(retryAfterInSeconds)}.`
          : getApiErrorMessage(err, 'Não foi possível salvar as alterações. Verifique sua conexão e tente novamente.')
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
              aria-label={`Editar o computador ${computer.description}`}
              onClick={() => handleOpenChange(true)}
            />
          }
        >
          <SquarePen />
        </TooltipTrigger>

        <TooltipContent>Editar computador</TooltipContent>
      </Tooltip>

      <Dialog open={open} onOpenChange={handleOpenChange} disablePointerDismissal>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar computador</DialogTitle>
          </DialogHeader>

          {/* A API aceita editar máquina em uso; quem avisa do efeito colateral é a tela. Trocar o endereço
              com uma sessão aberta desliga a estação da grade até o Desktop reconectar com o MAC novo. */}
          {computer.inUse && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/8 px-3.5 py-3 text-amber-700 dark:text-amber-400"
            >
              <TriangleAlertIcon className="mt-px size-4 shrink-0" />

              <span className="text-sm leading-snug">
                Máquina em uso. Trocar o código MAC ou a sala agora tira a estação da grade até o Desktop reconectar.
              </span>
            </div>
          )}

          <form noValidate id="update-computer-form" onSubmit={handleSubmit(handleUpdateComputer)}>
            <FieldGroup>
              <Field data-invalid={!!errors.roomId}>
                <FieldLabel htmlFor="update-computer-room">Sala</FieldLabel>

                <Controller
                  control={control}
                  name="roomId"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={(value: string | null) => value && field.onChange(value)}>
                      <SelectTrigger
                        id="update-computer-room"
                        ref={field.ref}
                        disabled={isLoadingRooms || hasRoomsError}
                        aria-invalid={!!errors.roomId}
                        className="h-10 w-full"
                      >
                        <SelectValue>
                          {(value: string) =>
                            selectableRooms.find(room => room.id === value)?.name ?? (
                              <span className="text-muted-foreground text-sm">
                                {isLoadingRooms ? 'Carregando salas...' : 'Selecione a sala'}
                              </span>
                            )
                          }
                        </SelectValue>
                      </SelectTrigger>

                      <SelectContent>
                        {selectableRooms.map(room => (
                          <SelectItem key={room.id} value={room.id} className="py-2">
                            <div className="flex min-w-0 flex-col gap-0.5">
                              <span className="truncate font-medium">{room.name}</span>

                              <span className="text-muted-foreground text-xs">
                                {room.inactive
                                  ? 'Sala inativa'
                                  : room.computers.length === 1
                                    ? '1 computador'
                                    : `${room.computers.length} computadores`}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />

                {errors.roomId ? (
                  <FieldError errors={[errors.roomId]} />
                ) : hasRoomsError ? (
                  <FieldDescription>Não foi possível carregar as salas. Recarregue a página e tente de novo.</FieldDescription>
                ) : (
                  isMovingRoom && (
                    <FieldDescription>A máquina sai da {computer.room.name} e passa a valer na sala escolhida.</FieldDescription>
                  )
                )}
              </Field>

              <Field data-invalid={!!errors.number}>
                <FieldLabel htmlFor="update-computer-number">Número</FieldLabel>

                <Input
                  id="update-computer-number"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  step={1}
                  placeholder="1"
                  aria-invalid={!!errors.number}
                  className="h-10 text-sm tabular-nums"
                  {...register('number', { valueAsNumber: true })}
                />

                {errors.number ? (
                  <FieldError errors={[errors.number]} />
                ) : (
                  usedNumbers.length > 0 && <FieldDescription>Já em uso nesta sala: {usedNumbers.join(', ')}.</FieldDescription>
                )}
              </Field>

              <Field data-invalid={!!errors.description}>
                <FieldLabel htmlFor="update-computer-description">Descrição</FieldLabel>

                <Input
                  id="update-computer-description"
                  placeholder="COMPUTADOR 01"
                  autoComplete="off"
                  aria-invalid={!!errors.description}
                  className="h-10 text-sm uppercase placeholder:normal-case"
                  {...register('description')}
                />

                {errors.description ? (
                  <FieldError errors={[errors.description]} />
                ) : (
                  <FieldDescription>Não pode repetir dentro da mesma sala.</FieldDescription>
                )}
              </Field>

              <Field data-invalid={!!errors.macCode}>
                <FieldLabel htmlFor="update-computer-mac">Código MAC</FieldLabel>

                <Controller
                  control={control}
                  name="macCode"
                  render={({ field }) => (
                    <Input
                      id="update-computer-mac"
                      placeholder="00-1A-2B-3C-4D-5E"
                      autoComplete="off"
                      maxLength={17}
                      aria-invalid={!!errors.macCode}
                      className="h-10 text-sm tracking-wider"
                      name={field.name}
                      ref={field.ref}
                      value={field.value}
                      onBlur={field.onBlur}
                      onChange={event => field.onChange(maskMacCode(event.target.value))}
                    />
                  )}
                />

                {errors.macCode ? (
                  <FieldError errors={[errors.macCode]} />
                ) : (
                  <FieldDescription>Endereço físico da placa de rede da máquina.</FieldDescription>
                )}
              </Field>
            </FieldGroup>
          </form>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" disabled={isUpdating} />}>Cancelar</DialogClose>

            {/* `isDirty` porque salvar sem mudança nenhuma gastaria um PATCH para reescrever o mesmo registro. */}
            <Button type="submit" form="update-computer-form" disabled={!isDirty || isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2Icon data-icon="inline-start" className="animate-spin" /> Salvando
                </>
              ) : (
                <>
                  <SaveIcon data-icon="inline-start" /> Salvar alterações
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
