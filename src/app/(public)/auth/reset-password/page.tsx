import type { Metadata } from 'next'
import { isRecoveryCode } from '@/utils/masks/recovery-code'
import { FormResetPassword } from './_components/form-reset-password'

export const metadata: Metadata = {
  title: 'Redefinir senha',
}

interface ResetPasswordPageProps {
  searchParams: Promise<{ code?: string }>
}

function sanitizeCode(code: string | undefined) {
  if (typeof code !== 'string') return ''

  const normalized = code.trim().toUpperCase()

  return isRecoveryCode(normalized) ? normalized : ''
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { code } = await searchParams

  return (
    <main className="mx-auto w-full p-8">
      <div className="flex flex-col">
        <h1 className="font-bold text-3xl text-primary tracking-tight">Redefinir senha</h1>
        <p className="text-muted-foreground text-sm">
          Informe o código que enviamos por e-mail e cadastre a sua nova senha de acesso.
        </p>
      </div>

      <FormResetPassword initialCode={sanitizeCode(code)} />
    </main>
  )
}
