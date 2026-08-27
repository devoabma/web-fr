'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2Icon, PlusIcon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { Controller, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { queryKeys } from '@/constants/query-keys'
import { UF_NAMES, UFS, type Uf } from '@/constants/ufs'
import { formatWaitTime, getApiErrorMessage, getRetryAfterInSeconds } from '@/lib/http/api-error'
import { createRoom } from '@/server/rooms/create'
import { formatDuration } from '@/utils'
import { maskSlug } from '@/utils/masks/slug'
import { type NewRoomFormType, useNewRoomForm } from './new-room-schema'

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

  const standardTimeHint = formatDuration(standardTime)

  // Só um espelho do que a api-fr vai gerar — o slug não viaja no corpo da requisição.
  const slugPreview = maskSlug(name)

  const { mutateAsync: createRoomMutation, isPending: isCreating } = useMutation({
    mutationFn: createRoom,
  })

  function closeDrawer() {
    setOpen(false)
    reset()
  }

  /** Só o que o usuário dispara (ESC, clique fora, arrasto, botão de fechar). O sucesso fecha por `closeDrawer`. */
  function handleOpenChange(value: boolean) {
    if (value) {
      setOpen(true)
      return
    }

    // Fechar no meio da chamada limparia o formulário com a requisição ainda de pé: o toast de erro
    // chegaria depois, sem os dados na tela para corrigir e tentar de novo.
    if (isCreating) return

    closeDrawer()
  }

  async function handleCreateRoom({ name, uf, standardTime, description }: NewRoomFormType) {
    try {
      await createRoomMutation({
        name,
        uf,
        standardTime,
        description: description || undefined,
      })

      await queryClient.invalidateQueries({ queryKey: queryKeys.getRooms() })

      toast.success(`Sala ${name} cadastrada.`, {
        description: `${uf} · ${formatDuration(standardTime)} de cota por advogado.`,
      })

      closeDrawer()
    } catch (err) {
      setFocus('name')

      const retryAfterInSeconds = getRetryAfterInSeconds(err)

      toast.error(
        retryAfterInSeconds
          ? `Muitas tentativas. Tente novamente em ${formatWaitTime(retryAfterInSeconds)}.`
          : getApiErrorMessage(err, 'Não foi possível cadastrar a sala. Verifique sua conexão e tente novamente.')
      )
    }
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange} swipeDirection="right">
      <DrawerTrigger render={<Button variant="default" className="w-full sm:w-auto" />}>
        <PlusIcon data-icon="inline-start" /> Adicionar
      </DrawerTrigger>

      {/*
        `--drawer-inset` é a margem que descola o popup das bordas da tela — o `--closed-transform` do
        componente já soma essa variável, então a animação de saída continua limpa. Com o painel flutuando,
        `rounded-xl border` arredonda e contorna os quatro lados (o componente só faz o lado do arrasto) e
        `--drawer-bleed-background` apaga a faixa que o `::after` pinta pra fora da borda: sem isso ela
        aparece como um risco da cor do popup dentro do respiro à direita.
        O `!` na largura é porque o componente define `--drawer-content-width` num seletor mais
        específico (`data-[swipe-axis=x]:sm:`).
      */}
      <DrawerContent className="rounded-xl border shadow-lg [--drawer-bleed-background:transparent] [--drawer-inset:0.75rem] sm:[--drawer-content-width:28rem]!">
        <DrawerHeader className="relative pb-4">
          <DrawerTitle>Nova sala</DrawerTitle>

          <DrawerDescription>A sala agrupa os computadores e define o tempo padrão de cada liberação.</DrawerDescription>

          <DrawerClose render={<Button variant="ghost" size="icon-sm" className="absolute top-3 right-3" />}>
            <XIcon />
            <span className="sr-only">Fechar</span>
          </DrawerClose>
        </DrawerHeader>

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

            <Field data-invalid={!!errors.uf}>
              <FieldLabel htmlFor="uf">Estado</FieldLabel>

              {/* Lista fechada de propósito. Antes disso a sigla era digitada à mão no instalador do
                  Desktop, e um "MT" no lugar de "MA" nunca dava erro — a máquina só sumia das
                  publicações de versão do estado dela. */}
              <Controller
                control={control}
                name="uf"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={(value: Uf | null) => value && field.onChange(value)}>
                    <SelectTrigger id="uf" ref={field.ref} aria-invalid={!!errors.uf} className="h-10 w-full">
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

              {errors.uf ? (
                <FieldError errors={[errors.uf]} />
              ) : (
                <FieldDescription>
                  Define de qual estado as estações desta sala recebem as atualizações do Desktop.
                </FieldDescription>
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

        <DrawerFooter className="flex w-full flex-row items-center justify-end border-t pt-4">
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
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
