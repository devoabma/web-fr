'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2Icon, SaveIcon, SquarePen } from 'lucide-react'
import { useState } from 'react'
import { Controller, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { queryKeys } from '@/constants/query-keys'
import { type Uf, UF_NAMES, UFS } from '@/constants/ufs'
import { formatWaitTime, getApiErrorMessage, getRetryAfterInSeconds } from '@/lib/http/api-error'
import type { RoomProps } from '@/server/rooms/get-all'
import { updateRoom } from '@/server/rooms/update'
import { formatDuration } from '@/utils'
import { maskSlug } from '@/utils/masks/slug'
import { type UpdateRoomFormType, useUpdateRoomForm } from './update-room-schema'

type UpdateRoomProps = {
  room: RoomProps
}

export function UpdateRoom({ room }: UpdateRoomProps) {
  const [open, setOpen] = useState(false)

  const queryClient = useQueryClient()

  const roomFormValues: UpdateRoomFormType = {
    name: room.name,
    uf: room.uf,
    standardTime: room.standardTime,
    description: room.description ?? '',
  }

  const {
    register,
    reset,
    control,
    setFocus,
    handleSubmit,
    formState: { errors, isDirty },
  } = useUpdateRoomForm(roomFormValues)

  const { mutateAsync: updateRoomMutation, isPending: isUpdating } = useMutation({
    mutationFn: updateRoom,
  })

  const name = useWatch({ control, name: 'name' })
  const uf = useWatch({ control, name: 'uf' })
  const standardTime = useWatch({ control, name: 'standardTime' })

  const standardTimeHint = formatDuration(standardTime)

  const slugPreview = maskSlug(name)

  const isChangingUf = uf !== room.uf

  function handleOpenChange(value: boolean) {
    if (value) {
      reset(roomFormValues)
      setOpen(true)

      return
    }

    if (isUpdating) return

    setOpen(false)
  }

  async function handleUpdateRoom({ name, uf, standardTime, description }: UpdateRoomFormType) {
    try {
      await updateRoomMutation({
        roomId: room.id,
        name,
        // Só viaja quando muda: no PATCH a UF não tem padrão, e campo ausente é o que diz
        // "não mexe" — reenviar a mesma sigla a cada edição de nome seria escrita à toa.
        ...(uf !== room.uf && { uf }),
        standardTime,
        description: description || null,
      })

      await queryClient.invalidateQueries({ queryKey: queryKeys.getRooms() })

      toast.success('Sala atualizada com sucesso.', {
        description: `${uf} · ${formatDuration(standardTime)} de cota por advogado.`,
      })

      setOpen(false)
    } catch (err) {
      setFocus('name')

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
              aria-label={`Editar a sala ${room.name}`}
              onClick={() => handleOpenChange(true)}
            />
          }
        >
          <SquarePen />
        </TooltipTrigger>

        <TooltipContent>Editar sala</TooltipContent>
      </Tooltip>

      <Dialog open={open} onOpenChange={handleOpenChange} disablePointerDismissal>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar sala</DialogTitle>

            <DialogDescription>
              As mudanças valem para as próximas liberações — as que já estão em andamento mantêm o tempo com que começaram.
            </DialogDescription>
          </DialogHeader>

          <form noValidate id="update-room-form" onSubmit={handleSubmit(handleUpdateRoom)}>
            <FieldGroup>
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="update-room-name">Nome da sala</FieldLabel>

                <Input
                  id="update-room-name"
                  placeholder="Sala de Liberação 1"
                  autoComplete="off"
                  aria-invalid={!!errors.name}
                  className="h-10"
                  {...register('name')}
                />

                {errors.name ? (
                  <FieldError errors={[errors.name]} />
                ) : (
                  slugPreview && <FieldDescription>Identificador: {slugPreview}</FieldDescription>
                )}
              </Field>

              <Field data-invalid={!!errors.uf}>
                <FieldLabel htmlFor="update-room-uf">Estado</FieldLabel>

                <Controller
                  control={control}
                  name="uf"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={(value: Uf | null) => value && field.onChange(value)}>
                      <SelectTrigger id="update-room-uf" ref={field.ref} aria-invalid={!!errors.uf} className="h-10 w-full">
                        <SelectValue>
                          {(value: Uf | null) =>
                            value ? (
                              <span className="flex items-center gap-2">
                                <span className="font-medium">{value}</span>

                                <span className="text-muted-foreground text-sm">{UF_NAMES[value]}</span>
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-sm">Selecione o estado</span>
                            )
                          }
                        </SelectValue>
                      </SelectTrigger>

                      <SelectContent className="max-h-72">
                        {UFS.map(uf => (
                          <SelectItem key={uf} value={uf} className="py-2">
                            <span className="w-7 shrink-0 font-medium">{uf}</span>

                            <span className="text-muted-foreground text-xs">{UF_NAMES[uf]}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />

                {/* A troca não é instantânea: o Desktop só descobre a UF nova no próximo registro do
                    canal WebSocket, e é ela que ele grava em disco para decidir se entra na publicação
                    de versão do estado. Sem este aviso, a mudança pareceria já valer para as máquinas ligadas. */}
                {errors.uf ? (
                  <FieldError errors={[errors.uf]} />
                ) : (
                  isChangingUf && (
                    <FieldDescription>
                      As estações desta sala passarão a receber as atualizações de {UF_NAMES[uf]} ({uf}) na próxima vez que
                      conectarem.
                    </FieldDescription>
                  )
                )}
              </Field>

              <Field data-invalid={!!errors.standardTime}>
                <FieldLabel htmlFor="update-room-standard-time">Tempo padrão (minutos)</FieldLabel>

                <div className="flex items-center gap-2">
                  <Input
                    id="update-room-standard-time"
                    type="number"
                    inputMode="numeric"
                    min={15}
                    max={480}
                    step={15}
                    placeholder="180"
                    aria-invalid={!!errors.standardTime}
                    className="h-10 tabular-nums"
                    {...register('standardTime', { valueAsNumber: true })}
                  />

                  <span
                    aria-live="polite"
                    className="w-16 shrink-0 rounded-lg border bg-muted/40 px-2.5 py-2 text-center text-muted-foreground text-sm tabular-nums"
                  >
                    {standardTimeHint ?? '--'}
                  </span>
                </div>

                <FieldError errors={[errors.standardTime]} />
              </Field>

              <Field data-invalid={!!errors.description}>
                <FieldLabel htmlFor="update-room-description">Descrição</FieldLabel>

                <Textarea
                  id="update-room-description"
                  rows={3}
                  placeholder="Sala do 2º andar, ao lado do protocolo."
                  aria-invalid={!!errors.description}
                  className="resize-none"
                  {...register('description')}
                />

                <FieldError errors={[errors.description]} />
              </Field>
            </FieldGroup>
          </form>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" disabled={isUpdating} />}>Cancelar</DialogClose>

            <Button type="submit" form="update-room-form" disabled={!isDirty || isUpdating}>
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
