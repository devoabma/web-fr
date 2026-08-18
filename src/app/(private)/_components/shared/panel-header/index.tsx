import Link from 'next/link'
import { BrandMark } from '@/components/app/brand-mark'
import { Badge } from '@/components/ui/badge'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { PanelUser } from './panel-user'

export function PanelHeader() {
  return (
    <header className="relative z-20 flex h-12 w-full shrink-0 items-center justify-between gap-4 border-sidebar-border border-b bg-sidebar pr-4 pl-2 text-sidebar-foreground">
      <div className="relative flex items-center gap-2">
        {/* Só no mobile: a sidebar vira sheet e sem este gatilho não há como abri-la. */}
        <SidebarTrigger
          aria-label="Abrir menu de navegação"
          className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground md:hidden"
        />

        <Link href="/panel" className="flex items-center gap-2.5">
          <BrandMark className="size-8 shrink-0 text-white" />

          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate font-bold text-sm text-white tracking-tight sm:text-base">Sala Livre</span>
            <span className="truncate text-[10px] text-sidebar-foreground/55 uppercase tracking-widest">Gestão de Salas</span>
          </div>
        </Link>
      </div>

      <div className="relative flex items-center gap-3">
        <Badge className="border-white/15 bg-white/10 text-sidebar-foreground">
          <span className="size-1.5 min-w-1.5 animate-pulse rounded-full bg-emerald-400" />
          All OK
        </Badge>

        <PanelUser />
      </div>
    </header>
  )
}
