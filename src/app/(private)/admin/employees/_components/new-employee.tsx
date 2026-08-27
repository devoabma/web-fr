'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2Icon, PlusIcon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { Controller } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/combobox'
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
import { queryKeys } from '@/constants/query-keys'
import { formatWaitTime, getApiErrorMessage, getApiErrorStatus, getRetryAfterInSeconds } from '@/lib/http/api-error'
import { createEmployee } from '@/server/employees/create'
import { linkEmployeeWithRooms } from '@/server/employees/link-with-rooms'
import { getAllRooms } from '@/server/rooms/get-all'
import { maskCpf } from '@/utils/masks/cpf'
import { type NewEmployeeFormType, useNewEmployeeForm } from './new-employee-schema'

/**
 * Quantos chips o campo mostra antes de resumir o resto num "+N".
 *
 * Sem esse corte, "Selecionar todas" num parque de dezenas de salas encheria o campo de chips e
 * empurraria o formulário inteiro para fora da vista. Quem precisa conferir a seleção item a item
 * abre a lista — lá cada sala vinculada aparece com o check.
 */
const MAX_VISIBLE_ROOM_CHIPS = 7

/**
 * CPF e e-mail são `@unique` na api-fr e voltam como 400 com a mensagem pronta. Jogar isso só no toast
 * deixaria o usuário sem saber qual dos dois campos corrigir, então descobrimos o campo pela mensagem.
 */
function resolveDuplicatedField(message: string) {
  const normalized = message.toLowerCase()

  if (normalized.includes('cpf')) return 'cpf' as const
  if (normalized.includes('mail')) return 'email' as const

  return null
}

