'use client'

import type { ComponentProps } from 'react'
import { BrandMark } from '@/components/app/brand-mark'
import { Separator } from '@/components/ui/separator'
import { Sidebar, SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarRail } from '@/components/ui/sidebar'
import { NavItems } from './nav-items'
import { ToggleSidebarButton } from './toggle-sidebar-button'

type PanelSidebarProps = ComponentProps<typeof Sidebar>

export function PanelSidebar({ ...props }: PanelSidebarProps) {
  return (
    <Sidebar collapsible="icon" className="border-sidebar-border" {...props}>
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

      <BrandMark
        aria-hidden
        accentClassName="text-current"
        className="pointer-events-none absolute -right-10 -bottom-14 size-56 text-white/4 group-data-[collapsible=icon]:hidden"
      />
    </Sidebar>
  )
}
