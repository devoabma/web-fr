'use client'

import { Computer, DoorOpen, LayoutDashboard, type LucideIcon, MonitorCheck, PrinterIcon, Users } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import type { Role } from '@/lib/auth/session'

type NavItem = {
  label: string
  path: string
  icon: LucideIcon
}

type NavSection = {
  title: string
  items: NavItem[]
  adminOnly?: boolean
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Operação',
    items: [
      { label: 'Painel', path: '/panel', icon: LayoutDashboard },
      { label: 'Impressões', path: '/printers', icon: PrinterIcon },
      { label: 'Liberações', path: '/releases', icon: MonitorCheck },
    ],
  },
  {
    title: 'Administração',
    adminOnly: true,
    items: [
      { label: 'Salas', path: '/admin/rooms', icon: DoorOpen },
      { label: 'Computadores', path: '/admin/computers', icon: Computer },
      { label: 'Colaboradores', path: '/admin/employees', icon: Users },
    ],
  },
]

type NavItemsProps = {
  role: Role
}

export function NavItems({ role }: NavItemsProps) {
  const pathname = usePathname()

  function isPathActive(pathname: string, path: string) {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  const sections = NAV_SECTIONS.filter(section => !section.adminOnly || role === 'ADMIN')

  return (
    <>
      {sections.map(section => (
        <SidebarGroup key={section.title} className="not-first:mt-4 p-0">
          <SidebarGroupLabel className="text-[10px] text-sidebar-foreground/50 uppercase tracking-widest">
            {section.title}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {section.items.map(item => {
                const isActive = isPathActive(pathname, item.path)

                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.label}
                      render={<Link href={item.path} aria-current={isActive ? 'page' : undefined} />}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  )
}
