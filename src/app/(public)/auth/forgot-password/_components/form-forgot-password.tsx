'use client'

import { useMutation } from '@tanstack/react-query'
import { ArrowLeftIcon, KeyRoundIcon, LoaderCircleIcon, MailCheckIcon, SendIcon, TriangleAlertIcon } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Controller } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { SIGN_IN_ROUTE } from '@/lib/auth/routes'
import { formatWaitTime, getApiErrorMessage, getRetryAfterInSeconds } from '@/lib/http/api-error'
import { requestPasswordRecovery } from '@/server/employees/request-password-recovery'
import { maskCpf } from '@/utils/masks/cpf'
import { type ForgotPasswordFormType, useForgotPasswordForm } from './form-forgot-password-schema'

/**
 * Espera antes de liberar o reenvio.
 *
 * O teto da API é de 5 requisições por 15 minutos **por IP** — sem freio, dois cliques nervosos
 * queimam metade da cota e o usuário fica trancado justamente quando mais precisa do código.
 */
const RESEND_COOLDOWN_IN_SECONDS = 60

export function FormForgotPassword() {
  // Guarda o par enviado: o reenvio repete a mesma requisição sem depender do formulário, que já saiu da tela.
  const [sentTo, setSentTo] = useState<ForgotPasswordFormType | null>(null)
  const [cooldownEndsAt, setCooldownEndsAt] = useState<number | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(0)

  const form = useForgotPasswordForm({ cpf: '', email: '' })

  const {
    control,
    register,
    setError,
    clearErrors,
    setFocus,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form

  const { mutateAsync: requestRecovery, isPending: isResending } = useMutation({
    mutationFn: requestPasswordRecovery,
  })

  /**
   * Contagem regressiva do reenvio.
   *
   * O restante é derivado de um instante absoluto, não decrementado a cada tique: aba em segundo plano
   * (ou notebook suspenso) engasga o `setInterval`, e um contador que só subtrai ficaria travado em "42s".
   */
  useEffect(() => {
    if (!cooldownEndsAt) return

    const deadline = cooldownEndsAt

    function tick() {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))

      setSecondsLeft(remaining)

      if (remaining === 0) setCooldownEndsAt(null)
    }

    tick()

    const timer = setInterval(tick, 1000)

    return () => clearInterval(timer)
  }, [cooldownEndsAt])

  /** Traduz a falha da API em uma frase acionável — o 429 precisa dizer quanto falta, não só "erro". */
  function reportError(err: unknown) {
    const retryAfterInSeconds = getRetryAfterInSeconds(err)

    return retryAfterInSeconds
      ? `Muitas solicitações de recuperação. Tente novamente em ${formatWaitTime(retryAfterInSeconds)}.`
      : getApiErrorMessage(err, 'Não foi possível enviar o e-mail agora. Verifique sua conexão e tente novamente.')
  }

  async function handleRequestRecovery(data: ForgotPasswordFormType) {
    clearErrors('root')

    try {
      await requestRecovery(data)

      setSentTo(data)
      setCooldownEndsAt(Date.now() + RESEND_COOLDOWN_IN_SECONDS * 1000)

      toast.success('E-mail enviado.', {
        description: 'Confira sua caixa de entrada para continuar a redefinição.',
      })
    } catch (err) {
      setError('root', { message: reportError(err) })
      setFocus('email')
    }
  }

  async function handleResend() {
    if (!sentTo || secondsLeft > 0) return

    try {
      await requestRecovery(sentTo)

      setCooldownEndsAt(Date.now() + RESEND_COOLDOWN_IN_SECONDS * 1000)

      toast.success('E-mail reenviado.', {
        description: 'O código anterior deixou de valer — use o mais recente.',
      })
    } catch (err) {
      toast.error('Falha no reenvio.', {
        description: reportError(err),
      })
    }
  }

  if (sentTo) {
    return (
      <div className="mt-8 flex flex-col gap-6">
        <div className="flex flex-col items-start gap-3 rounded-xl border border-primary/15 bg-primary/4 px-4 py-4">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <MailCheckIcon className="size-4.5" />
          </span>

          <div className="flex flex-col gap-1.5">
            <h2 className="font-semibold text-primary text-sm">Instruções enviadas</h2>

            <p className="text-muted-foreground text-sm leading-relaxed">
              Enviamos um código de 6 caracteres para <span className="font-medium text-foreground">{sentTo.email}</span>. Ele
              vale por <span className="font-medium text-foreground">5 minutos</span> — use-o para cadastrar a nova senha.
            </p>
          </div>
        </div>

        <p className="text-muted-foreground text-xs leading-relaxed">
          Não recebeu? Confira a caixa de spam e confirme se este é o e-mail cadastrado pela administração.
        </p>

        <div className="flex flex-col gap-3">
          <Button
            size="lg"
            nativeButton={false}
            render={<Link href="/auth/reset-password" />}
            className="h-11 w-full text-sm shadow-lg shadow-primary/15"
          >
            <KeyRoundIcon data-icon="inline-start" />
            Já tenho o código
          </Button>

          <Button
            type="button"
            size="lg"
            variant="outline"
            disabled={isResending || secondsLeft > 0}
            onClick={handleResend}
            className="h-11 w-full text-sm"
          >
            {isResending ? (
              <>
                <LoaderCircleIcon data-icon="inline-start" className="animate-spin" />
                Reenviando...
              </>
            ) : (
              <>
                <SendIcon data-icon="inline-start" />
                {secondsLeft > 0 ? `Reenviar em ${secondsLeft}s` : 'Reenviar e-mail'}
              </>
            )}
          </Button>

          <Link
            href={SIGN_IN_ROUTE}
            className="inline-flex items-center justify-center gap-1.5 font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon className="size-3.5" />
            Voltar para o login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form noValidate onSubmit={handleSubmit(handleRequestRecovery)} className="mt-8 flex flex-col gap-6">
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
        <Field data-invalid={!!errors.cpf}>
          <FieldLabel htmlFor="cpf">CPF</FieldLabel>

          <Controller
            control={control}
            name="cpf"
            render={({ field }) => (
              <Input
                id="cpf"
                inputMode="numeric"
                autoComplete="username"
                placeholder="000.000.000-00"
                aria-invalid={!!errors.cpf}
                className="h-11 rounded-lg bg-card px-3.5 text-sm shadow-xs"
                name={field.name}
                ref={field.ref}
                value={field.value}
                onBlur={field.onBlur}
                onChange={event => field.onChange(maskCpf(event.target.value))}
              />
            )}
          />

          <FieldError errors={[errors.cpf]} />
        </Field>

        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email">E-mail cadastrado</FieldLabel>

          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="voce@oabma.org.br"
            aria-invalid={!!errors.email}
            className="h-11 rounded-lg bg-card px-3.5 text-sm shadow-xs"
            {...register('email')}
          />

          <FieldError errors={[errors.email]} />
        </Field>
      </FieldGroup>

      <Button type="submit" size="lg" disabled={isSubmitting} className="h-11 w-full text-sm shadow-lg shadow-primary/15">
        {isSubmitting ? (
          <>
            <LoaderCircleIcon data-icon="inline-start" className="animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <SendIcon data-icon="inline-start" />
            Enviar código de recuperação
          </>
        )}
      </Button>

      <Link
        href={SIGN_IN_ROUTE}
        className="inline-flex items-center justify-center gap-1.5 font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-3.5" />
        Voltar para o login
      </Link>
    </form>
  )
}
