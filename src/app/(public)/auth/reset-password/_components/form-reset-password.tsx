'use client'

import { useMutation } from '@tanstack/react-query'
import { ArrowLeftIcon, CheckCircle2Icon, KeyRoundIcon, LoaderCircleIcon, LogInIcon, TriangleAlertIcon } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { Controller } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { SIGN_IN_ROUTE } from '@/lib/auth/routes'
import { formatWaitTime, getApiErrorMessage, getRetryAfterInSeconds } from '@/lib/http/api-error'
import { resetPassword } from '@/server/employees/reset-password'
import { maskRecoveryCode, RECOVERY_CODE_LENGTH } from '@/utils/masks/recovery-code'
import { type ResetPasswordFormType, useResetPasswordForm } from './form-reset-password-schema'

interface FormResetPasswordProps {
  initialCode: string
}

export function FormResetPassword({ initialCode }: FormResetPasswordProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isDone, setIsDone] = useState(false)

  const form = useResetPasswordForm({ code: initialCode, password: '', confirmPassword: '' })

  const {
    control,
    register,
    setError,
    clearErrors,
    setFocus,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form

  const { mutateAsync: resetPasswordMutate } = useMutation({
    mutationFn: resetPassword,
  })

  async function handleResetPassword(data: ResetPasswordFormType) {
    clearErrors('root')

    try {
      await resetPasswordMutate(data)

      setIsDone(true)

      toast.success('Senha redefinida com sucesso.', {
        description: 'Use a nova senha para entrar no painel.',
      })
    } catch (err) {
      const retryAfterInSeconds = getRetryAfterInSeconds(err)

      // O teto aqui é de 10 tentativas por 10 minutos por IP: sem dizer quanto falta, o usuário fica
      // batendo no botão achando que o código é que está errado.
      const message = retryAfterInSeconds
        ? `Muitas tentativas. Tente novamente em ${formatWaitTime(retryAfterInSeconds)}.`
        : getApiErrorMessage(err, 'Não foi possível redefinir a senha agora. Verifique sua conexão e tente novamente.')

      setError('root', { message })

      // A api-fr recusa por dois motivos bem diferentes — código inválido/expirado ou senha repetida — e
      // devolve os dois como 400 sem nada que os distinga além do texto. Sem esta leitura, o foco cairia
      // sempre no mesmo campo e mandaria o usuário corrigir o que não estava errado.
      setFocus(/c[óo]digo/i.test(message) ? 'code' : 'password')
    }
  }

  if (isDone) {
    return (
      <div className="mt-8 flex flex-col gap-6">
        <div className="flex flex-col items-start gap-3 rounded-xl border border-green-600/25 bg-green-600/10 px-4 py-4">
          <span className="flex size-9 items-center justify-center rounded-lg bg-green-600/15 text-green-600">
            <CheckCircle2Icon className="size-4.5" />
          </span>

          <div className="flex flex-col gap-1.5">
            <h2 className="font-semibold text-green-600 text-sm">Senha redefinida</h2>

            <p className="text-muted-foreground text-sm leading-relaxed">
              Enviamos uma confirmação para o seu e-mail. Se você não reconhece esta alteração, avise a administração
              imediatamente.
            </p>
          </div>
        </div>

        <Button
          size="lg"
          nativeButton={false}
          render={<Link href={SIGN_IN_ROUTE} />}
          className="h-11 w-full text-sm shadow-lg shadow-primary/15"
        >
          <LogInIcon data-icon="inline-start" />
          Entrar com a nova senha
        </Button>
      </div>
    )
  }

  const isPasswordFieldType = isPasswordVisible ? 'text' : 'password'

  return (
    <form noValidate onSubmit={handleSubmit(handleResetPassword)} className="mt-8 flex flex-col gap-6">
      {errors.root?.message && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-destructive/25 bg-destructive/6 px-3.5 py-3 text-destructive"
        >
          <TriangleAlertIcon className="mt-px size-4 shrink-0" />
          <span className="text-sm leading-snug">{errors.root.message}</span>
        </div>
      )}

      <FieldGroup>
        <Field data-invalid={!!errors.code}>
          <FieldLabel htmlFor="code">Código de verificação</FieldLabel>

          <Controller
            control={control}
            name="code"
            render={({ field }) => (
              <Input
                id="code"
                autoComplete="one-time-code"
                autoCapitalize="characters"
                spellCheck={false}
                placeholder="A1B2C3"
                aria-invalid={!!errors.code}
                className="h-11 rounded-lg bg-card px-3.5 text-center font-mono text-base uppercase tracking-[0.4em] shadow-xs"
                name={field.name}
                ref={field.ref}
                value={field.value}
                onBlur={field.onBlur}
                onChange={event => field.onChange(maskRecoveryCode(event.target.value))}
              />
            )}
          />

          {errors.code ? (
            <FieldError errors={[errors.code]} />
          ) : (
            <FieldDescription>
              Os {RECOVERY_CODE_LENGTH} caracteres enviados por e-mail. O código vale 5 minutos.
            </FieldDescription>
          )}
        </Field>

        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor="password">Nova senha</FieldLabel>

          <Input
            id="password"
            type={isPasswordFieldType}
            autoComplete="new-password"
            placeholder="••••••••"
            aria-invalid={!!errors.password}
            className="h-11 rounded-lg bg-card px-3.5 text-sm shadow-xs"
            {...register('password')}
          />

          {/* Sem esta dica, o mínimo de 8 caracteres e a recusa de senha repetida só apareceriam depois de errar. */}
          {errors.password ? (
            <FieldError errors={[errors.password]} />
          ) : (
            <FieldDescription>Ao menos 8 caracteres, diferente da senha anterior.</FieldDescription>
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
            className="h-11 rounded-lg bg-card px-3.5 text-sm shadow-xs"
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

      <Button type="submit" size="lg" disabled={isSubmitting} className="h-11 w-full text-sm shadow-lg shadow-primary/15">
        {isSubmitting ? (
          <>
            <LoaderCircleIcon data-icon="inline-start" className="animate-spin" />
            Redefinindo...
          </>
        ) : (
          <>
            <KeyRoundIcon data-icon="inline-start" />
            Redefinir senha
          </>
        )}
      </Button>

      <div className="flex flex-col items-center gap-3">
        {/* O código morre em 5 minutos, então "pedir outro" é parte do fluxo normal — não um caso de exceção. */}
        <Link href="/auth/forgot-password" className="font-semibold text-rose-700 text-xs transition-colors hover:text-rose-800">
          Código expirado? Solicitar um novo
        </Link>

        <Link
          href={SIGN_IN_ROUTE}
          className="inline-flex items-center justify-center gap-1.5 font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="size-3.5" />
          Voltar para o login
        </Link>
      </div>
    </form>
  )
}
