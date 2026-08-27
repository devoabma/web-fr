'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2Icon, SaveIcon, ShieldCheckIcon, SquarePen, UserRoundIcon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { Controller } from 'react-hook-form'
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
} from '@/components/ui/drawer'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { queryKeys } from '@/constants/query-keys'
import { formatWaitTime, getApiErrorMessage, getApiErrorStatus, getRetryAfterInSeconds } from '@/lib/http/api-error'
import type { EmployeeProps, EmployeeRole } from '@/server/employees/get-all'
import { getProfile } from '@/server/employees/get-profile'
import { updateEmployee } from '@/server/employees/update'
import { maskCpf } from '@/utils/masks/cpf'
import { type UpdateEmployeeFormType, useUpdateEmployeeForm } from './update-employee-schema'

const ROLE_LABELS: Record<EmployeeRole, string> = {
  ADMIN: 'Administrador',
  MEMBER: 'Colaborador',
}

type UpdateEmployeeProps = {
  employee: EmployeeProps
}

export function UpdateEmployee({ employee }: UpdateEmployeeProps) {
  const [open, setOpen] = useState(false)

  const queryClient = useQueryClient()

  const employeeFormValues: UpdateEmployeeFormType = {
    name: employee.name,
    email: employee.email,
    role: employee.role,
  }

  const {
    register,
    reset,
    control,
    setError,
    setFocus,
    handleSubmit,
    formState: { errors, isDirty, dirtyFields },
  } = useUpdateEmployeeForm(employeeFormValues)

  // O perfil já é carregado pelo cabeçalho do painel, então aqui isso costuma ser leitura de cache.
  const { data: profileData } = useQuery({
    queryKey: queryKeys.getProfile(),
    queryFn: getProfile,
  })

  const isEditingHimself = profileData?.employee.id === employee.id

  const { mutateAsync: updateEmployeeMutation, isPending: isUpdating } = useMutation({
    mutationFn: updateEmployee,
  })

  /** Reabrir descarta o rascunho anterior: o painel é uma correção pontual, não um formulário em curso. */
  function handleOpenChange(value: boolean) {
    if (value) {
      reset(employeeFormValues)
      setOpen(true)

      return
    }

    // Fechar no meio da chamada esconderia o contexto: o toast de erro chegaria sem os dados na tela.
    if (isUpdating) return

    setOpen(false)
  }

  async function handleUpdateEmployee({ name, email, role }: UpdateEmployeeFormType) {
    try {
      // Só o que mudou viaja. A rota monta o `data` do update com o que chegou preenchido, então mandar
      // o e-mail intocado junto seria pedir à api-fr que revalidasse unicidade de um dado que ninguém tocou.
      await updateEmployeeMutation({
        employeeId: employee.id,
        name: dirtyFields.name ? name : undefined,
        email: dirtyFields.email ? email : undefined,
        role: dirtyFields.role ? role : undefined,
      })

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.getEmployees() }),
        // O nome e o e-mail do próprio admin aparecem no cabeçalho do painel — sem isso, ele salvaria a
        // correção e continuaria vendo o dado antigo no canto da tela.
        isEditingHimself ? queryClient.invalidateQueries({ queryKey: queryKeys.getProfile() }) : null,
      ])

      toast.success(`${name} atualizado(a).`, {
        description: dirtyFields.role ? `Agora com o papel de ${ROLE_LABELS[role].toLowerCase()}.` : undefined,
      })

      setOpen(false)
    } catch (err) {
      const retryAfterInSeconds = getRetryAfterInSeconds(err)

      if (retryAfterInSeconds) {
        toast.error(`Muitas tentativas. Tente novamente em ${formatWaitTime(retryAfterInSeconds)}.`)
        return
      }

      const message = getApiErrorMessage(err, 'Não foi possível salvar as alterações. Verifique sua conexão e tente novamente.')

      // O e-mail é `@unique` na api-fr e volta como 400 com a mensagem pronta. Jogar isso só no toast
      // deixaria o admin sem saber qual campo corrigir — e é sempre este.
      if (getApiErrorStatus(err) === 400 && message.toLowerCase().includes('mail')) {
        setError('email', { message })
        setFocus('email')
        return
      }

      setFocus('name')
      toast.error(message)
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
              aria-label={`Atualizar o colaborador ${employee.name}`}
              onClick={() => handleOpenChange(true)}
            />
          }
        >
          <SquarePen />
        </TooltipTrigger>

        <TooltipContent>Atualizar colaborador</TooltipContent>
      </Tooltip>

      {/* Mesma anatomia do cadastro: painel flutuante à direita, com o respiro do `--drawer-inset` e a
          faixa do `::after` apagada para não riscar a borda arredondada. */}
      <Drawer open={open} onOpenChange={handleOpenChange} swipeDirection="right">
        <DrawerContent className="rounded-xl border shadow-lg [--drawer-bleed-background:transparent] [--drawer-inset:0.75rem] sm:[--drawer-content-width:28rem]!">
          <DrawerHeader className="relative pb-4">
            <DrawerTitle>Editar colaborador</DrawerTitle>

            <DrawerDescription>
              As salas vinculadas e a senha não mudam por aqui — cada uma tem o seu próprio caminho na listagem.
            </DrawerDescription>

            <DrawerClose render={<Button variant="ghost" size="icon-sm" className="absolute top-3 right-3" />}>
              <XIcon />
              <span className="sr-only">Fechar</span>
            </DrawerClose>
          </DrawerHeader>

          <form
            noValidate
            id="update-employee-form"
            onSubmit={handleSubmit(handleUpdateEmployee)}
            className="flex-1 overflow-y-auto px-4"
          >
            <FieldGroup>
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="update-employee-name">Nome completo</FieldLabel>

                <Input
                  id="update-employee-name"
                  placeholder="John Doe da Silva"
                  autoComplete="off"
                  aria-invalid={!!errors.name}
                  className="h-10 text-sm"
                  {...register('name')}
                />

                <FieldError errors={[errors.name]} />
              </Field>

              {/* O CPF é a credencial de acesso do colaborador e a rota de atualização não o aceita.
                  Some-lo do painel faria parecer esquecimento; mostrá-lo bloqueado responde a pergunta
                  antes de ela ser feita. */}
              <Field>
                <FieldLabel htmlFor="update-employee-cpf">CPF</FieldLabel>

                <Input
                  id="update-employee-cpf"
                  disabled
                  readOnly
                  value={maskCpf(employee.cpf)}
                  className="h-10 text-sm tabular-nums"
                />

                <FieldDescription>O CPF é usado para entrar no painel e não pode ser alterado por aqui.</FieldDescription>
              </Field>

              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="update-employee-email">E-mail</FieldLabel>

                <Input
                  id="update-employee-email"
                  type="email"
                  placeholder="john.doe@salalivre.app"
                  autoComplete="off"
                  aria-invalid={!!errors.email}
                  className="h-10 text-sm lowercase placeholder:normal-case"
                  {...register('email')}
                />

                {errors.email ? (
                  <FieldError errors={[errors.email]} />
                ) : (
                  <FieldDescription>É por ele que chegam os dados de acesso e a recuperação de senha.</FieldDescription>
                )}
              </Field>

              <Field data-invalid={!!errors.role}>
                <FieldLabel htmlFor="update-employee-role">Papel</FieldLabel>

                <Controller
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value: EmployeeRole | null) => value && field.onChange(value)}
                      // Rebaixar a si mesmo tira o acesso à área administrativa na hora — inclusive o
                      // acesso a este painel, que é o único lugar de onde daria para desfazer. A api-fr
                      // permite; quem impede é a tela.
                      disabled={isEditingHimself || isUpdating}
                    >
                      <SelectTrigger
                        id="update-employee-role"
                        ref={field.ref}
                        aria-invalid={!!errors.role}
                        className="h-10 w-full"
                      >
                        <SelectValue>
                          {(value: EmployeeRole | null) =>
                            value ? (
                              <span className="flex items-center gap-2">
                                {value === 'ADMIN' ? <ShieldCheckIcon className="size-4" /> : <UserRoundIcon className="size-4" />}

                                <span className="text-sm">{ROLE_LABELS[value]}</span>
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-sm">Selecione o papel</span>
                            )
                          }
                        </SelectValue>
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="MEMBER" className="py-2">
                          <UserRoundIcon className="size-4" />

                          <span className="text-sm">Colaborador</span>
                        </SelectItem>

                        <SelectItem value="ADMIN" className="py-2">
                          <ShieldCheckIcon className="size-4" />

                          <span className="text-sm">Administrador</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />

                {errors.role ? (
                  <FieldError errors={[errors.role]} />
                ) : (
                  <FieldDescription>
                    {isEditingHimself
                      ? 'Você não pode alterar o próprio papel: perderia o acesso à área administrativa na hora.'
                      : 'O administrador gerencia salas, estações e colaboradores. O colaborador só opera as liberações.'}
                  </FieldDescription>
                )}
              </Field>
            </FieldGroup>
          </form>

          <DrawerFooter className="flex w-full flex-row items-center justify-end border-t pt-4">
            {/* `isDirty` porque salvar sem mudança nenhuma gastaria um PATCH para reescrever o mesmo registro. */}
            <Button type="submit" form="update-employee-form" className="w-full" disabled={!isDirty || isUpdating}>
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
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}
