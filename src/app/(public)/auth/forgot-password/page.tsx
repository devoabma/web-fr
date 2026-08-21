import type { Metadata } from 'next'
import { FormForgotPassword } from './_components/form-forgot-password'

export const metadata: Metadata = {
  title: 'Esqueci minha senha',
}

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto w-full p-8">
      <div className="flex flex-col">
        <h1 className="font-bold text-3xl text-primary tracking-tight">Recuperar acesso</h1>
        <p className="text-muted-foreground text-sm">
          Informe o CPF e o e-mail cadastrados para receber o código de redefinição de senha.
        </p>
      </div>

      <FormForgotPassword />
    </main>
  )
}
