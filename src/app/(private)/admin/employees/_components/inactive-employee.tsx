'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
import type { EmployeeProps } from '@/server/employees/get-all'
import { getProfile } from '@/server/employees/get-profile'
import { deactivateEmployee } from '@/server/employees/inactive'

type InactiveEmployeeProps = {
  employee: EmployeeProps
}

export function InactiveEmployee({ employee }: InactiveEmployeeProps) {
  const [open, setOpen] = useState(false)

  const queryClient = useQueryClient()

  // O perfil já é carregado pelo cabeçalho do painel, então aqui isso costuma ser leitura de cache.
  const { data: profileData } = useQuery({
    queryKey: queryKeys.getProfile(),
    queryFn: getProfile,
  })

  const { mutateAsync: deactivateEmployeeMutation, isPending: isDeactivating } = useMutation({
    mutationFn: deactivateEmployee,
  })

  // A api-fr recusa com 400 quem tenta inativar o próprio cadastro — senão o admin se trancaria para
  // fora do painel. `aria-disabled` em vez de `disabled` porque botão desabilitado não dispara hover:
  // o tooltip é justamente o que explica por que a ação está fora do ar.
  const isHimself = profileData?.employee.id === employee.id

  const roomsCount = employee.employeesRooms.length

  /** Fechar no meio da chamada esconderia o contexto da ação: o toast de erro chegaria sem o nome na tela. */
  function handleOpenChange(value: boolean) {
    if (!value && isDeactivating) return

    setOpen(value)
  }

  async function handleDeactivateEmployee() {
    try {
      await deactivateEmployeeMutation(employee.id)

      await queryClient.invalidateQueries({ queryKey: queryKeys.getEmployees() })

      toast.success(`${employee.name} inativado(a).`, {
        description: 'Continua na lista, marcado como inativo, e pode ser reativado a qualquer momento.',
      })

      setOpen(false)
    } catch (err) {
      const retryAfterInSeconds = getRetryAfterInSeconds(err)

      toast.error(
        retryAfterInSeconds
          ? `Muitas tentativas. Tente novamente em ${formatWaitTime(retryAfterInSeconds)}.`
          : getApiErrorMessage(err, 'Não foi possível inativar o colaborador. Verifique sua conexão e tente novamente.')
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
              aria-disabled={isHimself}
              aria-label={`Inativar o colaborador ${employee.name}`}
              className="text-emerald-600 aria-disabled:opacity-50"
              onClick={() => !isHimself && setOpen(true)}
            />
          }
        >
          <ToggleRightIcon />
        </TooltipTrigger>

        <TooltipContent>{isHimself ? 'Você não pode inativar o seu próprio cadastro' : 'Inativar colaborador'}</TooltipContent>
      </Tooltip>

      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <TriangleAlertIcon />
            </AlertDialogMedia>

            <AlertDialogTitle>Inativar {employee.name}?</AlertDialogTitle>

            <AlertDialogDescription>
              Ele deixa de conseguir entrar no painel — se estiver com a sessão aberta, o bloqueio vale a partir do próximo
              acesso.{' '}
              {roomsCount === 0
                ? 'Nada é apagado'
                : `Os vínculos com ${roomsCount} sala${roomsCount === 1 ? '' : 's'} e o histórico continuam salvos`}
              : você pode reativar depois.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeactivating}>Cancelar</AlertDialogCancel>

            {/* Sem `disabled`, o duplo clique dispara dois PATCH: o segundo volta como "Funcionário já está
                inativo." e o usuário vê um erro para um cadastro que acabou de ser inativado com sucesso. */}
            <AlertDialogAction variant="destructive" disabled={isDeactivating} onClick={handleDeactivateEmployee}>
              {isDeactivating ? (
                <>
                  <Loader2Icon data-icon="inline-start" className="animate-spin" /> Inativando
                </>
              ) : (
                'Inativar colaborador'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
