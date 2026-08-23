'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2Icon, PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { queryKeys } from '@/constants/query-keys'
import { formatWaitTime, getApiErrorMessage, getRetryAfterInSeconds } from '@/lib/http/api-error'
import { createRoom } from '@/server/rooms/create'
import { maskSlug } from '@/utils/masks/slug'
import { type NewRoomFormType, useNewRoomForm } from './new-room-schema'

// Campo `number` vazio vira NaN no react-hook-form, por isso o Number.isFinite antes de qualquer conta.
function formatMinutes(minutes: number) {
  if (!Number.isFinite(minutes) || minutes <= 0) return null

  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60

  if (hours === 0) return `${rest}min`
  if (rest === 0) return `${hours}h`

  return `${hours}h${String(rest).padStart(2, '0')}`
}

export function NewRoom() {
  const [open, setOpen] = useState(false)

  const queryClient = useQueryClient()

  const {
    register,
    reset,
    control,
    setFocus,
    handleSubmit,
    formState: { errors },
  } = useNewRoomForm()

  // useWatch assina o campo direto no control: a conversão acompanha cada tecla digitada.
  const name = useWatch({ control, name: 'name' })
  const standardTime = useWatch({ control, name: 'standardTime' })

  const standardTimeHint = formatMinutes(standardTime)

  // Só um espelho do que a api-fr vai gerar — o slug não viaja no corpo da requisição.
  const slugPreview = maskSlug(name)

  const { mutateAsync: createRoomMutation, isPending: isCreating } = useMutation({
    mutationFn: createRoom,
  })

  function closeSheet() {
    setOpen(false)
    reset()
  }

  /** Só o que o usuário dispara (ESC, clique fora, botão de fechar). O sucesso fecha por `closeSheet`. */
  function handleOpenChange(value: boolean) {
    if (value) {
      setOpen(true)
      return
    }

    // Fechar no meio da chamada limparia o formulário com a requisição ainda de pé: o toast de erro
    // chegaria depois, sem os dados na tela para corrigir e tentar de novo.
    if (isCreating) return

    closeSheet()
  }

  async function handleCreateRoom({ name, standardTime, description }: NewRoomFormType) {
    try {
      await createRoomMutation({
        name,
        standardTime,
        // Campo opcional na api-fr: string vazia gravaria `""` no banco, e o painel trata a ausência
        // de descrição como `null`.
        description: description || undefined,
      })

      // A sala nova precisa aparecer no seletor do painel sem exigir recarga da página.
      await queryClient.invalidateQueries({ queryKey: queryKeys.getRooms() })

      toast.success(`Sala ${name} cadastrada.`, {
        description: `${formatMinutes(standardTime)} de cota por advogado.`,
      })

      closeSheet()
    } catch (err) {
      // O nome é o campo que a api-fr recusa na prática (slug duplicado), então é nele que o foco volta.
      setFocus('name')

      const retryAfterInSeconds = getRetryAfterInSeconds(err)

      // A `message` da api-fr é o que explica a recusa ("Sala com esse nome já cadastrada."). O texto
      // genérico só entra quando não veio resposta nenhuma — queda de rede, 502 respondendo HTML.
      toast.error(
        retryAfterInSeconds
          ? `Muitas tentativas. Tente novamente em ${formatWaitTime(retryAfterInSeconds)}.`
          : getApiErrorMessage(err, 'Não foi possível cadastrar a sala. Verifique sua conexão e tente novamente.')
      )
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger render={<Button variant="default" />}>
        <PlusIcon data-icon="inline-start" /> Adicionar Sala
      </SheetTrigger>

      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Nova sala</SheetTitle>

          <SheetDescription>A sala agrupa os computadores e define o tempo padrão de cada liberação.</SheetDescription>
        </SheetHeader>

        <form noValidate id="new-room-form" onSubmit={handleSubmit(handleCreateRoom)} className="flex-1 overflow-y-auto px-4">
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">Nome da sala</FieldLabel>

              <Input
                id="name"
                placeholder="Sala de Liberação 1"
                autoComplete="off"
                aria-invalid={!!errors.name}
                className="h-10"
                {...register('name')}
              />

              {/* O identificador é o que garante sala única na api-fr: ver a prévia evita o usuário
                  descobrir a colisão só depois de tomar "Sala com esse nome já cadastrada.". */}
              {errors.name ? (
                <FieldError errors={[errors.name]} />
              ) : (
                slugPreview && <FieldDescription>Identificador: {slugPreview}</FieldDescription>
              )}
            </Field>

            <Field data-invalid={!!errors.standardTime}>
              <FieldLabel htmlFor="standardTime">Tempo padrão (minutos)</FieldLabel>

              <div className="flex items-center gap-2">
                <Input
                  id="standardTime"
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
              <FieldLabel htmlFor="description">Descrição</FieldLabel>

              <Textarea
                id="description"
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

        <SheetFooter className="flex w-full flex-row items-center justify-end border-t">
          {/* Sem `disabled`, o duplo clique dispara dois POST: o segundo volta como "sala já cadastrada"
              e o usuário vê um erro para uma sala que acabou de ser criada com sucesso. */}
          <Button type="submit" form="new-room-form" className="w-full" disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2Icon data-icon="inline-start" className="animate-spin" /> Criando sala
              </>
            ) : (
              <>
                <PlusIcon data-icon="inline-start" /> Criar sala
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
