'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DoorOpenIcon, Loader2Icon, SaveIcon, XIcon } from 'lucide-react'
import { useState } from 'react'
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
} from '@/components/ui/drawer'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { queryKeys } from '@/constants/query-keys'
import { formatWaitTime, getApiErrorMessage, getRetryAfterInSeconds } from '@/lib/http/api-error'
import type { EmployeeProps } from '@/server/employees/get-all'
import { linkEmployeeWithRooms } from '@/server/employees/link-with-rooms'
import { unlinkEmployeeWithRooms } from '@/server/employees/unlink-with-rooms'
import { getAllRooms } from '@/server/rooms/get-all'

/** Mesmo corte do cadastro: acima disso o campo vira um muro de chips e empurra o resto para fora da vista. */
const MAX_VISIBLE_ROOM_CHIPS = 7

function pluralizeRooms(total: number) {
  return total === 1 ? '1 sala' : `${total} salas`
}

type ManageEmployeeRoomsProps = {
  employee: EmployeeProps
}

export function ManageEmployeeRooms({ employee }: ManageEmployeeRoomsProps) {
  const [open, setOpen] = useState(false)

  const linkedRoomIds = employee.employeesRooms.map(({ rooms }) => rooms.id)

  const [selectedRoomIds, setSelectedRoomIds] = useState(linkedRoomIds)

  const queryClient = useQueryClient()
  const roomsAnchorRef = useComboboxAnchor()

  // `enabled: open` porque a listagem já traz as salas *vinculadas* de cada colaborador; o catálogo
  // inteiro só interessa a quem abriu o painel para mexer nos vínculos.
  const {
    data: roomsData,
    isPending: isLoadingRooms,
    isError: hasRoomsError,
  } = useQuery({
    queryKey: queryKeys.getRooms(),
    queryFn: getAllRooms,
    enabled: open,
  })

  const rooms = roomsData?.rooms ?? []
  const activeRooms = rooms.filter(room => !room.inactive)

  /**
   * As salas inativas **já vinculadas** continuam na lista, mesmo que a api-fr recuse vincular a elas.
   * Escondê-las faria o campo abrir sem os vínculos que o colaborador tem hoje — e salvar qualquer
   * mudança desvincularia essas salas sem ninguém ter pedido. Aparecendo, elas ficam desmarcáveis (o
   * `unlink` não valida estado) e é assim que se desfaz o vínculo de uma sala que foi desativada.
   */
  const inactiveLinkedRooms = rooms.filter(room => !!room.inactive && linkedRoomIds.includes(room.id))
  const selectableRooms = [...activeRooms, ...inactiveLinkedRooms]

  const selectableRoomIds = selectableRooms.map(room => room.id)

  // O nome dos vínculos atuais vem da própria listagem, e é o que segura o primeiro frame: o painel abre
  // com os chips já preenchidos enquanto o catálogo de salas ainda está na rede. Sem esse fallback, quem
  // abre vê chips em branco por um instante — e chip vazio parece vínculo corrompido.
  const roomNameById = new Map<string, string>([
    ...employee.employeesRooms.map(({ rooms }) => [rooms.id, rooms.name] as const),
    ...selectableRooms.map(room => [room.id, room.name] as const),
  ])

  const inactiveRoomIds = new Set([
    ...employee.employeesRooms.filter(({ rooms }) => !!rooms.inactive).map(({ rooms }) => rooms.id),
    ...inactiveLinkedRooms.map(room => room.id),
  ])

  const { mutateAsync: linkRoomsMutation, isPending: isLinking } = useMutation({
    mutationFn: linkEmployeeWithRooms,
  })

  const { mutateAsync: unlinkRoomsMutation, isPending: isUnlinking } = useMutation({
    mutationFn: unlinkEmployeeWithRooms,
  })

  const isSubmitting = isLinking || isUnlinking

  // O painel manda o *delta*, não a seleção inteira: a api-fr responde 400 quando o payload traz uma sala
  // que já está vinculada, então reenviar tudo derrubaria o salvamento sempre que o admin mexesse numa só.
  const roomIdsToLink = selectedRoomIds.filter(roomId => !linkedRoomIds.includes(roomId))
  const roomIdsToUnlink = linkedRoomIds.filter(roomId => !selectedRoomIds.includes(roomId))
  const hasChanges = !!roomIdsToLink.length || !!roomIdsToUnlink.length

  const roomsPlaceholder = isLoadingRooms
    ? 'Carregando salas…'
    : hasRoomsError
      ? 'Salas indisponíveis'
      : selectableRoomIds.length
        ? 'Buscar sala…'
        : 'Nenhuma sala ativa'

  function handleOpenChange(value: boolean) {
    if (value) {
      // Recomeça da verdade que veio da listagem: reabrir depois de fechar no meio não pode herdar a
      // seleção abandonada de antes.
      setSelectedRoomIds(linkedRoomIds)
      setOpen(true)
      return
    }

    if (isSubmitting) return

    setOpen(false)
  }

  async function invalidateAfterChange() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.getEmployees() }),
      // O mesmo vínculo aparece em `employeesRooms` do lado das salas — a outra tela envelhece junto.
      queryClient.invalidateQueries({ queryKey: queryKeys.getRooms() }),
    ])
  }

  function reportError(err: unknown, fallback: string) {
    const retryAfterInSeconds = getRetryAfterInSeconds(err)

    if (retryAfterInSeconds) {
      toast.error(`Muitas tentativas. Tente novamente em ${formatWaitTime(retryAfterInSeconds)}.`)
      return
    }

    toast.error(getApiErrorMessage(err, fallback))
  }

  async function handleSaveRooms() {
    if (!hasChanges) return

    // Vincular primeiro é o que protege o estado: é a chamada que valida (sala inativa, sala sumida,
    // vínculo repetido) e a que costuma falhar. Se ela cair antes do `unlink`, nada foi removido e o
    // colaborador continua exatamente como estava.
    if (roomIdsToLink.length) {
      try {
        await linkRoomsMutation({ employeeId: employee.id, roomIds: roomIdsToLink })
      } catch (err) {
        reportError(err, 'Não foi possível vincular as salas. Tente novamente.')
        return
      }
    }

    if (roomIdsToUnlink.length) {
      try {
        await unlinkRoomsMutation({ employeeId: employee.id, roomIds: roomIdsToUnlink })
      } catch (err) {
        // As duas chamadas não são uma transação. Se o vínculo entrou e a remoção falhou, o estado no
        // servidor é real e parcial — some com o painel e o admin acharia que nada foi salvo.
        await invalidateAfterChange()

        toast.warning(`${pluralizeRooms(roomIdsToLink.length)} vinculada${roomIdsToLink.length === 1 ? '' : 's'}.`, {
          description: getApiErrorMessage(err, 'Mas não foi possível remover os vínculos desmarcados. Tente de novo.'),
        })

        return
      }
    }

    await invalidateAfterChange()

    const changeSummary = [
      roomIdsToLink.length ? `${pluralizeRooms(roomIdsToLink.length)} vinculada${roomIdsToLink.length === 1 ? '' : 's'}` : null,
      roomIdsToUnlink.length
        ? `${pluralizeRooms(roomIdsToUnlink.length)} desvinculada${roomIdsToUnlink.length === 1 ? '' : 's'}`
        : null,
    ]
      .filter(Boolean)
      .join(' · ')

    toast.success(`Salas de ${employee.name} atualizadas.`, { description: changeSummary })

    setOpen(false)
  }

  const hasEveryRoomSelected = !!selectableRoomIds.length && selectedRoomIds.length === selectableRoomIds.length

  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="outline"
              size="icon-sm"
              aria-label={`Gerenciar as salas de ${employee.name}`}
              onClick={() => handleOpenChange(true)}
            />
          }
        >
          <DoorOpenIcon />
        </TooltipTrigger>

        <TooltipContent>Salas vinculadas</TooltipContent>
      </Tooltip>

      {/* Mesma anatomia do cadastro de colaborador: painel flutuante à direita, com o respiro do
          `--drawer-inset` e a faixa do `::after` apagada para não riscar a borda arredondada. */}
      <Drawer open={open} onOpenChange={handleOpenChange} swipeDirection="right">
        <DrawerContent className="rounded-xl border shadow-lg [--drawer-bleed-background:transparent] [--drawer-inset:0.75rem] sm:[--drawer-content-width:28rem]!">
          <DrawerHeader className="relative pb-4">
            <DrawerTitle>Salas de {employee.name}</DrawerTitle>

            <DrawerDescription>
              O colaborador só libera estações das salas vinculadas a ele. Marque para vincular, desmarque para remover.
            </DrawerDescription>

            <DrawerClose render={<Button variant="ghost" size="icon-sm" className="absolute top-3 right-3" />}>
              <XIcon />
              <span className="sr-only">Fechar</span>
            </DrawerClose>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-4">
            <Field>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FieldLabel htmlFor="employee-rooms">Salas vinculadas</FieldLabel>

                  {!!selectedRoomIds.length && (
                    <span className="text-muted-foreground text-xs tabular-nums">
                      {selectedRoomIds.length} de {selectableRoomIds.length}
                    </span>
                  )}
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  disabled={isSubmitting || !selectableRoomIds.length}
                  onClick={() => setSelectedRoomIds(hasEveryRoomSelected ? [] : selectableRoomIds)}
                  className="font-semibold text-muted-foreground text-xs hover:text-foreground"
                >
                  {hasEveryRoomSelected ? 'Limpar seleção' : 'Selecionar todas'}
                </Button>
              </div>

              <Combobox
                multiple
                items={selectableRoomIds}
                value={selectedRoomIds}
                onValueChange={setSelectedRoomIds}
                // Os itens são ids; sem isso o admin veria (e buscaria por) cuids na lista.
                itemToStringLabel={roomId => roomNameById.get(roomId) ?? ''}
                disabled={isSubmitting || isLoadingRooms || hasRoomsError || !selectableRoomIds.length}
              >
                <ComboboxChips ref={roomsAnchorRef}>
                  <ComboboxValue>
                    {(currentRoomIds: string[]) => {
                      const hiddenRoomsCount = currentRoomIds.length - MAX_VISIBLE_ROOM_CHIPS

                      return (
                        <>
                          {/* Fatia a partir do início, e não do fim: os chips se localizam pelo índice do
                              valor selecionado, então cortar o começo faria o "x" de um chip remover a
                              sala errada. */}
                          {currentRoomIds.slice(0, MAX_VISIBLE_ROOM_CHIPS).map(roomId => (
                            <ComboboxChip key={roomId} aria-label={roomNameById.get(roomId)}>
                              {roomNameById.get(roomId)}
                            </ComboboxChip>
                          ))}

                          {hiddenRoomsCount > 0 && (
                            <span className="px-1 text-muted-foreground text-xs tabular-nums">+{hiddenRoomsCount}</span>
                          )}

                          <ComboboxChipsInput
                            id="employee-rooms"
                            placeholder={currentRoomIds.length ? '' : roomsPlaceholder}
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

                        {/* A sala desativada depois do vínculo continua listada — e precisa dizer por que
                            está ali, ou pareceria uma sala normal que sumiu do cadastro de outra pessoa. */}
                        {inactiveRoomIds.has(roomId) && <span className="ml-auto text-muted-foreground text-xs">Inativa</span>}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>

              <FieldDescription>
                {hasRoomsError
                  ? 'Não foi possível carregar as salas. Feche e abra o painel para tentar de novo.'
                  : hasChanges
                    ? [
                        roomIdsToLink.length ? `${pluralizeRooms(roomIdsToLink.length)} a vincular` : null,
                        roomIdsToUnlink.length ? `${pluralizeRooms(roomIdsToUnlink.length)} a desvincular` : null,
                      ]
                        .filter(Boolean)
                        .join(' · ')
                    : 'Apenas salas ativas podem ser vinculadas.'}
              </FieldDescription>
            </Field>
          </div>

          <DrawerFooter className="flex w-full flex-row items-center justify-end border-t pt-4">
            {/* Sem mudança não há o que salvar: as duas rotas exigem ao menos um id, e um clique vazio só
                gastaria request para receber erro de validação. */}
            <Button type="button" className="w-full" disabled={!hasChanges || isSubmitting} onClick={handleSaveRooms}>
              {isSubmitting ? (
                <>
                  <Loader2Icon data-icon="inline-start" className="animate-spin" />{' '}
                  {isLinking ? 'Vinculando salas' : 'Removendo vínculos'}
                </>
              ) : (
                <>
                  <SaveIcon data-icon="inline-start" /> Salvar vínculos
                </>
              )}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}
