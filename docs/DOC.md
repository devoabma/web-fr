# 📚 Sala Livre — Front Web (`web-fr`)

> Painel web dos funcionários e administradores da **Sala Livre**, plataforma de gestão dos
> escritórios compartilhados e salas de fórum da **OAB Maranhão**.

---

## 🧩 Onde este projeto se encaixa

A `api-fr` é o backend central, consumido por três clientes:

| Cliente | Repositório | Papel |
| --- | --- | --- |
| **App Desktop** | `desktop-fr` | Roda nas máquinas das salas. Login do advogado por CPF/OAB/nascimento, liberação da máquina, controle de sessão e envio de arquivos para impressão. Mantém canal WebSocket com a API. |
| **Front Web** | `web-fr` (este) | Painel dos funcionários e do ADM: gestão de salas, computadores, funcionários, fila de impressão e relatórios. |
| **App Mobile** | `app-fr` | — |

A documentação de domínio (regras de negócio, fluxos, banco) é mantida na API:
[`api-fr/docs/DOC.md`](../../api-fr/docs/DOC.md) · [`api-fr/docs/DATABASE.md`](../../api-fr/docs/DATABASE.md) · [`api-fr/docs/ROADMAP.md`](../../api-fr/docs/ROADMAP.md)

---

## 🛠️ Stack

- **Next.js 16.3** (App Router, Turbopack)
- **React 19.2** com `babel-plugin-react-compiler`
- **Tailwind CSS v4** — tokens em `oklch`, sem arquivo de config
- **shadcn** no estilo `base-nova`, sobre **`@base-ui/react`**
- **lucide-react** (ícones) · **sonner** (notificações)
- **React Hook Form + Zod** (`@hookform/resolvers`) — formulários e validação
- **axios** — cliente HTTP da `api-fr` (adicionado; ainda sem uso)
- **Biome 2.4** (lint + format) · **pnpm**

```bash
pnpm dev      # servidor de desenvolvimento
pnpm build    # build de produção
pnpm lint     # biome check
pnpm format   # biome format --write
```

Verificação antes de fechar qualquer incremento:

```bash
pnpm exec tsc --noEmit
pnpm biome check --write
pnpm build
```

> Não há script `typecheck` no `package.json` — usar `pnpm exec tsc --noEmit`.

---

## 📁 Estrutura de pastas

```
src/
├── app/
│   ├── layout.tsx                 # ÚNICO documento HTML: fonte, globals.css, metadata, providers
│   ├── page.tsx                   # composição da landing
│   ├── not-found.tsx              # 404 do produto
│   ├── (public)/                  # rotas sem sessão
│   │   └── auth/
│   │       ├── layout.tsx         # split: painel de marca + área de formulário
│   │       └── sign-in/           # login (page + _components)
│   └── (private)/                 # painel autenticado
│       ├── layout.tsx             # shell: barra superior + sidebar + área de conteúdo
│       ├── panel/                 # /panel — placeholder
│       └── _components/shared/
│           ├── client-providers.tsx
│           ├── panel-header/      # barra superior: marca, gatilho mobile e bloco de usuário
│           └── panel-sidebar/     # casca, itens de navegação e controle de recolher
├── components/
│   ├── app/                       # uma seção/feature por arquivo
│   └── ui/                        # primitivas shadcn/base-ui
├── hooks/use-mobile.ts            # breakpoint de 768px, usado pela sidebar
├── styles/globals.css             # tokens do tema (:root e .dark)
├── utils/
│   ├── masks/                     # máscaras de entrada (CPF)
│   └── schemas/                   # schemas Zod reutilizáveis (CPF)
└── lib/utils.ts                   # cn() — clsx + tailwind-merge
```

**Convenções:**

- Um arquivo por seção em `src/components/app/`, kebab-case, **export nomeado**.
- Componentes de uma rota específica ficam em `_components/` dentro da própria rota.
- Grupos de rota: `(public)` para o que não exige sessão, `(private)` para o painel. Parênteses não entram na URL.
- **URLs em inglês, interface em português** — `/panel`, `/auth/sign-in`, `/admin/rooms`; os rótulos que o
  usuário lê são "Painel", "Salas". Decidir o idioma por rota custa renomeação e redirecionamento depois.
