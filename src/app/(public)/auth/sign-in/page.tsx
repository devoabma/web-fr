import { FormAuth } from './_components/form-auth'

export default function SignInPage() {
  return (
    <main className="mx-auto w-full p-8">
      <div className="flex flex-col">
        <h1 className="font-bold text-3xl text-primary tracking-tight">Entrar na plataforma</h1>
        <p className="text-muted-foreground text-sm">Informe seus dados abaixo para acessar o sistema.</p>
      </div>

      <FormAuth />
    </main>
  )
}
