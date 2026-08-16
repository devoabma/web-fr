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

### Sidebar como superfície de marca

Os tokens `--sidebar-*` que o shadcn instala são derivados do cinza neutro. Foram reescritos para o azul
profundo do produto (`oklch(0.254 0.057 266.709)` no claro, um tom mais escuro no escuro), com
`--sidebar-accent` em branco translúcido (`oklch(1 0 0 / 12%)`) em vez de um cinza sólido — assim o realce
do item ativo funciona sobre o azul sem precisar de um segundo tom calibrado à mão.

A profundidade vem de dois elementos decorativos com `aria-hidden`: um brilho radial no topo e o
`BrandMark` como marca d'água no rodapé, em `text-white/4`. A marca d'água some no modo ícone — numa faixa
de 3rem ela vira ruído em vez de textura.

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

### Barra superior com bloco de usuário provisório

O bloco com foto, nome e status é literal — nome fixo e avatar vindo de `github.com`, o que obrigou a
liberar o host em `images.remotePatterns`. Está marcado com comentário no código como pendência. É
andaime deliberado: dá a medida visual da barra antes da sessão existir.

### `/auth/sign-up` removida em vez de mantida como placeholder

A criação de funcionário é `POST /employees/create-account`, ação restrita a `ADMIN` e feita de dentro do
painel. Não existe auto-cadastro no produto. A rota placeholder herdada sugeria um fluxo que nunca vai
existir, e apareceria em qualquer varredura de rotas como trabalho pendente.

### A marca da sidebar aponta para `/panel`, não para `/`

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

## Migration Plan

Não há migração de dados nem de URL. O `(private)/layout.tsx` foi reescrito no lugar, e nenhuma rota
pública mudou de endereço. A remoção de `/auth/sign-up` não quebra links: nada apontava para ela.

O cookie `sidebar_state` é criado na primeira interação; sua ausência é tratada como sidebar aberta.

## Open Questions

- A barra superior precisa de breadcrumb, ou o título da área dentro de cada página basta? Só dá para
  responder quando existirem telas de detalhe — hoje a navegação tem um nível só.