- **Só `src/app/layout.tsx` declara `<html>`, `<body>`, a fonte e o `globals.css`.** Layout de grupo de rota
  é layout aninhado: redeclarar o documento renderiza um HTML dentro do outro e duplica os providers — dois
  `<Toaster>` montados fazem cada notificação aparecer duas vezes.
- Server Components por padrão. `'use client'` só onde há estado, evento ou API de browser — e isolado no
  menor componente possível (ex.: `back-button.tsx`, `toggle-sidebar-button.tsx`), para a página continuar
  estática. A diretiva vai **no próprio arquivo** que precisa dela, não herdada do importador.
- Cores sempre por **token do tema** (`text-primary`, `text-muted-foreground`, `bg-card`, `border`) — nunca hex.
- Escala numérica do Tailwind v4 (`max-w-310`, `pt-18.5`) em vez de valores arbitrários quando possível.
- `cn()` para classes condicionais.
- Validação com Zod; o que for reaproveitável entre telas mora em `src/utils/schemas/`.

**Formatação (`biome.json`):** aspas simples no TS, duplas no JSX, **sem ponto e vírgula**, largura 130,
`arrowParentheses: asNeeded`, trailing comma `es5`. `organizeImports` e `useSortedClasses` são **erro** —
sempre rodar `pnpm biome check --write` depois de editar JSX.

---

## 🔌 Integração com a `api-fr`

**Base URL:** `https://api-fr.oabma.org.br` em produção. Docs vivas em `/docs` (Scalar), healthcheck em `/health`.

### Autenticação

`POST /employees/session/auth` com `{ cpf, password }` responde `200 { token }` **e** define um cookie
`httpOnly` (`TOKEN_COOKIE_NAME`, padrão `@my-token`), válido por 1 dia. O JWT carrega `{ sub, role }`.

> ⚠️ **A API está com `CORS origin: '*'`.** Com origem curinga o navegador não envia cookie credenciado,
> então enquanto isso não for restringido ao `WEB_URL` este front precisa enviar
> `Authorization: Bearer <token>` explicitamente.

### Papéis

`ADMIN` e `MEMBER` (padrão). As listagens usam **rota única por papel** — a mesma URL devolve escopo
diferente conforme o `role`. O front deve **esconder ações**, não duplicar rotas.

| Área | ADMIN | MEMBER |
| --- | --- | --- |
| Inventário (criar/editar/excluir sala, computador, funcionário; vincular a salas) | ✅ | ❌ |
| Operação (colocar/retirar de manutenção) | qualquer máquina | apenas nas salas vinculadas |
| Listagens | tudo, inclusive inativos | apenas o escopo das suas salas |

### Rotas

Catálogo completo em [`api-fr/src/http/routes/index.ts`](../../api-fr/src/http/routes/index.ts). Prefixos:
`/employees`, `/rooms`, `/computers`, `/lawyers`, `/printers`.

### Tratamento de erros

| Status | Formato | Como tratar |
| --- | --- | --- |
| `400` | `{ message }` | erro de validação ou de regra de negócio — exibir `message` |
| `401` | `{ message }` | sem sessão ou sem permissão — redirecionar ao login |
| `404` | `{ message, route }` | rota inexistente |
| `429` | `{ message, retryAfterInSeconds }` | **ler `retryAfterInSeconds` e aguardar** — nunca retentar em laço |

Tetos de rate limit relevantes ao painel:

| Rota | Teto | Janela | Conta por |
| --- | --- | --- | --- |
| qualquer rota (global) | 300 | 1 min | IP |
| `POST /employees/session/auth` | 5 | 10 min | IP + CPF |
| `POST /employees/password-recovery` | 5 | 15 min | IP |
| `POST /employees/reset-password` | 10 | 10 min | IP |

