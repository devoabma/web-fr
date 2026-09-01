'use client'

import {
  ChartColumn,
  Computer,
  DoorOpen,
  Download,
  FileText,
  LayoutDashboard,
  type LucideIcon,
  MonitorCheck,
  PrinterIcon,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
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
      { label: 'Métricas', path: '/metrics', icon: ChartColumn },
      { label: 'Downloads', path: '/downloads', icon: Download },
    ],
  },
  {
    title: 'Administração',
    adminOnly: true,
    items: [
      { label: 'Salas', path: '/admin/rooms', icon: DoorOpen },
      { label: 'Computadores', path: '/admin/computers', icon: Computer },
      { label: 'Colaboradores', path: '/admin/employees', icon: Users },
      { label: 'Relatórios', path: '/admin/reports', icon: FileText },
    ],
  },
]

type NavItemsProps = {
  role: Role
}

export function NavItems({ role }: NavItemsProps) {
  const pathname = usePathname()

  const { isMobile, setOpenMobile } = useSidebar()

  function isPathActive(pathname: string, path: string) {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  /**
   * No mobile o sidebar não empurra o conteúdo: ele é um painel sobreposto. Navegar sem fechá-lo deixaria
   * a página escolhida atrás do próprio menu, e o usuário teria de fechá-lo à mão para ver o que pediu.
   *
   * No desktop ele fica ao lado do conteúdo, então continua aberto — fechá-lo ali seria perder o menu a
   * cada clique.
   */
  function handleNavigate() {
    if (isMobile) setOpenMobile(false)
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
                      render={<Link href={item.path} aria-current={isActive ? 'page' : undefined} onClick={handleNavigate} />}
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
