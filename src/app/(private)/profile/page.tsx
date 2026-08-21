import type { Metadata } from 'next'
import { ProfileDetails } from './_components/profile-details'

export const metadata: Metadata = {
  title: 'Minha Conta',
}

export default function ProfilePage() {
  return (
    <>
      <header className="flex flex-col gap-1">
        <h1 className="font-semibold text-primary text-xl tracking-tight">Configurações de Conta</h1>

        <p className="max-w-3xl text-muted-foreground text-sm leading-relaxed">
          Seus dados de cadastro e a senha de acesso ao painel.
        </p>
      </header>

      {/* A largura da coluna é o que segura a leitura: esticado num monitor de balcão, o cartão de
          dados viraria uma faixa com dois campos perdidos nas pontas. */}
      <div className="max-w-3xl">
        <ProfileDetails />
      </div>
    </>
  )
}