export function NewEmployee() {
  const [open, setOpen] = useState(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const queryClient = useQueryClient()
  const roomsAnchorRef = useComboboxAnchor()

  const {
    register,
    reset,
    control,
    setError,
    setFocus,
    handleSubmit,
    formState: { errors },
  } = useNewEmployeeForm()

  // `enabled: open` porque a listagem de colaboradores não precisa das salas para nada: só o
  // formulário precisa, e ele só existe depois que o admin abre o painel lateral.
  const {
    data: roomsData,
    isPending: isLoadingRooms,
    isError: hasRoomsError,
  } = useQuery({
    queryKey: queryKeys.getRooms(),
    queryFn: getAllRooms,
    enabled: open,
  })

  /**
   * Sala inativa é recusada pela api-fr com 400 — e como o vínculo é tudo ou nada, uma única sala
   * inativa na seleção derrubaria as outras junto. Some da lista antes de o admin conseguir escolher.
   */
  const activeRooms = roomsData?.rooms.filter(room => !room.inactive) ?? []
  const activeRoomIds = activeRooms.map(room => room.id)
  const roomNameById = new Map(activeRooms.map(room => [room.id, room.name]))

  const { mutateAsync: createEmployeeMutation, isPending: isCreating } = useMutation({
    mutationFn: createEmployee,
  })

  const { mutateAsync: linkEmployeeWithRoomsMutation, isPending: isLinking } = useMutation({
    mutationFn: linkEmployeeWithRooms,
  })

  const isSubmitting = isCreating || isLinking

  const roomsPlaceholder = isLoadingRooms
    ? 'Carregando salas…'
    : hasRoomsError
      ? 'Salas indisponíveis'
      : activeRoomIds.length
        ? 'Buscar sala…'
        : 'Nenhuma sala ativa'

  function closeDrawer() {
    setOpen(false)
    setIsPasswordVisible(false)
    reset()
  }

  function handleOpenChange(value: boolean) {
    if (value) {
      setOpen(true)
      return
    }

    if (isSubmitting) return

    closeDrawer()
  }

  async function handleCreateEmployee({ name, cpf, email, password, roomIds }: NewEmployeeFormType) {
    try {
      const { employeeId } = await createEmployeeMutation({ name, cpf, email, password })

      // Daqui para baixo o colaborador **já existe**. Nada pode voltar a tratar este fluxo como
      // "falha no cadastro", ou o admin tentaria de novo e tomaria "CPF já cadastrado".
      if (roomIds.length) {
        try {
          await linkEmployeeWithRoomsMutation({ employeeId, roomIds })
        } catch (linkErr) {
          await queryClient.invalidateQueries({ queryKey: queryKeys.getEmployees() })

          toast.warning(`${name} cadastrado(a), mas sem as salas.`, {
            description: getApiErrorMessage(linkErr, 'Não foi possível vincular as salas. Faça isso pela listagem.'),
          })

          closeDrawer()
          return
        }
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.getEmployees() }),
        // O vínculo entra em `employeesRooms` de cada sala, então a tela de salas também fica velha.
        roomIds.length ? queryClient.invalidateQueries({ queryKey: queryKeys.getRooms() }) : null,
      ])

      toast.success(`${name} cadastrado(a).`, {
        description: roomIds.length
          ? `${roomIds.length === 1 ? '1 sala vinculada' : `${roomIds.length} salas vinculadas`} · dados de acesso enviados para ${email}.`
          : `Os dados de acesso foram enviados para ${email}.`,
      })

      closeDrawer()
    } catch (err) {
      const retryAfterInSeconds = getRetryAfterInSeconds(err)

      if (retryAfterInSeconds) {
        toast.error(`Muitas tentativas. Tente novamente em ${formatWaitTime(retryAfterInSeconds)}.`)
        return
      }

      const message = getApiErrorMessage(
        err,
        'Não foi possível cadastrar o colaborador. Verifique sua conexão e tente novamente.'
      )
      const duplicatedField = getApiErrorStatus(err) === 400 ? resolveDuplicatedField(message) : null

      // Erro de campo fica no campo: repetir no toast só empilharia a mesma frase em dois lugares.
      if (duplicatedField) {
        setError(duplicatedField, { message })
        setFocus(duplicatedField)
        return
      }

      setFocus('name')
      toast.error(message)
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
          <DrawerTitle>Novo colaborador</DrawerTitle>

          <DrawerDescription>
            O colaborador acessa o painel com o CPF e recebe os dados de acesso por e-mail após o cadastro.
          </DrawerDescription>

          <DrawerClose render={<Button variant="ghost" size="icon-sm" className="absolute top-3 right-3" />}>
            <XIcon />
            <span className="sr-only">Fechar</span>
          </DrawerClose>
        </DrawerHeader>

        <form
          noValidate
          id="new-employee-form"
          onSubmit={handleSubmit(handleCreateEmployee)}
          className="flex-1 overflow-y-auto px-4"
        >
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">Nome completo</FieldLabel>

              <Input
                id="name"
                placeholder="John Doe da Silva"
                autoComplete="off"
                aria-invalid={!!errors.name}
                className="h-10 text-sm"
                {...register('name')}
              />

              <FieldError errors={[errors.name]} />
            </Field>

            <Field data-invalid={!!errors.cpf}>
              <FieldLabel htmlFor="cpf">CPF</FieldLabel>

              <Controller
                control={control}
                name="cpf"
                render={({ field }) => (
                  <Input
                    id="cpf"
                    inputMode="numeric"
                    placeholder="000.000.000-00"
                    autoComplete="off"
                    aria-invalid={!!errors.cpf}
                    className="h-10 text-sm tabular-nums"
                    name={field.name}
                    ref={field.ref}
                    value={field.value}
                    onBlur={field.onBlur}
                    onChange={event => field.onChange(maskCpf(event.target.value))}
                  />
                )}
              />

              {errors.cpf && <FieldError errors={[errors.cpf]} />}
            </Field>

            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">E-mail</FieldLabel>

              <Input
                id="email"
                type="email"
                placeholder="john.doe@salalivre.app"
                autoComplete="off"
                aria-invalid={!!errors.email}
                className="h-10 text-sm lowercase placeholder:normal-case"
                {...register('email')}
              />

              {errors.email && <FieldError errors={[errors.email]} />}
            </Field>

            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password">Senha temporária</FieldLabel>

              <div className="relative flex items-center">
                {/* `new-password` evita o navegador oferecer a senha do admin logado neste campo. */}
                <Input
                  id="password"
                  type={isPasswordVisible ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  aria-invalid={!!errors.password}
                  className="h-10 pr-20 text-sm"
                  {...register('password')}
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  aria-pressed={isPasswordVisible}
                  onClick={() => setIsPasswordVisible(visible => !visible)}
                  className="absolute right-1.5 font-semibold text-muted-foreground text-xs hover:text-foreground"
                >
                  {isPasswordVisible ? 'Ocultar' : 'Mostrar'}
                </Button>
              </div>

              {errors.password && <FieldError errors={[errors.password]} />}
            </Field>

            <Controller
              control={control}
              name="roomIds"
              render={({ field }) => {
                const hasEveryRoomSelected = !!activeRoomIds.length && field.value.length === activeRoomIds.length

                return (
                  <Field>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <FieldLabel htmlFor="rooms">Salas (Opcional)</FieldLabel>

                        {/* Enquanto o campo resume a seleção em "+N", o total só existe aqui. */}
                        {!!field.value.length && (
                          <span className="text-muted-foreground text-xs tabular-nums">
                            {field.value.length} de {activeRoomIds.length}
                          </span>
                        )}
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        disabled={isSubmitting || !activeRoomIds.length}
                        onClick={() => field.onChange(hasEveryRoomSelected ? [] : activeRoomIds)}
                        className="font-semibold text-muted-foreground text-xs hover:text-foreground"
                      >
                        {hasEveryRoomSelected ? 'Limpar seleção' : 'Selecionar todas'}
                      </Button>
                    </div>

                    <Combobox
                      multiple
                      items={activeRoomIds}
                      value={field.value}
                      onValueChange={field.onChange}
                      // Os itens são ids; sem isso o admin veria (e buscaria por) cuids na lista.
                      itemToStringLabel={roomId => roomNameById.get(roomId) ?? ''}
                      disabled={isSubmitting || isLoadingRooms || hasRoomsError || !activeRoomIds.length}
                    >
                      <ComboboxChips ref={roomsAnchorRef}>
                        <ComboboxValue>
                          {(selectedRoomIds: string[]) => {
                            const hiddenRoomsCount = selectedRoomIds.length - MAX_VISIBLE_ROOM_CHIPS

                            return (
                              <>
                                {/* Fatia a partir do início, e não do fim: os chips se localizam pelo
                                    índice do valor selecionado, então cortar o começo faria o "x" de um
                                    chip remover a sala errada. */}
                                {selectedRoomIds.slice(0, MAX_VISIBLE_ROOM_CHIPS).map(roomId => (
                                  <ComboboxChip key={roomId} aria-label={roomNameById.get(roomId)}>
                                    {roomNameById.get(roomId)}
                                  </ComboboxChip>
                                ))}

                                {hiddenRoomsCount > 0 && (
                                  <span className="px-1 text-muted-foreground text-xs tabular-nums">+{hiddenRoomsCount}</span>
                                )}

                                <ComboboxChipsInput
                                  id="rooms"
                                  onBlur={field.onBlur}
                                  placeholder={selectedRoomIds.length ? '' : roomsPlaceholder}
                                />
                              </>
                            )
                          }}
                        </ComboboxValue>
                      </ComboboxChips>

                      <ComboboxContent anchor={roomsAnchorRef}>
                        <ComboboxEmpty>Nenhuma sala encontrada.</ComboboxEmpty>

                        <ComboboxList>
                          {(roomId: string) => (
                            <ComboboxItem key={roomId} value={roomId}>
                              {roomNameById.get(roomId)}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>

                    <FieldDescription>
                      {hasRoomsError
                        ? 'Não foi possível carregar as salas. Você ainda pode cadastrar o colaborador e vincular depois.'
                        : 'Apenas salas ativas podem ser vinculadas. O vínculo também pode ser realizado pela listagem.'}
                    </FieldDescription>
                  </Field>
                )
              }}
            />
          </FieldGroup>
        </form>

        <DrawerFooter className="flex w-full flex-row items-center justify-end border-t pt-4">
          <Button type="submit" form="new-employee-form" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2Icon data-icon="inline-start" className="animate-spin" />{' '}
                {isLinking ? 'Vinculando salas' : 'Cadastrando colaborador'}
              </>
            ) : (
              <>
                <PlusIcon data-icon="inline-start" /> Cadastrar colaborador
              </>
            )}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
