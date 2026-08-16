'use client'

import { PanelLeftIcon } from 'lucide-react'
import { SidebarMenuButton, useSidebar } from '@/components/ui/sidebar'

export function ToggleSidebarButton() {
  const { state, isMobile, toggleSidebar } = useSidebar()

  const isCollapsed = !isMobile && state === 'collapsed'
  const label = isCollapsed ? 'Abrir painel' : 'Fechar painel'

  return (
    <SidebarMenuButton
      onClick={toggleSidebar}
      aria-label={label}
      tooltip={label}
      className="text-sidebar-foreground/60 hover:text-sidebar-accent-foreground"
    >
      <PanelLeftIcon className="transition-transform duration-200 group-data-[collapsible=icon]:rotate-180" />
      <span className="group-data-[collapsible=icon]:hidden">{label}</span>
    </SidebarMenuButton>
  )
}
