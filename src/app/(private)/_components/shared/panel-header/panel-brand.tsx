'use client'

import Link from 'next/link'
import { BrandMark } from '@/components/app/brand-mark'
import { useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

export function PanelBrand() {
  const { state, isMobile } = useSidebar()

  const isCollapsed = !isMobile && state === 'collapsed'

  return (
    <Link
      href="/panel"
      className={cn(
        'flex items-center gap-2.5 md:pl-4 md:transition-[width] md:duration-200 md:ease-linear',
        isCollapsed ? 'md:w-16' : 'md:w-(--sidebar-width)'
      )}
    >
      <BrandMark className="size-8 shrink-0 text-white" />

      <div className={cn('flex min-w-0 flex-col leading-tight', isCollapsed && 'md:hidden')}>
        <span className="truncate font-bold text-sm text-white tracking-tight sm:text-base">Sala Livre</span>

        <span className="truncate text-[10px] text-sidebar-foreground/55 uppercase tracking-widest">Gestão de Salas</span>
      </div>
    </Link>
  )
}
