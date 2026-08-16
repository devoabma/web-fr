## Why

O grupo `(private)` existia desde a change da tela de login, mas **sem nenhuma rota dentro dele**. Toda a
navegação do painel — as seis áreas já mapeadas no roadmap (painel de sala, impressões, liberações, salas,
computadores, colaboradores) — não tinha onde morar. Antes de integrar qualquer endpoint da `api-fr` é
preciso existir a moldura que hospeda as telas.

Havia também um defeito latente esperando a primeira rota privada: `src/app/(private)/layout.tsx` era uma
**cópia do layout raiz** — declarava `<html>`, `<body>`, a fonte Space Grotesk, o import de `globals.css`,
o template de `metadata` e o `ClientProviders`. Como `src/app/layout.tsx` já é o layout raiz, o layout do
grupo é um layout **aninhado**: ele renderizaria um segundo documento HTML dentro do `<body>` do primeiro,
com a fonte carregada duas vezes e dois `<Toaster>` montados. O bug nunca apareceu porque nenhuma rota
`(private)` era alcançável. A primeira rota do painel o tornaria visível.

## What Changes

- **`src/app/(private)/layout.tsx` deixa de ser um documento HTML** e passa a ser o shell do painel:
  sidebar + barra superior + área de conteúdo. `<html>`, `<body>`, fonte, `globals.css` e `ClientProviders`
  ficam só no layout raiz.
- **`PanelSidebar`** (`_components/shared/panel-sidebar/`): navegação lateral colapsável para faixa de
  ícones, em três arquivos — a casca (`index.tsx`), os itens (`nav-items.tsx`) e o controle de recolher
  (`toggle-sidebar-button.tsx`).
- **Navegação em duas seções** — "Operação" (Painel, Impressões, Liberações) e "Administração" (Salas,
  Computadores, Colaboradores) — com item ativo derivado do `usePathname`.
- **Estado da sidebar preservado entre recargas**: o layout lê o cookie `sidebar_state` no servidor e o
  entrega como `defaultOpen`.
- **Tokens `--sidebar-*` reescritos** em `globals.css` para o azul profundo da marca, nas variantes clara e
  escura — a sidebar deixa de ser cinza neutra e passa a ser superfície de marca.
- **`/panel`**: primeira rota privada, ainda um placeholder, servindo de destino para o item ativo.
- **Primitivas shadcn adicionadas**: `sidebar`, `sheet`, `tooltip`, `skeleton` e o hook `use-mobile`.
- **`/auth/sign-up` removida**: cadastro de funcionário é ação de `ADMIN` dentro do painel, nunca
  auto-cadastro público. A rota placeholder só criava expectativa de um fluxo que não vai existir.
- **Favicon renomeado** `public/fr.svg` → `public/fr-icon.svg`, evitando confusão com o `logo.svg`.
- **`next.config.ts`**: `images.remotePatterns` liberando `github.com` para o avatar provisório da barra
  superior.
- **`priority` nos logos** de cabeçalho, que são LCP nas suas telas.

## Capabilities

### New Capabilities
- `navegacao-do-painel`: Moldura do painel autenticado — navegação lateral entre as áreas, preservação do
  estado de recolhimento e adaptação a telas estreitas.

### Modified Capabilities
<!-- Nenhuma capability existente tem requisitos alterados. -->

## Impact

- Código novo: `src/app/(private)/panel/page.tsx`, `src/app/(private)/_components/shared/panel-sidebar/*`,
  `src/components/ui/{sidebar,sheet,tooltip,skeleton}.tsx`, `src/hooks/use-mobile.ts`, `public/fr-icon.svg`.
- Alterado: `src/app/(private)/layout.tsx` (reescrito), `src/app/layout.tsx` (favicon),
  `src/styles/globals.css` (tokens `--sidebar-*`), `src/components/app/header.tsx` (`priority`),
  `next.config.ts`.
- Removido: `src/app/(public)/auth/sign-up/page.tsx`, `public/fr.svg`.
- **`/panel` é servida sob demanda (`ƒ`), não pré-renderizada.** Ler o cookie da sidebar torna a rota
  dinâmica. É o custo de honrar a preferência do usuário, e não representa perda real: toda rota privada
  vai depender da sessão quando a autenticação existir.
- **Nada aponta para `/panel` ainda.** O hero da landing e a tela de login continuam levando a
  `/auth/sign-in`; o painel só é alcançável digitando o endereço.
- **O painel não tem guarda de sessão.** `/panel` responde a qualquer visitante. A proteção é item da
  change de autenticação, não desta.
