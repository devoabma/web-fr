'use client'

import { useMutation } from '@tanstack/react-query'
import { KeyRoundIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { formatWaitTime, getApiErrorMessage, getRetryAfterInSeconds } from '@/lib/http/api-error'
import { changePassword } from '@/server/employees/change-password'
import { type ChangePasswordFormType, useChangePasswordForm } from './change-password-schema'

export function ChangePasswordDialog() {
  const [isOpen, setIsOpen] = useState(false)

  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const form = useChangePasswordForm()

  const {
    register,
    reset,
    resetField,
    setFocus,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form

  function closeDialog() {
    setIsOpen(false)

    reset()
    setIsPasswordVisible(false)
  }

  /** Só o que o usuário dispara (ESC, clique fora, botão Cancelar). O sucesso fecha por `closeDialog`. */
  function handleOpenChange(open: boolean) {
    if (open) {
      setIsOpen(true)
      return
    }

    // Fechar no meio da chamada limparia o formulário com a requisição ainda de pé: o toast de erro
    // chegaria depois, sem os dados na tela para corrigir e tentar de novo.
    if (isSubmitting) return

    closeDialog()
  }

  const { mutateAsync: changePasswordMutate } = useMutation({
    mutationFn: changePassword,
  })

  async function handleChangePassword({ currentPassword, newPassword, confirmPassword }: ChangePasswordFormType) {
    try {
      await changePasswordMutate({
        currentPassword,
        newPassword,
        confirmNewPassword: confirmPassword,
      })

      closeDialog()

      toast.success('Senha alterada com sucesso.')
    } catch (err) {
      // Só a senha atual é descartada: é o campo que costuma estar errado, e limpar os três obrigaria a
      // redigitar a nova senha inteira por causa de um dígito trocado no primeiro campo.
      resetField('currentPassword')
      setFocus('currentPassword')

      const retryAfterInSeconds = getRetryAfterInSeconds(err)

      // A `message` da api-fr é o que explica a recusa ("senha atual incorreta", política de senha).
      // O texto genérico só entra quando não veio resposta nenhuma — queda de rede, 502 respondendo HTML.
      toast.error(
        retryAfterInSeconds
          ? `Muitas tentativas. Tente novamente em ${formatWaitTime(retryAfterInSeconds)}.`
          : getApiErrorMessage(err, 'Não foi possível alterar a senha. Verifique sua conexão e tente novamente.')
      )
    }
  }

  const isPasswordFieldType = isPasswordVisible ? 'text' : 'password'

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="outline" />}>
        <KeyRoundIcon data-icon="inline-start" />
        Alterar senha
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Alterar senha</DialogTitle>

          <DialogDescription>
            Confirme a senha atual antes de definir a nova. Sua sessão continua aberta depois da troca.
          </DialogDescription>
        </DialogHeader>

        <form noValidate id="change-password-form" onSubmit={handleSubmit(handleChangePassword)}>
          <FieldGroup>
            <Field data-invalid={!!errors.currentPassword}>
              <FieldLabel htmlFor="currentPassword">Senha atual</FieldLabel>

              <Input
                id="currentPassword"
                type={isPasswordFieldType}
                autoComplete="current-password"
                placeholder="••••••••"
                aria-invalid={!!errors.currentPassword}
                className="h-10"
                {...register('currentPassword')}
              />

              <FieldError errors={[errors.currentPassword]} />
            </Field>

            <Field data-invalid={!!errors.newPassword}>
              <FieldLabel htmlFor="newPassword">Nova senha</FieldLabel>

              <Input
                id="newPassword"
                type={isPasswordFieldType}
                autoComplete="new-password"
                placeholder="••••••••"
                aria-invalid={!!errors.newPassword}
                className="h-10"
                {...register('newPassword')}
              />

              {/* Sem erro na tela, o mínimo de 8 caracteres só apareceria depois da primeira recusa. */}
              {errors.newPassword ? (
                <FieldError errors={[errors.newPassword]} />
              ) : (
                <FieldDescription>Ao menos 8 caracteres, diferente da senha atual.</FieldDescription>
              )}
            </Field>

            <Field data-invalid={!!errors.confirmPassword}>
              <FieldLabel htmlFor="confirmPassword">Confirmar nova senha</FieldLabel>

              <Input
                id="confirmPassword"
                type={isPasswordFieldType}
                autoComplete="new-password"
                placeholder="••••••••"
                aria-invalid={!!errors.confirmPassword}
                className="h-10"
                {...register('confirmPassword')}
              />

              <FieldError errors={[errors.confirmPassword]} />
            </Field>

            <Field orientation="horizontal" className="items-center gap-2.5">
              <Checkbox
                id="show-passwords"
                checked={isPasswordVisible}
                onCheckedChange={checked => setIsPasswordVisible(checked === true)}
              />

              <FieldLabel htmlFor="show-passwords" className="font-normal text-muted-foreground">
                Mostrar senhas
              </FieldLabel>
            </Field>
          </FieldGroup>
        </form>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" disabled={isSubmitting} />}>Cancelar</DialogClose>

          <Button type="submit" form="change-password-form" disabled={isSubmitting}>
            <KeyRoundIcon data-icon="inline-start" />
            {isSubmitting ? 'Salvando...' : 'Salvar nova senha'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
