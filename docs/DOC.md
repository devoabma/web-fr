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
- **axios** — cliente HTTP da `api-fr` (`src/lib/axios.ts`)
- **TanStack React Query 5** — camada de dados do cliente
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
├── proxy.ts                       # guarda de navegação (middleware do Next 16)
├── env.ts                         # variáveis públicas validadas por Zod
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
│           ├── panel-header/      # index.tsx (servidor) + panel-user.tsx (ilha cliente)
│           └── panel-sidebar/     # casca, itens de navegação e controle de recolher
├── components/
│   ├── app/                       # uma seção/feature por arquivo
│   │   └── client-providers.tsx   # Toaster + QueryClientProvider, montado pelo layout RAIZ
│   └── ui/                        # primitivas shadcn/base-ui
├── constants/query-keys.ts        # chaves do React Query, centralizadas
├── server/employees/              # funções de acesso à api-fr, uma por endpoint
├── hooks/use-mobile.ts            # breakpoint de 768px, usado pela sidebar
├── styles/globals.css             # tokens do tema (:root e .dark)
├── utils/
│   ├── index.ts                   # helpers sem dependência (getInitials)
│   ├── masks/                     # máscaras de entrada (CPF)
│   └── schemas/                   # schemas Zod reutilizáveis (CPF)
└── lib/
    ├── utils.ts                   # cn() — clsx + tailwind-merge
    ├── axios.ts                   # instância única, baseURL por env, withCredentials
    ├── react-query.ts             # getQueryClient() — por requisição no servidor
    ├── auth/{routes,session}.ts   # política de rotas e leitura do JWT
    └── http/api-error.ts          # leitura defensiva de message / 429
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
`httpOnly` (`TOKEN_COOKIE_NAME`, `@fr-auth-token` nos ambientes atuais), válido por 1 dia. O JWT carrega
`{ sub, role, exp }`.

**Este painel usa o cookie, e descarta o `{ token }` do corpo.** O cookie é `httpOnly` justamente para que
uma falha de XSS não valha sessão roubada; copiá-lo para `localStorage` anularia a proteção. O `axios` de
`src/lib/axios.ts` vai com `withCredentials: true`, e o navegador anexa o cookie sozinho.

> ✅ O CORS da API já está restrito ao `WEB_URL` com `credentials: true` — a ressalva anterior sobre
> `origin: '*'` exigir `Authorization: Bearer` **está vencida**. Se o CORS voltar a ser curinga, o login
> quebra inteiro: o navegador recusa cookie credenciado com origem coringa.

> ⚠️ **Cookie e domínio.** A API grava o cookie em `DOMAIN_URL` (`localhost` em desenvolvimento — cookies
> ignoram a porta, então `:25600` e `:3000` compartilham). Em produção, painel e API só compartilham sessão
> se o `Domain` cobrir os dois subdomínios, com `SameSite=None; Secure`. O `NEXT_PUBLIC_DOMAIN` deste
> repositório precisa espelhar esse valor: é com ele que o `proxy.ts` **apaga** o cookie inservível, e um
> `delete` host-only não remove cookie gravado com `Domain=`.

**Logout:** `POST /employees/session/logout` (pública, sem JWT) responde `200 { message }` e devolve um
`clearCookie` com os mesmos atributos da gravação. Atenção ao prefixo `/employees` — chamar `/session/logout`
devolve `404`. A requisição precisa ir com credenciais (o `withCredentials` do `axios`), ou o navegador
descarta a instrução de remoção e o funcionário continua logado.

> ⚠️ **O logout apaga o cookie, não invalida o token.** A `api-fr` não mantém denylist: um JWT já copiado
> segue aceito até expirar (1 dia). Como o painel nunca expõe o token ao JavaScript, o vetor exige acesso
> prévio ao cookie `httpOnly` — mas a ressalva vale em máquina compartilhada.

Além do logout, a sessão termina por expiração (1 dia) ou quando o `proxy.ts` descarta um cookie inservível.

### Sessão e guarda de rotas

`src/proxy.ts` (o middleware do Next 16) decide para onde mandar cada visitante, **antes** da renderização:

| Situação | Destino |
| --- | --- |
| Rota pública (`PUBLIC_ROUTES`) | segue, com ou sem sessão |
| Rota de autenticação com sessão válida | `/panel` |
| Qualquer outra rota sem sessão | `/auth/sign-in?redirect=<origem>` |
| `/admin/*` com papel `MEMBER` | `/panel` |

> ⚠️ **A guarda é otimista — não é autorização.** Ela decodifica o payload do JWT e confere formato, papel e
> `exp`, mas **não verifica a assinatura**: fazer isso exigiria o segredo do JWT dentro do front. Um cookie
> forjado atravessa o `proxy.ts` sem esforço. Quem protege dado é a `api-fr`, que valida o token a cada
> requisição. O papel do proxy é evitar que o usuário veja telas vazias.

A regra é **negar por padrão**: só é público o que estiver em `PUBLIC_ROUTES`. Rota nova do painel nasce
protegida sem ninguém precisar lembrar de registrá-la — e rota pública nova **precisa** ser registrada, ou
cai no login. O casamento é por segmento, para `/administrativo` não casar com `/admin`.