> O login é o caso mais sensível: cinco tentativas por 10 minutos contadas por IP + CPF. Um usuário que
> erra a senha algumas vezes bate o teto — a UI precisa dizer quanto falta esperar, não apenas "erro".

Por isso a tela de login valida **CPF (com dígitos verificadores) e tamanho de senha no cliente**: dado
malformado não pode consumir uma das cinco tentativas. O bloco `errors.root` do formulário é o lugar
reservado para as mensagens de `400` e `429` quando a integração existir.

---

## ⚠️ Lacunas da API que travam telas deste painel

Levantado em **2026-08-12** a partir de [`api-fr/docs/ROADMAP.md`](../../api-fr/docs/ROADMAP.md).
Confirmar antes de planejar as telas correspondentes.

- **Paginação não existe em nenhuma listagem**, embora o requisito não-funcional exija 10 itens por página.
  Afeta funcionários, salas, computadores, sessões e impressões.
- **Liberar computador manualmente pelo funcionário** — requisito previsto, rota não implementada.
- **Baixar arquivo da fila de impressão** — a listagem existe, o download não.
- **Relatórios** — nada implementado.
- **Tempo real** — o WebSocket é hoje um canal Desktop↔API. Não há eventos `computer_released` /
  `session_started`, e o canal não é autenticado. Um painel "ao vivo" hoje só consegue polling.

---

## 🧭 Rotas do front

| Rota | Grupo | Estado |
| --- | --- | --- |
| `/` | — | landing pública, pronta |
| `/auth/sign-in` | `(public)` | UI pronta; **não autentica** — `handleSignIn` só faz `console.log` |
| `/panel` | `(private)` | shell pronto, conteúdo placeholder; **sem guarda de sessão** |
| `/auth/forgot-password` | — | **linkada pelo login, não existe** |
| `/printers`, `/releases` | — | **linkadas pela sidebar, não existem** |
| `/admin/rooms`, `/admin/computers`, `/admin/employees` | — | **linkadas pela sidebar, não existem** |
| `/privacidade`, `/suporte`, `/status` | — | **linkadas pelo rodapé, não existem** |
| `not-found.tsx` | — | 404 do produto, pronta |

> Não existe `/auth/sign-up`: cadastro de funcionário é `POST /employees/create-account`, ação restrita a
> `ADMIN` dentro do painel. Não há auto-cadastro no produto.

> **Nada aponta para `/panel` ainda** — o hero da landing e a 404 levam a `/auth/sign-in`. O painel só é
> alcançável digitando o endereço, e responde a qualquer visitante.

### Shell do painel

O `(private)/layout.tsx` monta o shell em **"T"**: a barra superior (`panel-header/`) atravessa a largura
inteira e, abaixo dela, a navegação lateral (`panel-sidebar/`) e a área de conteúdo com rolagem própria. A
marca do produto mora na barra superior — assim continua visível com a sidebar recolhida à faixa de ícones —
e aponta para `/panel`, não para a landing.

A navegação mora em `panel-sidebar/nav-items.tsx`, declarada como dado (`NAV_SECTIONS`) em duas seções —
Operação e Administração — e é onde o corte por `role` vai entrar: a seção "Administração" será
**escondida** de `MEMBER` por um filtro sobre o array, seguindo a mesma regra das ações (esconder, não
desabilitar).

O recolhimento da sidebar é persistido no cookie `sidebar_state`. A primitiva **grava** esse cookie, mas
não o lê: quem lê é o layout, com `cookies()` do `next/headers`, repassando o valor como `defaultOpen`. Sem
essa leitura a persistência seria só escrita e a sidebar voltaria aberta a cada recarga. É por isso que
`/panel` aparece como `ƒ` (sob demanda) no build, e não como estática.

