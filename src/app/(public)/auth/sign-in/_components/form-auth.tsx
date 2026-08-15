'use client'

import { LoaderCircleIcon, LogInIcon, TriangleAlertIcon } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { Controller } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { maskCpf } from '@/utils/masks/cpf'
import { type LoginFormType, useLoginForm } from './form-auth-schema'

export function FormAuth() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const form = useLoginForm({ cpf: '', password: '', remember: true })

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form

  async function handleSignIn(data: LoginFormType) {
    console.log(data)
  }

  return (
    <form noValidate onSubmit={handleSubmit(handleSignIn)} className="mt-8 flex flex-col gap-6">
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

        <Field data-invalid={!!errors.password}>
          <div className="flex items-baseline justify-between gap-3">
            <FieldLabel htmlFor="password">Senha</FieldLabel>

            <Link
              href="/auth/forgot-password"
              className="font-semibold text-rose-700 text-xs transition-colors hover:text-rose-800"
            >
              Esqueci minha senha
            </Link>
          </div>

          <div className="relative flex items-center">
            <Input
              id="password"
              type={isPasswordVisible ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              aria-invalid={!!errors.password}
              className="h-11 rounded-lg bg-card pr-22 pl-3.5 text-sm shadow-xs"
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

          <FieldError errors={[errors.password]} />
        </Field>

        <Field orientation="horizontal" className="items-center gap-2.5">
          <Controller
            control={control}
            name="remember"
            render={({ field }) => (
              <Checkbox
                id="remember"
                name={field.name}
                inputRef={field.ref}
                checked={field.value}
                onBlur={field.onBlur}
                onCheckedChange={checked => field.onChange(checked)}
              />
            )}
          />

          <FieldLabel htmlFor="remember" className="font-normal text-muted-foreground">
            Manter-me conectado
          </FieldLabel>
        </Field>
      </FieldGroup>

      <Button type="submit" size="lg" disabled={isSubmitting} className="h-11 w-full text-sm shadow-lg shadow-primary/15">
        {isSubmitting ? (
          <>
            <LoaderCircleIcon data-icon="inline-start" className="animate-spin" />
            Entrando...
          </>
        ) : (
          <>
            <LogInIcon data-icon="inline-start" />
            Entrar no painel
          </>
        )}
      </Button>
    </form>
  )
}
