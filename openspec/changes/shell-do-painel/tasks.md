## 1. Layout privado (concluída)

- [x] 1.1 Remover `<html>`, `<body>`, a fonte Space Grotesk e o import de `globals.css` do
      `(private)/layout.tsx`, que duplicavam o layout raiz
- [x] 1.2 Remover o segundo `ClientProviders` do layout privado — dois `<Toaster>` montados fariam cada
      notificação do painel aparecer em duplicidade
- [x] 1.3 Trocar o template de `metadata` herdado por um título de área (`Painel`), deixando o template no
      layout raiz
- [x] 1.4 Montar o shell com `SidebarProvider` + `PanelSidebar` + `SidebarInset`
- [x] 1.5 ~~Barra superior de 48px com marca visível só no mobile~~ e bloco de usuário provisório —
      substituída pela seção 8 (barra superior atravessando o topo, marca sempre visível)
- [x] 1.6 Área de conteúdo com rolagem própria (`flex-1 overflow-auto p-6`)

## 2. Persistência do recolhimento (concluída)

- [x] 2.1 Ler o cookie `sidebar_state` com `cookies()` do `next/headers` no layout privado
- [x] 2.2 Repassar o valor como `defaultOpen` do `SidebarProvider`
- [x] 2.3 Tratar a ausência do cookie como sidebar aberta
- [x] 2.4 Confirmar no build que `/panel` passou a ser servida sob demanda (`ƒ`)

## 3. Sidebar do painel (concluída)

- [x] 3.1 Instalar as primitivas `sidebar`, `sheet`, `tooltip` e `skeleton` e o hook `use-mobile`
- [x] 3.2 Criar `_components/shared/panel-sidebar/index.tsx` com `collapsible="icon"`
- [x] 3.3 ~~Cabeçalho da sidebar com `BrandMark` e nome do produto~~ — a marca migrou para a barra superior
      (10.2); o `SidebarHeader` foi removido
- [x] 3.3.1 Apontar a marca para `/panel` — dentro do painel ela é o atalho para a tela inicial do painel,
      não para a landing
- [x] 3.4 ~~Esconder o texto da marca no modo ícone~~ — sem efeito depois de 3.3; a marca agora vive fora
      da sidebar e permanece visível em qualquer estado
- [x] 3.5 ~~Brilho radial no topo como elemento decorativo com `aria-hidden`~~ — removido: sem a marca
      naquele canto, o brilho não destacava mais nada
- [x] 3.6 Marca d'água com o `BrandMark` no rodapé, suprimida no modo ícone
- [x] 3.7 `SidebarRail` para recolher arrastando a borda

## 4. Itens de navegação (concluída)

- [x] 4.1 Declarar `NAV_SECTIONS` como dado — "Operação" e "Administração"
- [x] 4.2 Item ativo por `usePathname`, casando também as rotas de detalhe (`startsWith(\`${path}/\`)`)
- [x] 4.3 Marcar o item ativo com `aria-current="page"` além do estilo
- [x] 4.4 `tooltip` por item, exibido pela primitiva quando a sidebar está no modo ícone
- [x] 4.5 Renderizar cada item como `Link` pelo prop `render` do base-ui

## 5. Controle de recolher (concluída)

- [x] 5.1 Criar `toggle-sidebar-button.tsx` isolando o `useSidebar()`
- [x] 5.2 Declarar `'use client'` no próprio arquivo, e não depender do importador
- [x] 5.3 Rótulo e `aria-label` derivados do estado ("Abrir painel" / "Fechar painel")
- [x] 5.4 Não tratar o mobile como recolhido — lá a sidebar vira `Sheet`, não faixa de ícones
- [x] 5.5 Remover a classe `justify-left`, que não existe no Tailwind v4 e não gerava CSS algum

## 6. Identidade visual (concluída)

- [x] 6.1 Reescrever os tokens `--sidebar-*` de `:root` para o azul profundo da marca
- [x] 6.2 Reescrever os mesmos tokens em `.dark`
- [x] 6.3 Usar branco translúcido em `--sidebar-accent` em vez de um cinza sólido
- [x] 6.4 Renomear `public/fr.svg` para `public/fr-icon.svg` e atualizar a `metadata` do layout raiz
- [x] 6.5 Adicionar `priority` aos logos de cabeçalho, que são LCP nas suas telas

