## 1. Layout privado (concluída)

- [x] 1.1 Remover `<html>`, `<body>`, a fonte Space Grotesk e o import de `globals.css` do
      `(private)/layout.tsx`, que duplicavam o layout raiz
- [x] 1.2 Remover o segundo `ClientProviders` do layout privado — dois `<Toaster>` montados fariam cada
      notificação do painel aparecer em duplicidade
- [x] 1.3 Trocar o template de `metadata` herdado por um título de área (`Painel`), deixando o template no
      layout raiz
- [x] 1.4 Montar o shell com `SidebarProvider` + `PanelSidebar` + `SidebarInset`
- [x] 1.5 Barra superior de 48px com marca visível só no mobile e bloco de usuário provisório
- [x] 1.6 Área de conteúdo com rolagem própria (`flex-1 overflow-auto p-6`)

## 2. Persistência do recolhimento (concluída)

- [x] 2.1 Ler o cookie `sidebar_state` com `cookies()` do `next/headers` no layout privado
- [x] 2.2 Repassar o valor como `defaultOpen` do `SidebarProvider`
- [x] 2.3 Tratar a ausência do cookie como sidebar aberta
- [x] 2.4 Confirmar no build que `/panel` passou a ser servida sob demanda (`ƒ`)

## 3. Sidebar do painel (concluída)

- [x] 3.1 Instalar as primitivas `sidebar`, `sheet`, `tooltip` e `skeleton` e o hook `use-mobile`
- [x] 3.2 Criar `_components/shared/panel-sidebar/index.tsx` com `collapsible="icon"`
- [x] 3.3 Cabeçalho da sidebar alinhado à altura da barra superior (48px), com `BrandMark` e nome do produto
- [x] 3.3.1 Apontar a marca para `/panel` — dentro do painel ela é o atalho para a tela inicial do painel,
      não para a landing
- [x] 3.4 Esconder o texto da marca no modo ícone (`group-data-[collapsible=icon]:hidden`)
- [x] 3.5 Brilho radial no topo como elemento decorativo com `aria-hidden`
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

## 8. Verificação

- [x] 8.1 `pnpm exec tsc --noEmit` sem erros
- [x] 8.2 `pnpm biome check --write` sem issues
- [x] 8.3 `pnpm build` concluído, com `/panel` como `ƒ` e as demais rotas estáticas
- [ ] 8.4 Conferir o recolhimento, a recarga com a sidebar recolhida e o atalho `Ctrl/Cmd+B`
- [ ] 8.5 Conferir a sidebar como `Sheet` abaixo de 768px
- [ ] 8.6 Conferir contraste dos itens ativo e inativo sobre o azul, nos temas claro e escuro

## 9. Próximos passos (fora desta change)

- [ ] 9.1 Guarda de sessão no grupo `(private)` e redirecionamento de não autenticados
- [ ] 9.2 Substituir o bloco de usuário provisório por dados da sessão, retirando `github.com` do
      `next.config.ts`
- [ ] 9.3 **Esconder** a seção "Administração" de `MEMBER` — filtro sobre `NAV_SECTIONS`, não item desabilitado
- [ ] 9.4 Criar as cinco rotas que a sidebar já referencia e hoje caem na 404
- [ ] 9.5 Levar o hero da landing e o login para `/panel` depois da autenticação
- [ ] 9.6 `loading.tsx` por área do painel, com o `skeleton` já instalado
