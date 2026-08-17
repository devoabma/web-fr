## Context

O painel tem seis áreas já mapeadas no roadmap e nenhuma construída. A ordem importa: construir a moldura
primeiro deixa cada tela seguinte ser só conteúdo, e força as decisões de navegação a serem tomadas uma vez
em vez de renegociadas a cada rota nova.

A sidebar do shadcn é composta por muitas peças (`SidebarProvider`, `Sidebar`, `SidebarInset`,
`SidebarMenuButton`, `SidebarRail`, além de `Sheet` e `Tooltip` como dependências). Ela chega genérica e
cinza; o trabalho desta change é encaixá-la na identidade do produto e no vocabulário do domínio.

## Goals / Non-Goals

**Goals:**
- Moldura estável para todas as telas do painel, com as áreas do roadmap já nomeadas.
- Sidebar como superfície de marca — azul profundo do produto, não cinza neutra.
- Preferência de recolhimento respeitada entre recargas.
- Layout privado como Server Component; `'use client'` restrito ao que depende de rota, estado ou browser.

**Non-Goals:**
- Guarda de sessão e redirecionamento de não autenticados — change de autenticação.
- Conteúdo real de `/panel` e das demais áreas.
- Menu do usuário logado (a barra superior traz um bloco fixo, marcado com comentário no código).
- Breadcrumbs e `loading.tsx` por área.

## Decisions

### Layout privado deixa de duplicar o documento HTML

O `(private)/layout.tsx` herdado da change de login declarava `<html>`/`<body>`, a fonte, o `globals.css` e
o `ClientProviders` — tudo que o layout raiz já declara. Em App Router, só o layout de `app/` é raiz; um
layout de grupo de rota é aninhado. O resultado seria um documento dentro do outro: fonte baixada duas
vezes, `globals.css` injetado duas vezes e **dois `<Toaster>` do sonner montados**, fazendo cada
notificação aparecer em duplicidade dentro do painel.

Nada disso jamais apareceu porque `(private)` não tinha rota. `/panel` é a primeira, então a correção vem
junto: o layout privado agora começa direto no `SidebarProvider` e só o layout raiz monta o documento.

### `defaultOpen` lido do cookie no servidor

O `SidebarProvider` **grava** `sidebar_state` no `document.cookie` a cada toggle, mas não lê nada — o
estado inicial vem do prop `defaultOpen`, que tem padrão `true`. Sem alguém ler o cookie, a persistência é
só escrita: o usuário recolhe a sidebar, recarrega, ela volta aberta. O cookie existiria sem função.

Como o layout privado é Server Component, `cookies()` do `next/headers` resolve isso na renderização, sem
flash de estado errado — que é justamente o que uma leitura no cliente causaria: a sidebar pintaria aberta
e saltaria para recolhida depois da hidratação.

O custo é a rota virar dinâmica (`ƒ`). Aceitável: o painel exige sessão e nunca poderia ser estático de
qualquer forma.

### Barra superior atravessa o topo; a sidebar começa abaixo dela

O arranjo padrão do shadcn é sidebar à esquerda em altura total, com a barra superior dentro do
`SidebarInset` — ou seja, começando só depois da sidebar. Isso partia a identidade do produto em duas
colunas: marca no topo da sidebar, bloco de usuário no topo do conteúdo, cada um com sua altura para
alinhar à mão. O painel passou ao arranjo em "T": **a barra superior atravessa a largura inteira e a
navegação lateral começa abaixo dela**.

Duas consequências mecânicas:

- O wrapper do `SidebarProvider` vira coluna (`h-svh flex-col overflow-hidden`) — header em cima, a linha
  sidebar + conteúdo embaixo. O header precisa morar **dentro** do provider porque o gatilho mobile depende
  do contexto da sidebar.
- O container da sidebar é `fixed`, então ele ignora o fluxo e passaria por baixo do header. Daí a variável
  `--sidebar-offset`: a primitiva a declara com `0rem` (arranjo padrão preservado para qualquer outro uso) e
  o layout do painel a sobrescreve com a altura do header. A sidebar então começa em
  `top-(--sidebar-offset)` e mede `calc(100svh - var(--sidebar-offset))`.

