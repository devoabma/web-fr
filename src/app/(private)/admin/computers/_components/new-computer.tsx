'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
import { queryKeys } from '@/constants/query-keys'
import { formatWaitTime, getApiErrorMessage, getRetryAfterInSeconds } from '@/lib/http/api-error'
import { createComputer } from '@/server/computers/create'
import { getAllRooms } from '@/server/rooms/get-all'
import { maskMacCode } from '@/utils/masks/mac-code'
import { type NewComputerFormType, useNewComputerForm } from './new-computer-schema'

export function NewComputer() {
  const [open, setOpen] = useState(false)

  const queryClient = useQueryClient()

  const {
    register,
    reset,
    control,
    setValue,
    setFocus,
    handleSubmit,
    formState: { errors },
  } = useNewComputerForm()

  const {
    data,
    isPending: isLoadingRooms,
    isError: hasRoomsError,
  } = useQuery({
    queryKey: queryKeys.getRooms(),
    queryFn: getAllRooms,
  })

  // Sala inativa não recebe liberação: cadastrar máquina nela é criar inventário morto.
  const activeRooms = data?.rooms.filter(room => room.inactive === null) ?? []

  const roomId = useWatch({ control, name: 'roomId' })

  const selectedRoom = activeRooms.find(room => room.id === roomId)
  const usedNumbers = selectedRoom?.computers.map(computer => computer.number).sort((a, b) => a - b) ?? []

  const hasNoActiveRooms = !isLoadingRooms && !hasRoomsError && activeRooms.length === 0

  const { mutateAsync: createComputerMutation, isPending: isCreating } = useMutation({
    mutationFn: createComputer,
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

  /**
   * O número é único por sala na api-fr. Sugerir o próximo livre ao trocar de sala evita o usuário
   * descobrir a colisão só depois de tomar "Já existe um computador com esse número nesta sala.".
   */
  function handleRoomChange(nextRoomId: string, onChange: (value: string) => void) {
    onChange(nextRoomId)

    const numbers = activeRooms.find(room => room.id === nextRoomId)?.computers.map(computer => computer.number) ?? []

    // `shouldValidate` porque o número pode estar com erro de um envio anterior: sem revalidar, a
    // mensagem antiga fica na tela embaixo do campo que acabamos de preencher com um valor válido.
    setValue('number', Math.max(0, ...numbers) + 1, { shouldValidate: true })
  }

  async function handleCreateComputer({ macCode, number, description, roomId }: NewComputerFormType) {
    try {
      await createComputerMutation({ macCode, number, description, roomId })

      // Duas listas dependem do cadastro: a tabela desta tela (`/computers/get-all`) e o inventário
      // embutido nas salas, que alimenta o painel e a sugestão de próximo número livre aqui mesmo.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.getComputers() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.getRooms() }),
      ])

      toast.success(`${description.toUpperCase()} cadastrado.`, {
        description: `MAC ${macCode} na sala ${selectedRoom?.name}.`,
      })

      closeDrawer()
    } catch (err) {
      setFocus('macCode')

      const retryAfterInSeconds = getRetryAfterInSeconds(err)

      toast.error(
        retryAfterInSeconds
          ? `Muitas tentativas. Tente novamente em ${formatWaitTime(retryAfterInSeconds)}.`
          : getApiErrorMessage(err, 'Não foi possível cadastrar o computador. Verifique sua conexão e tente novamente.')
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
          <DrawerTitle>Novo computador</DrawerTitle>

          <DrawerDescription>
            A máquina é identificada pelo código MAC — é por ele que o Desktop pede a liberação.
          </DrawerDescription>

          <DrawerClose render={<Button variant="ghost" size="icon-sm" className="absolute top-3 right-3" />}>
            <XIcon />
            <span className="sr-only">Fechar</span>
          </DrawerClose>
        </DrawerHeader>

        <form
          noValidate
          id="new-computer-form"
          onSubmit={handleSubmit(handleCreateComputer)}
          className="flex-1 overflow-y-auto px-4"
        >
          <FieldGroup>
            <Field data-invalid={!!errors.roomId}>
              <FieldLabel htmlFor="roomId">Sala</FieldLabel>

              <Controller
                control={control}
                name="roomId"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value: string | null) => value && handleRoomChange(value, field.onChange)}
                  >
                    <SelectTrigger
                      id="roomId"
                      ref={field.ref}
                      disabled={isLoadingRooms || hasRoomsError || hasNoActiveRooms}
                      aria-invalid={!!errors.roomId}
                      className="h-10 w-full"
                    >
                      <SelectValue>
                        {(value: string) =>
                          activeRooms.find(room => room.id === value)?.name ?? (
                            <span className="text-muted-foreground text-sm">
                              {isLoadingRooms ? 'Carregando salas...' : 'Selecione a sala'}
                            </span>
                          )
                        }
                      </SelectValue>
                    </SelectTrigger>

                    <SelectContent>
                      {activeRooms.map(room => (
                        <SelectItem key={room.id} value={room.id} className="py-2">
                          <div className="flex min-w-0 flex-col gap-0.5">
                            <span className="truncate font-medium">{room.name}</span>

                            <span className="text-muted-foreground text-xs">
                              {room.computers.length === 1 ? '1 computador' : `${room.computers.length} computadores`}
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
              ) : (
                (hasRoomsError || hasNoActiveRooms) && (
                  <FieldDescription>
                    {hasRoomsError
                      ? 'Não foi possível carregar as salas. Recarregue a página e tente de novo.'
                      : 'Nenhuma sala ativa. Cadastre uma sala antes de adicionar computadores.'}
                  </FieldDescription>
                )
              )}
            </Field>

            <Field data-invalid={!!errors.number}>
              <FieldLabel htmlFor="number">Número</FieldLabel>

              <Input
                id="number"
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
              <FieldLabel htmlFor="description">Descrição</FieldLabel>

              {/* A api-fr grava a descrição em maiúsculas — o `uppercase` mostra desde já o que vai para o banco. */}
              <Input
                id="description"
                placeholder="COMPUTADOR 01"
                autoComplete="off"
                aria-invalid={!!errors.description}
                className="h-10 text-sm uppercase placeholder:normal-case"
                {...register('description')}
              />

              {errors.description ? (
                <FieldError errors={[errors.description]} />
              ) : (
                <FieldDescription>Como a máquina é chamada na sala. Não pode repetir dentro da mesma sala.</FieldDescription>
              )}
            </Field>

            <Field data-invalid={!!errors.macCode}>
              <FieldLabel htmlFor="macCode">Código MAC</FieldLabel>

              <Controller
                control={control}
                name="macCode"
                render={({ field }) => (
                  <Input
                    id="macCode"
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
                <FieldDescription>12 dígitos hexadecimais. É o endereço físico da placa de rede da máquina.</FieldDescription>
              )}
            </Field>
          </FieldGroup>
        </form>

        <DrawerFooter className="flex w-full flex-row items-center justify-end border-t pt-4">
          {/* Sem `disabled`, o duplo clique dispara dois POST: o segundo volta como "MAC já cadastrado"
              e o usuário vê um erro para um computador que acabou de ser criado com sucesso. */}
          <Button type="submit" form="new-computer-form" className="w-full" disabled={isCreating || hasNoActiveRooms}>
            {isCreating ? (
              <>
                <Loader2Icon data-icon="inline-start" className="animate-spin" /> Cadastrando computador
              </>
            ) : (
              <>
                <PlusIcon data-icon="inline-start" /> Cadastrar computador
              </>
            )}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