## 7. Limpeza (concluída)

- [x] 7.1 Remover `/auth/sign-up` — cadastro de funcionário é ação de `ADMIN` no painel
- [x] 7.2 Liberar `github.com` em `images.remotePatterns` para o avatar provisório
- [x] 7.3 Criar `/panel` como placeholder, destino do item ativo da sidebar

## 8. Barra superior atravessando o topo (concluída)

- [x] 8.1 Extrair a barra superior para `_components/shared/panel-header/index.tsx`
- [x] 8.2 Mover a marca do `SidebarHeader` para a barra superior, visível em toda largura de tela
- [x] 8.3 Wrapper do `SidebarProvider` em coluna (`h-svh flex-col overflow-hidden`): header em cima,
      sidebar + conteúdo na linha de baixo
- [x] 8.4 Declarar `--sidebar-offset` na primitiva com padrão `0rem` e posicionar o container em
      `top-(--sidebar-offset)` com `h-[calc(100svh-var(--sidebar-offset))]`
- [x] 8.5 Sobrescrever `--sidebar-offset` no layout privado com a altura do header (`HEADER_HEIGHT`)
- [x] 8.6 Manter o `PanelHeader` dentro do `SidebarProvider` — o gatilho mobile depende do contexto
- [x] 8.7 `SidebarTrigger` com `md:hidden` e `aria-label` próprio: sem ele a navegação era inalcançável
      no toque, já que só o atalho `Ctrl/Cmd+B` abria o `Sheet`
- [x] 8.8 `TooltipProvider` com `delay={0}` no `SidebarProvider` — o padrão de 600ms do base-ui tornava
      inútil o rótulo do modo ícone
- [x] 8.9 Realce da barra superior em branco translúcido: no tema claro `--primary` é o mesmo azul de
      `--sidebar`, e a pílula `bg-primary` sumia dentro do header
- [x] 8.10 Marca da barra superior como `<span>`, não `<h1>` — o `h1` pertence ao conteúdo de cada rota,
      que já declara o seu
- [x] 8.11 Trocar o separador do template de título do layout raiz (`|` → `•`)
- [x] 8.12 Brilho radial no canto da marca, agora na barra superior — o mesmo recurso que 3.5 tirou da
      sidebar, reaplicado onde a marca de fato vive, como `div` decorativa `aria-hidden pointer-events-none`

## 9. Verificação

- [x] 9.1 `pnpm exec tsc --noEmit` sem erros
- [x] 9.2 `pnpm biome check --write` sem issues
- [x] 9.3 `pnpm build` concluído, com `/panel` como `ƒ` e as demais rotas estáticas
- [ ] 9.4 Conferir o recolhimento, a recarga com a sidebar recolhida e o atalho `Ctrl/Cmd+B`
- [ ] 9.5 Conferir a sidebar como `Sheet` abaixo de 768px, aberta pelo gatilho da barra superior
- [ ] 9.6 Conferir contraste dos itens ativo e inativo sobre o azul, nos temas claro e escuro
- [ ] 9.7 Conferir que a sidebar começa exatamente abaixo do header nas duas larguras de coluna
      (expandida e faixa de ícones) e que não há rolagem horizontal

## 10. Próximos passos (fora desta change)

- [ ] 10.1 Guarda de sessão no grupo `(private)` e redirecionamento de não autenticados
- [ ] 10.2 Substituir o bloco de usuário provisório por dados da sessão, retirando `github.com` do
      `next.config.ts`
- [ ] 10.3 **Esconder** a seção "Administração" de `MEMBER` — filtro sobre `NAV_SECTIONS`, não item
      desabilitado
- [ ] 10.4 Criar as cinco rotas que a sidebar já referencia e hoje caem na 404
- [ ] 10.5 Levar o hero da landing e o login para `/panel` depois da autenticação
- [ ] 10.6 `loading.tsx` por área do painel, com o `skeleton` já instalado
- [ ] 10.7 Reconferir `src/components/ui/sidebar.tsx` depois de qualquer `shadcn add` — a primitiva carrega
      três alterações locais que o comando sobrescreve
