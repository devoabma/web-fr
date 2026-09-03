import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { readSession, SESSION_COOKIE_NAME } from '@/lib/auth/session'
import { DownloadsBoard } from './_components/downloads-board'
import { DownloadsNotice } from './_components/downloads-notice'

export const metadata: Metadata = {
  title: 'Downloads',
}

export default async function DownloadsPage() {
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