> ⚠️ **`src/components/ui/sidebar.tsx` não é mais a primitiva original.** Três alterações locais sustentam
> o arranjo em "T" e um `shadcn add sidebar` desfaz as três:
>
> 1. **`--sidebar-offset`** — o container da sidebar é `fixed` e passaria por baixo do header. A variável
>    é declarada no provider com padrão `0rem` (arranjo padrão do shadcn preservado) e sobrescrita pelo
>    layout do painel com a altura do header. A sidebar então começa em `top-(--sidebar-offset)` e mede
>    `calc(100svh - var(--sidebar-offset))`. A altura vive em dois lugares — `h-12` no `PanelHeader` e a
>    constante `HEADER_HEIGHT` no layout: mudar um sem o outro descola a sidebar do header.
> 2. **`TooltipProvider` com `delay={0}`** — no modo de faixa de ícones o tooltip é o único rótulo do item,
>    e o padrão do base-ui é 600ms de espera.
> 3. **Posicionamento `top`/`bottom`** no lugar de `inset-y-0`.

O `SidebarTrigger` da barra superior existe só abaixo de 768px (`md:hidden`), onde a sidebar vira `Sheet`.
Sem ele a navegação só abria por `Ctrl/Cmd+B` — atalho que não existe no toque, justamente o contexto dessas
larguras.

Realces sobre a barra superior e a sidebar usam **branco translúcido**, nunca `bg-primary`: no tema claro
`--primary` e `--sidebar` são o mesmo azul, e um elemento `bg-primary` desapareceria dentro da superfície
de marca. É a mesma regra já aplicada em `--sidebar-accent`. Pela mesma lógica, o brilho radial que abre a
barra superior no canto da marca é branco translúcido em gradiente — uma `div` puramente decorativa, e por
isso `aria-hidden` e `pointer-events-none`, para não entrar na árvore de acessibilidade nem roubar cliques.

A marca da barra superior é `<span>`, não `<h1>`. Como ela é parte da moldura, um `h1` ali daria a toda tela
do painel um cabeçalho de nível 1 sem relação com o conteúdo — o `h1` pertence a cada `page.tsx`.

---

## 🎨 Origem do design

A landing, a tela de login e a 404 derivaram do projeto **Claude Design "Sala Livre"**
(`c3a63c9a-47ad-47c7-8349-2d496f96c4f4`, arquivos `Sala Livre - Home`, `- Login` e `- 404`).
Divergências deliberadas em relação ao design original:

- O botão "Acessar painel" do cabeçalho foi substituído pela **logo da OAB-MA** — inclusive na 404, que
  reaproveita o `Header` real em vez do nav próprio do design.
- Ícones lucide substituem os glifos tipográficos (`⌁ ◷ ⎙ ◳`) dos cards de diferenciais.
- Os contadores da prévia do painel são derivados dos dados, não literais.
- Paleta traduzida para tokens: destaque `rose-700`, disponível `green-600`, manutenção `slate-500`.
- O símbolo da marca é o componente `BrandMark` (SVG com `currentColor`), não um arquivo de imagem — é o
  que permite usá-lo em branco no login, esmaecido na 404 e como marca d'água na sidebar.

O **shell do painel** não veio do Claude Design: nasceu da sidebar do shadcn, reencaixada na identidade do
produto. Os tokens `--sidebar-*` que o shadcn instala são cinza neutro e foram reescritos para o azul
profundo da marca, com `--sidebar-accent` em branco translúcido — o realce do item ativo funciona sobre o
azul sem exigir um segundo tom calibrado à mão. Um `shadcn add` que reinstale esses tokens desfaz a
identidade; conferir `globals.css` **e `src/components/ui/sidebar.tsx`** depois de atualizar primitivas.

O arranjo também diverge do shadcn: lá a barra superior fica dentro do `SidebarInset`, começando só depois
da sidebar. Isso partia a identidade do produto em duas colunas — marca no topo da sidebar, bloco de usuário
no topo do conteúdo, cada um com sua altura para alinhar à mão. Com a barra atravessando o topo, a moldura
tem uma faixa de marca só.

---

## 📋 Fluxo de trabalho

Cada incremento é documentado como uma change no **OpenSpec** (`openspec/changes/<nome>/`), com
`proposal.md`, `design.md`, `tasks.md`, `.openspec.yaml` e delta specs em `specs/<capability>/spec.md`.
O progresso é rastreado em [`docs/ROADMAP.md`](./ROADMAP.md).
