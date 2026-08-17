import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import type { CSSProperties, ReactNode } from 'react'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { PanelHeader } from './_components/shared/panel-header'
import { PanelSidebar } from './_components/shared/panel-sidebar'

export const metadata: Metadata = {
  title: 'Painel',
}

// Altura do header (h-12). A sidebar é `fixed`, então precisa do mesmo valor para começar logo abaixo dele.
const HEADER_HEIGHT = '3rem'

export default async function PrivateLayout({ children }: { children: ReactNode }) {
  // O SidebarProvider grava `sidebar_state` a cada toggle, mas quem lê é o servidor:
  // sem isto o padrão `defaultOpen` venceria e a sidebar voltaria aberta a cada recarga.
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get('sidebar_state')?.value !== 'false'

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
        <PanelSidebar />

        <SidebarInset className="min-h-0">
          <div className="flex flex-1 flex-col gap-6 overflow-auto p-6">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
