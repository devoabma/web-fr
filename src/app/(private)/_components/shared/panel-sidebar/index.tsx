'use client'

import Link from 'next/link'
import type { ComponentProps } from 'react'
import { BrandMark } from '@/components/app/brand-mark'
import { Separator } from '@/components/ui/separator'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { NavItems } from './nav-items'
import { ToggleSidebarButton } from './toggle-sidebar-button'

type PanelSidebarProps = ComponentProps<typeof Sidebar>

export function PanelSidebar({ ...props }: PanelSidebarProps) {
  return (
    <Sidebar collapsible="icon" className="border-sidebar-border" {...props}>
      {/* Brilho suave no topo: dá profundidade ao azul sem competir com o conteúdo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_38%_at_20%_-8%,rgba(255,255,255,0.10),transparent_72%)]"
      />

      <SidebarHeader className="relative h-12 justify-center border-sidebar-border border-b px-2 py-0">
        <Link href="/panel" className="flex items-center gap-2.5 sm:justify-center">
          <BrandMark className="size-8 shrink-0 text-white" />
          <div className="flex min-w-0 flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <h1 className="truncate font-bold text-base text-white tracking-tight">Sala Livre</h1>
            <p className="truncate text-[10px] text-sidebar-foreground/55 uppercase tracking-widest">Gestão de Salas</p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="relative px-2 py-3">
        <NavItems />
      </SidebarContent>

      <Separator className="relative my-2 bg-sidebar-border" />

      <SidebarFooter className="relative">
        <SidebarMenu>
          <SidebarMenuItem>
            <ToggleSidebarButton />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />

      {/* Marca d'água: some no modo ícone para não virar ruído na faixa estreita */}
      <BrandMark
        aria-hidden
        accentClassName="text-current"
        className="pointer-events-none absolute -right-10 -bottom-14 size-56 text-white/4 group-data-[collapsible=icon]:hidden"
      />
    </Sidebar>
  )
}