A marca sai do `SidebarHeader` e vai para a barra superior, onde fica visível **em toda largura de tela** —
inclusive com a sidebar recolhida à faixa de ícones, situação em que antes o nome do produto sumia. Com a
marca fora da sidebar, o brilho radial do topo perdeu a função (não havia mais o que destacar naquele canto)
e foi removido.

### Sidebar como superfície de marca

Os tokens `--sidebar-*` que o shadcn instala são derivados do cinza neutro. Foram reescritos para o azul
profundo do produto (`oklch(0.254 0.057 266.709)` no claro, um tom mais escuro no escuro), com
`--sidebar-accent` em branco translúcido (`oklch(1 0 0 / 12%)`) em vez de um cinza sólido — assim o realce
do item ativo funciona sobre o azul sem precisar de um segundo tom calibrado à mão.

A barra superior usa `bg-sidebar`/`text-sidebar-foreground`, e não os tokens de fundo do documento: no
arranjo em "T" ela e a sidebar formam uma superfície contínua de marca em volta do conteúdo.

Realces sobre essa superfície usam **branco translúcido**, nunca `bg-primary`. No tema claro `--primary` e
`--sidebar` são literalmente o mesmo azul, então uma pílula `bg-primary` desaparece dentro do header; no
tema escuro ela apareceria. O branco translúcido é a mesma regra já aplicada em `--sidebar-accent` e se
comporta igual nos dois temas.

A profundidade vem do `BrandMark` como marca d'água no rodapé da sidebar, com `aria-hidden`, em
`text-white/4`. A marca d'água some no modo ícone — numa faixa de 3rem ela vira ruído em vez de textura.

### Navegação declarada como dado, não como marcação

`NAV_SECTIONS` é um array de seções com `{ label, path, icon }`. Acrescentar uma área é acrescentar uma
linha, e a estrutura já antecipa o corte por papel (`ADMIN` vs `MEMBER`): quando a sessão existir, a seção
"Administração" será filtrada, não removida do JSX.

O item ativo usa `pathname === path || pathname.startsWith(`${path}/`)`, para que uma rota de detalhe
(`/admin/rooms/42`) mantenha "Salas" destacado.

### Recolher isolado no menor componente possível

`ToggleSidebarButton` existe porque `useSidebar()` só funciona dentro do provider e exige cliente. Isolá-lo
mantém o rótulo do botão ("Abrir painel" / "Fechar painel") e o `tooltip` derivados do estado real, sem
puxar o resto do rodapé para o cliente.

O componente declara `'use client'` por conta própria, embora hoje só seja importado por um componente que
já é cliente. A diretiva é o que garante que ele continue correto se um Server Component vier a importá-lo.

### Gatilho de abertura no mobile, e não só o atalho de teclado

Abaixo de 768px a sidebar vira `Sheet` e só abre por comando explícito. Enquanto a barra superior não tinha
gatilho, o único caminho era `Ctrl/Cmd+B` — inexistente no toque, que é justamente o contexto dessas
larguras: **a navegação do painel era inalcançável no celular**. O `SidebarTrigger` na barra superior fecha
isso, com `md:hidden` porque no desktop a sidebar já ocupa largura permanente e tem o rail e o botão do
rodapé.

O gatilho carrega `aria-label` próprio ("Abrir menu de navegação"), que vence o rótulo genérico da
primitiva.

### A marca da barra superior não é o `h1` da página

A marca estava marcada como `<h1>` desde a versão na sidebar. Como ela é parte da moldura, isso daria a
**toda** tela do painel um cabeçalho de nível 1 dizendo "Sala Livre" antes do cabeçalho real da rota — dois
`h1` por documento, e o primeiro sem relação com o conteúdo. Na barra superior a marca é identidade do
produto, não título; virou `<span>`. O `h1` pertence a cada `page.tsx`.

### `TooltipProvider` no topo do `SidebarProvider`

Sem provider, cada `Tooltip` do base-ui usa o atraso padrão de 600ms. No modo de faixa de ícones o tooltip é
o **único** rótulo do item: 600ms de espera transformam a navegação recolhida em adivinhação. O provider
entra na própria primitiva da sidebar, com `delay={0}`, para valer em qualquer consumidor dela.

### Barra superior com bloco de usuário provisório

O bloco com foto, nome e status é literal — nome fixo e avatar vindo de `github.com`, o que obrigou a
liberar o host em `images.remotePatterns`. Está marcado com comentário no código como pendência. É
andaime deliberado: dá a medida visual da barra antes da sessão existir.

