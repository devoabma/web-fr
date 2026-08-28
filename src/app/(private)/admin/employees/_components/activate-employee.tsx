'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2Icon, ToggleLeftIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { queryKeys } from '@/constants/query-keys'
import { formatWaitTime, getApiErrorMessage, getRetryAfterInSeconds } from '@/lib/http/api-error'
import { activateEmployee } from '@/server/employees/activate'
import type { EmployeeProps } from '@/server/employees/get-all'

type ActivateEmployeeProps = {
  employee: EmployeeProps
}

export function ActivateEmployee({ employee }: ActivateEmployeeProps) {
  const queryClient = useQueryClient()

  const { mutateAsync: activateEmployeeMutation, isPending: isActivating } = useMutation({
    mutationFn: activateEmployee,
  })

  async function handleActivateEmployee() {
    try {
      await activateEmployeeMutation(employee.id)

      await queryClient.invalidateQueries({ queryKey: queryKeys.getEmployees() })

      toast.success(`${employee.name} reativado(a).`, {
        description: 'Já pode entrar no painel de novo com a mesma senha.',
      })
    } catch (err) {
      const retryAfterInSeconds = getRetryAfterInSeconds(err)

      toast.error(
        retryAfterInSeconds
          ? `Muitas tentativas. Tente novamente em ${formatWaitTime(retryAfterInSeconds)}.`
          : getApiErrorMessage(err, 'Não foi possível reativar o colaborador. Verifique sua conexão e tente novamente.')
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
            aria-label={`Reativar o colaborador ${employee.name}`}
            className="text-destructive"
            disabled={isActivating}
            onClick={handleActivateEmployee}
          />
        }
      >
        {isActivating ? <Loader2Icon className="animate-spin" /> : <ToggleLeftIcon />}
      </TooltipTrigger>

      <TooltipContent>Reativar colaborador</TooltipContent>
    </Tooltip>
  )
}