Token sem `exp` é tratado como **expirado**, não como eterno.

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
malformado não pode consumir uma das cinco tentativas. O bloco `errors.root` do formulário é onde aparecem
as mensagens de `400` e `429` — no `429`, já traduzidas para tempo de espera ("2 minutos", "1 minuto e 30
segundos") por `formatWaitTime`.

**Ler o erro é defensivo, sempre.** Nem tudo que chega ao `catch` veio da API: queda de rede não traz
`response`, e um 502 de gateway responde HTML. `err.response.data.message` direto quebra o próprio
tratamento de erro nesses casos. Use `src/lib/http/api-error.ts` — `getApiErrorMessage(err, fallback)`,
`getApiErrorStatus(err)` e `getRetryAfterInSeconds(err)`.

O `QueryClient` **não retenta `4xx`**: são decisões da API, não falhas de transporte, e repetir devolve o
mesmo status. No `429` retentar é ativamente prejudicial — cada tentativa consome o teto.

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
| `/auth/sign-in` | `(public)` | pronta e **autenticando** contra a `api-fr` |
| `/panel` | `(private)` | shell pronto, conteúdo placeholder; **protegida pelo `proxy.ts`** |
| `/auth/forgot-password` | — | **linkada pelo login, não existe** |
| `/printers`, `/releases` | — | **linkadas pela sidebar, não existem** |
| `/admin/rooms`, `/admin/computers`, `/admin/employees` | — | **linkadas pela sidebar, não existem**; só `ADMIN` |
| `/privacy`, `/support`, `/status` | — | **linkadas pelo rodapé, não existem**; declaradas em `PUBLIC_ROUTES` |
| `not-found.tsx` | — | 404 do produto, pronta |

> Não existe `/auth/sign-up`: cadastro de funcionário é `POST /employees/create-account`, ação restrita a
> `ADMIN` dentro do painel. Não há auto-cadastro no produto.

> ⚠️ **Rota nova é protegida até prova em contrário.** Ao criar uma tela pública, registre-a em
> `PUBLIC_ROUTES` (`src/lib/auth/routes.ts`) — senão o `proxy.ts` a redireciona para o login e nem a 404
> aparece. Foi o que aconteceu com o rodapé, que apontava para `/privacidade` e `/suporte` enquanto a lista
> declarava `/privacy` e `/support`; os `href` foram alinhados à convenção de URLs em inglês.

> **O hero da landing continua apontando para `/auth/sign-in`**, e não para `/panel` — correto para quem
> não tem sessão, e quem tem é devolvido ao painel pelo próprio proxy.

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

> ⚠️ **O `PanelHeader` é Server Component e precisa continuar sendo.** Quem consulta o perfil é
> `panel-header/panel-user.tsx`, uma ilha cliente. Subir o `useQuery` para o header — e com ele um
> `if (!profile) return null` — apaga a barra inteira enquanto o perfil não chega, **inclusive o
> `SidebarTrigger`**: abaixo de 768px o usuário fica sem nenhum caminho para abrir a navegação, e o
> conteúdo salta quando a barra reaparece. O estado de carregamento pertence ao bloco de usuário, com
> `skeleton` do tamanho final.

`GET /employees/profile` declara **`imageUrl` anulável** — funcionário sem foto cadastrada. O bloco de
usuário usa `Avatar`/`AvatarImage`/`AvatarFallback` do base-ui em vez de `next/image`: o primitivo troca
para as iniciais tanto quando não há URL quanto quando o carregamento falha, caso que o `next/image` não
cobria. As iniciais vêm de `getInitials` em `src/utils/index.ts` — compartilhado, para a barra e as
listagens do inventário nunca divergirem para o mesmo nome.

O perfil é consultado com `staleTime` infinito e descartado por `queryClient.clear()` **no login e na
saída**, para não atravessar de um funcionário para outro na mesma aba.

**Menu do usuário.** O avatar é o gatilho de um `DropdownMenu` com nome, e-mail, papel traduzido
(`ROLE_LABELS`, um `Record<Role, string>` — mapa exaustivo, para o TypeScript cobrar um papel novo do enum),
o atalho de configurações de conta (**inerte**, a tela ainda não existe) e a saída do sistema.

> ⚠️ **A largura do menu é fixa (`w-60`).** O padrão do `DropdownMenuContent` é `w-(--anchor-width)`, e a
> âncora aqui é um avatar de 32px. E a sintaxe importa: no Tailwind v4 a leitura de variável em valor
> arbitrário é `w-(--anchor-width)`; a forma v3 `w-[--anchor-width]` gera `width: --anchor-width`, que o
> navegador descarta — e, como o `tailwind-merge` só mantém a última classe do grupo, ela **silencia** o
> padrão sem colocar nada no lugar.

O gatilho leva `aria-label="Abrir menu do usuário"`: abaixo de 640px o nome ao lado do avatar não é exibido
e o nome acessível do botão seriam as iniciais, que não descrevem ação nenhuma.

**A saída chama a API porque o cookie é `httpOnly`** — o JavaScript do painel não o enxerga nem o apaga. A
ordem é `await logout()` → `queryClient.clear()` → `router.replace(SIGN_IN_ROUTE)` → `router.refresh()`
(`replace` para o painel não voltar pelo histórico; `refresh` para descartar o cache de rotas do App Router).
Enquanto a chamada corre, o item fica desabilitado, troca o ícone por um `spinner` e o menu **não fecha**
(`closeOnClick={false}`).

> ⚠️ **Falha no logout não navega.** Se a requisição não completa, o cookie continua válido: mostrar a tela
> de login convenceria o funcionário de que saiu, e a próxima pessoa na mesma máquina entraria com a sessão
> dele. O `catch` emite um toast e mantém tudo no lugar.

Realces sobre a barra superior e a sidebar usam **branco translúcido**, nunca `bg-primary`: no tema claro
`--primary` e `--sidebar` são o mesmo azul, e um elemento `bg-primary` desapareceria dentro da superfície
de marca. É a mesma regra já aplicada em `--sidebar-accent`.

> O brilho radial que já abriu a barra superior no canto da marca foi **removido** por decisão de design: a
> marca e o badge de status dão peso suficiente ao topo.

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
