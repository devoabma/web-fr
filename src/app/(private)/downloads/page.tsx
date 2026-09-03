import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { readSession, SESSION_COOKIE_NAME } from '@/lib/auth/session'
import { DownloadsBoard } from './_components/downloads-board'
import { DownloadsNotice } from './_components/downloads-notice'

export const metadata: Metadata = {
  title: 'Downloads',
}

export default async function DownloadsPage() {
  // O papel sai do cookie, como no layout: assim as ações de gestão já vêm certas no HTML, sem
  // piscar na tela de quem não pode vê-las. Sem sessão legível, trata como MEMBER (menor
  // privilégio) — quem autoriza de verdade continua sendo o proxy e a api-fr, que só devolve os
  // registros inativos e só aceita as escritas quando o token é de ADMIN.
  const cookieStore = await cookies()
  const session = readSession(cookieStore.get(SESSION_COOKIE_NAME)?.value)

  const isAdmin = session?.role === 'ADMIN'

  return (
    <>
      <header className="flex flex-col gap-1">
        <h1 className="font-semibold text-primary text-xl tracking-tight">Downloads</h1>

        <p className="max-w-3xl text-muted-foreground text-sm leading-relaxed">
          {isAdmin
            ? 'Publique o instalador e o desinstalador do Sala Livre. É deste cadastro que sai o arquivo que o colaborador baixa.'
            : 'Baixe o instalador do Sala Livre para colocar uma estação em operação — e o desinstalador, quando ela sair.'}
        </p>
      </header>

      <DownloadsNotice isAdmin={isAdmin} />

      <DownloadsBoard isAdmin={isAdmin} />
    </>
  )
}
