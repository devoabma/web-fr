'use client'

import type { ComponentProps } from 'react'
import { BrandMark } from '@/components/app/brand-mark'
import { Separator } from '@/components/ui/separator'
import { Sidebar, SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarRail } from '@/components/ui/sidebar'
import type { Role } from '@/lib/auth/session'
import { NavItems } from './nav-items'
import { ToggleSidebarButton } from './toggle-sidebar-button'

type PanelSidebarProps = ComponentProps<typeof Sidebar> & {
  role: Role
}

export function PanelSidebar({ role, ...props }: PanelSidebarProps) {
  return (
    // `inset`: a sidebar deixa de ser uma coluna com borda e passa a flutuar sobre o fundo escuro, com o
    // conteúdo do painel virando uma ilha arredondada ao lado dela — a mesma anatomia do menu no mobile.
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarContent className="relative px-2 py-3">
        <NavItems role={role} />
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

      <BrandMark
        aria-hidden
        accentClassName="text-current"
        className="pointer-events-none absolute -right-10 -bottom-14 size-56 text-white/4 group-data-[collapsible=icon]:hidden"
      />
    </Sidebar>
  )
}