### `/auth/sign-up` removida em vez de mantida como placeholder

A criação de funcionário é `POST /employees/create-account`, ação restrita a `ADMIN` e feita de dentro do
painel. Não existe auto-cadastro no produto. A rota placeholder herdada sugeria um fluxo que nunca vai
existir, e apareceria em qualquer varredura de rotas como trabalho pendente.

### A marca da barra superior aponta para `/panel`, não para `/`

Dentro de um painel a marca é o atalho para a tela inicial **do painel**. Apontar para `/` era o reflexo da
landing e tirava o usuário da área autenticada por um clique em algo que parece um "início" — e a landing
não tem nada a oferecer a quem já entrou. A saída para fora do produto é o logout, uma ação explícita, não
um efeito colateral da marca.

### "Administração" será escondida de `MEMBER`, não desabilitada

A regra já está escrita na integração: as listagens usam rota única por papel e "o front deve **esconder
ações**, não duplicar rotas". Um item desabilitado anuncia uma capacidade que o `MEMBER` nunca vai ter —
gera pergunta a quem dá suporte e sugere que falta permissão a conceder, quando na verdade o papel é outro.
Como `NAV_SECTIONS` é dado, o corte é um filtro sobre o array, não uma alteração no JSX.

### `/panel` é o nome definitivo

As URLs do produto ficam em **inglês** (`/auth/sign-in`, `/panel`, `/admin/rooms`); o texto de interface
fica em **português**. O `/painel` do roadmap era descrição informal escrita antes da rota existir, não uma
decisão — foi corrigido lá. Misturar os dois idiomas nos endereços obrigaria a decidir caso a caso em cada
rota nova ("/impressoes" ou "/printers"?), e renomear depois custa redirecionamentos.

## Risks / Trade-offs

- **`/panel` sai do pré-render.** A leitura do cookie torna a rota dinâmica. A alternativa — não persistir
  o recolhimento — troca a preferência do usuário por uma otimização que a autenticação anularia depois.
- **Painel sem guarda de sessão.** `/panel` responde a qualquer visitante e a sidebar expõe o mapa completo
  das áreas administrativas. Não vaza dado (as telas estão vazias), mas revela a estrutura do produto até a
  proteção existir.
- **Cinco das seis rotas da sidebar não existem.** Clicar em "Impressões", "Liberações", "Salas",
  "Computadores" ou "Colaboradores" cai na 404. É navegação declarada antes das telas, deliberadamente.
- **Nome de usuário e avatar fixos em produção** se a change seguinte não os substituir.
- **Não há caminho de volta à landing de dentro do painel.** Com a marca apontando para `/panel`, sair do
  produto depende do logout, que ainda não existe.
- **Tokens `--sidebar-*` divergiram do padrão shadcn.** Um `shadcn add` futuro que reinstale os tokens
  desfaz a identidade; a alteração vive em `globals.css` e precisa ser reconferida em atualizações.
- **`src/components/ui/sidebar.tsx` foi editada, não só consumida.** O `--sidebar-offset`, o
  `TooltipProvider` e o posicionamento `top/bottom` do container são alterações na primitiva. Um
  `shadcn add sidebar` sobrescreve as três e o header volta a cobrir a sidebar. A escolha foi deliberada:
  o alternativo — reposicionar a sidebar por fora, com CSS de escape sobre `[data-slot=sidebar-container]` —
  seria mais frágil e menos legível que uma variável com padrão neutro.
- **A altura do header vive em dois lugares.** `h-12` no `PanelHeader` e a constante `HEADER_HEIGHT` no
  layout, que alimenta `--sidebar-offset`. Mudar um sem o outro descola a sidebar do header.

## Migration Plan

Não há migração de dados nem de URL. O `(private)/layout.tsx` foi reescrito no lugar, e nenhuma rota
pública mudou de endereço. A remoção de `/auth/sign-up` não quebra links: nada apontava para ela.

O cookie `sidebar_state` é criado na primeira interação; sua ausência é tratada como sidebar aberta.

## Open Questions

- A barra superior precisa de breadcrumb, ou o título da área dentro de cada página basta? Só dá para
  responder quando existirem telas de detalhe — hoje a navegação tem um nível só.
