'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2Icon, PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { Controller } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { queryKeys } from '@/constants/query-keys'
import { formatWaitTime, getApiErrorMessage, getApiErrorStatus, getRetryAfterInSeconds } from '@/lib/http/api-error'
import { createEmployee } from '@/server/employees/create'
import { maskCpf } from '@/utils/masks/cpf'
import { type NewEmployeeFormType, useNewEmployeeForm } from './new-employee-schema'

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

  const {
    register,
    reset,
    control,
    setError,
    setFocus,
    handleSubmit,
    formState: { errors },
  } = useNewEmployeeForm()

  const { mutateAsync: createEmployeeMutation, isPending: isCreating } = useMutation({
    mutationFn: createEmployee,
  })

  function closeSheet() {
    setOpen(false)
    setIsPasswordVisible(false)
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

  async function handleCreateEmployee({ name, cpf, email, password }: NewEmployeeFormType) {
    try {
      await createEmployeeMutation({ name, cpf, email, password })

      await queryClient.invalidateQueries({ queryKey: queryKeys.getEmployees() })

      toast.success(`${name} cadastrado(a).`, {
        description: `Os dados de acesso foram enviados para ${email}.`,
      })

      closeSheet()
    } catch (err) {
      const retryAfterInSeconds = getRetryAfterInSeconds(err)

      if (retryAfterInSeconds) {
        toast.error(`Muitas tentativas. Tente novamente em ${formatWaitTime(retryAfterInSeconds)}.`)
        return
      }

      const message = getApiErrorMessage(err, 'Não foi possível cadastrar o colaborador. Verifique sua conexão e tente novamente.')
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
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger render={<Button variant="default" className="w-full sm:w-auto" />}>
        <PlusIcon data-icon="inline-start" /> Adicionar
      </SheetTrigger>

      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Novo colaborador</SheetTitle>

          <SheetDescription>
            O colaborador entra no painel pelo CPF e recebe os dados de acesso por e-mail assim que é cadastrado.
          </SheetDescription>
        </SheetHeader>

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
                placeholder="Maria de Souza"
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

              {errors.cpf ? (
                <FieldError errors={[errors.cpf]} />
              ) : (
                <FieldDescription>É o login do colaborador no painel. Não pode repetir.</FieldDescription>
              )}
            </Field>

            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">E-mail</FieldLabel>

              <Input
                id="email"
                type="email"
                placeholder="maria@oabma.org.br"
                autoComplete="off"
                aria-invalid={!!errors.email}
                className="h-10 text-sm lowercase placeholder:normal-case"
                {...register('email')}
              />

              {errors.email ? (
                <FieldError errors={[errors.email]} />
              ) : (
                <FieldDescription>Recebe as boas-vindas e a recuperação de senha. Confira antes de cadastrar.</FieldDescription>
              )}
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

              {errors.password ? (
                <FieldError errors={[errors.password]} />
              ) : (
                <FieldDescription>
                  Mínimo de 8 caracteres. Vai no e-mail de boas-vindas — o colaborador troca depois no perfil.
                </FieldDescription>
              )}
            </Field>
          </FieldGroup>
        </form>

        <SheetFooter className="flex w-full flex-row items-center justify-end border-t">
          {/* Sem `disabled`, o duplo clique dispara dois POST: o segundo volta como "CPF já cadastrado"
              e o usuário vê um erro para um colaborador que acabou de ser criado com sucesso. */}
          <Button type="submit" form="new-employee-form" className="w-full" disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2Icon data-icon="inline-start" className="animate-spin" /> Cadastrando colaborador
              </>
            ) : (
              <>
                <PlusIcon data-icon="inline-start" /> Cadastrar colaborador
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
