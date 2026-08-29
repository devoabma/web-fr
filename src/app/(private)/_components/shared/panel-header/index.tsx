import { SidebarTrigger } from '@/components/ui/sidebar'
import { PanelBrand } from './panel-brand'
import { PanelStatus } from './panel-status'
import { PanelUser } from './panel-user'

export function PanelHeader() {
  return (
    // Sem borda inferior: o fundo do painel agora é a mesma cor do header, e a linha viraria um risco
    // atravessando a tela. Quem separa o header do conteúdo é o respiro da ilha.
    <header className="relative z-20 flex h-12 w-full shrink-0 items-center justify-between gap-4 bg-sidebar pr-4 pl-2 text-sidebar-foreground md:pl-0">
      <div className="relative flex items-center gap-2">
        {/* Só no mobile: a sidebar vira painel sobreposto e sem este gatilho não há como abri-la. */}
        <SidebarTrigger
          aria-label="Abrir menu de navegação"
          className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground md:hidden"
        />

        {/* No desktop a marca é quem paga o recuo da esquerda (daí o `md:pl-0` do header): ela ocupa a
            coluna inteira da sidebar e precisa medir a partir da borda da tela. */}
        <PanelBrand />
      </div>

      <div className="relative flex items-center gap-3">
        <PanelStatus />

        <PanelUser />
      </div>
    </header>
  )
}
