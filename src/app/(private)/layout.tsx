import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import Image from 'next/image'
import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { PanelSidebar } from './_components/shared/panel-sidebar'

export const metadata: Metadata = {
  title: 'Painel',
}

export default async function PrivateLayout({ children }: { children: ReactNode }) {
  // O SidebarProvider grava `sidebar_state` a cada toggle, mas quem lê é o servidor:
  // sem isto o padrão `defaultOpen` venceria e a sidebar voltaria aberta a cada recarga.
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get('sidebar_state')?.value !== 'false'

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <PanelSidebar />

      <SidebarInset>
        <header className="flex h-12 items-center justify-between gap-4 border-b px-4 sm:justify-end">
          <Image src="/logo.svg" alt="Sala Livre" width={36} height={36} className="size-8 sm:hidden" priority />

          {/* Criar um componete para o usuário logado, com foto, nome e status do sistema (online/offline) e colocar no canto superior direito do painel. */}
          <div className="flex items-center gap-3">
            <Badge variant="outline">
              <span className="size-1.5 min-w-1.5 animate-pulse rounded-full bg-green-600" />
              All OK
            </Badge>

            <p className="text-muted-foreground text-sm">Hilquias Ferreira Melo</p>

            <div className="relative size-7 overflow-hidden rounded-md">
              <Image
                src="https://github.com/hfmelodev.png"
                alt="Hilquias Ferreira Melo"
                fill
                sizes="28px"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 overflow-auto p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
