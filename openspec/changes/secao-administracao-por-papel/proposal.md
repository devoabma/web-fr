## Why

A sidebar oferecia a seção "Administração" — Salas, Computadores, Funcionários — a **todo mundo**. Um
`MEMBER` via os três itens, clicava, e o `proxy.ts` o devolvia ao painel. O corte de acesso já existia
desde a change `sessao-e-guarda-de-rotas`; o que faltava era o corte de **visibilidade**. Menu que oferece
o que não se pode fazer não é segurança quebrada, é interface mentindo: o funcionário aprende que aquele
clique não leva a lugar nenhum e passa a desconfiar do resto do menu.

A lacuna estava registrada como item 8.4 da change `menu-do-usuario-e-logout` e como pendente da seção 3 do
roadmap, com a ressalva explícita de que a solução é **filtrar** a seção, não desabilitar itens — item
desabilitado continua anunciando a existência de uma área que aquele papel nunca vai alcançar.

Junto veio um defeito de título de aba: o `(private)/layout.tsx` declarava `metadata.title = 'Painel'` para
o **grupo inteiro**. Toda rota privada nova nasceria com o título errado até se lembrar de sobrescrevê-lo —
o título é da tela, não da moldura.

## What Changes

- **Papel lido no servidor** (`(private)/layout.tsx`): o layout já abria o cookie da sessão para o
  `defaultOpen` da sidebar; passa a abrir também o `@fr-auth-token` com o `readSession` e a derivar o
  `role`. Sem sessão legível, assume `MEMBER` — o menor privilégio.
- **Seção marcada como restrita** (`nav-items.tsx`): `NavSection` ganha `adminOnly?: boolean`, e o grupo
  "Administração" o declara. A filtragem é um `filter` sobre `NAV_SECTIONS`, mantendo a navegação como
  dado.
- **`role` desce por prop** do layout até o `NavItems`, atravessando o `PanelSidebar`.
- **Título da aba movido** do `(private)/layout.tsx` para `(private)/panel/page.tsx` — cada rota do grupo
  passa a declarar o próprio título, sob o mesmo template do layout raiz.
- **`Minha conta` → `Minha Conta`** em `/profile`, alinhando com o rótulo usado no menu do usuário.

## Capabilities

### Modified Capabilities
- `navegacao-do-painel`: a navegação lateral deixa de ser a mesma para todos e passa a apresentar apenas as
  áreas alcançáveis pelo papel da sessão; o título da aba deixa de ser herdado do grupo privado e passa a
  ser declarado por rota.

## Impact

- Alterado: `src/app/(private)/layout.tsx`,
  `src/app/(private)/_components/shared/panel-sidebar/index.tsx`,
  `src/app/(private)/_components/shared/panel-sidebar/nav-items.tsx`,
  `src/app/(private)/panel/page.tsx`, `src/app/(private)/profile/page.tsx`.
- **Esconder não é autorizar.** O filtro é de apresentação. Quem autoriza é a `api-fr`, que valida a
  assinatura do token a cada requisição; o `proxy.ts` é uma segunda camada otimista. Um `MEMBER` que digite
  `/admin/rooms` na barra de endereços continua sendo barrado pelo proxy, não pela sidebar.
- **O `role` vem do cookie, não do `GET /employees/profile`.** Ler do perfil significaria pintar a sidebar
  sem a seção, esperar a resposta e fazê-la aparecer — a seção piscaria na tela de quem tem direito a ela,
  e pior, poderia piscar na de quem não tem, dependendo da ordem de renderização. Do cookie, o HTML já sai
  correto do servidor.
- **Papel novo na `api-fr` exige revisão aqui.** Hoje `ROLES` tem dois valores e `adminOnly` compara com
  `'ADMIN'`. Um terceiro papel não quebra o build, mas cai no ramo restrito por omissão — que é o lado
  seguro, e não o lado certo.
- Seção sem `adminOnly` continua visível para todos; a marcação é **opt-in**, então uma seção
  administrativa nova precisa declará-la ou vazará para o `MEMBER`.
- As cinco áreas que a sidebar referencia continuam caindo na 404 — esta change não as cria.
