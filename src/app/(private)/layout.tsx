import { cookies } from 'next/headers'
import type { CSSProperties, ReactNode } from 'react'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { readSession, SESSION_COOKIE_NAME } from '@/lib/auth/session'
import { PanelHeader } from './_components/shared/panel-header'
import { PanelSidebar } from './_components/shared/panel-sidebar'

const HEADER_HEIGHT = '3rem'

export default async function PrivateLayout({ children }: { children: ReactNode }) {
  // O SidebarProvider grava `sidebar_state` a cada toggle, mas quem lê é o servidor:
  // sem isto o padrão `defaultOpen` venceria e a sidebar voltaria aberta a cada recarga.
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get('sidebar_state')?.value !== 'false'

  // O papel sai do próprio cookie em vez do `getProfile` do client: assim a seção de Administração
  // já vem certa no HTML, sem piscar na tela de quem não pode vê-la. Sem sessão legível, trata como
  // MEMBER (menor privilégio) — o proxy e a api-fr continuam sendo a autorização de verdade.
  const session = readSession(cookieStore.get(SESSION_COOKIE_NAME)?.value)
  const role = session?.role ?? 'MEMBER'

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      // O header mora dentro do provider (o gatilho mobile depende do contexto da sidebar),
      // por isso o wrapper vira coluna: header em cima, sidebar + conteúdo na linha de baixo.
      className="h-svh flex-col overflow-hidden"
      style={{ '--sidebar-offset': HEADER_HEIGHT } as CSSProperties}
    >
      <PanelHeader />

      <div className="flex min-h-0 w-full flex-1">
        <PanelSidebar role={role} />

        <SidebarInset className="min-h-0">
          <div className="flex flex-1 flex-col gap-6 overflow-auto p-6">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
