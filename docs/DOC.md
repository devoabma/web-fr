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
│       ├── panel/                 # /panel — sala e operação das máquinas (page + _components + _data)
│       ├── profile/               # /profile — conta do funcionário, troca de senha e de foto (page + _components)
│       └── _components/shared/
│           ├── panel-header/      # index.tsx (servidor) + panel-user.tsx (ilha cliente)
│           └── panel-sidebar/     # casca, itens de navegação e controle de recolher
├── components/
│   ├── app/                       # uma seção/feature por arquivo
│   │   └── client-providers.tsx   # Toaster + QueryClientProvider, montado pelo layout RAIZ
│   └── ui/                        # primitivas shadcn/base-ui
├── constants/query-keys.ts        # chaves do React Query, centralizadas
├── server/                        # funções de acesso à api-fr, uma por endpoint
│   ├── employees/                 # perfil, login, logout e troca de senha
│   ├── rooms/                     # get-all.ts (GET /rooms/get-all)
│   ├── computers/                 # estações conectadas e entrada/saída de manutenção
│   └── lawyers/                   # sessões: listar, liberar e encerrar
├── hooks/
│   ├── use-mobile.ts              # breakpoint de 768px, usado pela sidebar
│   └── use-elapsed-minutes.ts     # minutos decorridos desde uma resposta, para o saldo andar na tela
├── styles/globals.css             # tokens do tema (:root e .dark)
├── utils/
│   ├── index.ts                   # helpers sem dependência (getInitials)
│   ├── masks/                     # máscaras de entrada (CPF, data de nascimento)
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

O corte de `/admin/*` por papel acontece em **dois lugares independentes**: aqui, barrando o alcance, e na
sidebar (`adminOnly` sobre `NAV_SECTIONS`), escondendo o que não se alcança. Um é acesso, o outro é
apresentação; as duas listas — `ADMIN_ROUTES` e a marcação da seção — hoje não se derivam uma da outra e
precisam ser mantidas em sincronia na mão.

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
| `POST /lawyers/release-computer` | 10 | 1 min | IP + `macCode` |
| `POST /lawyers/close-computer/:sessionId` | 30 | 1 min | IP |

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
- ~~**Liberar computador manualmente pelo funcionário**~~ — **falso alarme, corrigido em 2026-08-19.**
  `POST /lawyers/release-computer` sempre existiu, é **pública** e identifica a máquina pelo `macCode`. Foi
  desenhada para o Desktop e serve o painel sem alteração alguma.
- **Baixar arquivo da fila de impressão** — a listagem existe, o download não.
- **Relatórios** — nada implementado.
- **Tempo real** — o WebSocket é hoje um canal Desktop↔API. Não há eventos `computer_released` /
  `session_started`, e o canal não é autenticado. Sem eles o painel não tem como saber o que acontece fora
  dele: revalida na volta de foco e depois de cada ação, e conta o tempo da sessão no próprio navegador.
  O que existe desde **2026-08-20** é uma janela HTTP para o **registro de conexões** desse canal
  (`GET /computers/online/:roomId`, api-fr `8089c01`) — o painel pergunta quem está ligado, de 20 em 20
  segundos. É leitura de presença, não evento de negócio: o bloqueio segue de pé.

---

## 🧭 Rotas do front

| Rota | Grupo | Estado |
| --- | --- | --- |
| `/` | — | landing pública, pronta |
| `/auth/sign-in` | `(public)` | pronta e **autenticando** contra a `api-fr` |
| `/panel` | `(private)` | sala e operação das máquinas: seleção (`?sala=`), colaboradores, cota, grade e as quatro ações. **Protegida pelo `proxy.ts`** |
| `/profile` | `(private)` | conta do funcionário: identificação, CPF e e-mail em leitura, troca de senha e troca da foto de perfil. Alcançada pelo menu do usuário, **sem item na sidebar** |
| `/auth/forgot-password` | — | **linkada pelo login, não existe** |
| `/printers`, `/releases` | — | **linkadas pela sidebar, não existem** |
| `/admin/rooms`, `/admin/computers`, `/admin/employees` | — | **linkadas pela sidebar, não existem**; só `ADMIN` — para `MEMBER` a seção inteira nem é renderizada |
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
Operação e Administração. O corte por `role` é um `filter` sobre esse array: a seção marcada com
`adminOnly: true` só é renderizada para `ADMIN`, seguindo a mesma regra das ações (**esconder, não
desabilitar** — item cinza continua anunciando uma área que aquele papel nunca vai alcançar).

O papel vem do **cookie**, lido no layout com `readSession`, e não do `GET /employees/profile`. Do perfil,
o primeiro HTML sairia sem saber quem é o funcionário e a seção piscaria na tela; do cookie, o markup já
nasce correto. Sem sessão utilizável o layout assume `MEMBER` — menor privilégio. O `role` desce por prop
(`PanelSidebar` → `NavItems`), sem contexto, porque são dois níveis e um enum de dois valores.

> ⚠️ **Esconder não é autorizar.** O `readSession` lê o payload do JWT **sem verificar assinatura**; um
> cookie forjado com `role: 'ADMIN'` faz a seção aparecer — e não leva a lugar nenhum, porque a `api-fr`
> valida a assinatura e responde `401`. Quem barra o alcance das rotas é o `proxy.ts`, e quem autoriza de
> verdade é a API.
>
> O `adminOnly` é **opt-in**: seção sem a marcação é visível para todos. Seção administrativa nova que
> esquecer a marcação vaza para o `MEMBER`. E a regra `role === 'ADMIN'` não é exaustiva como um
> `Record<Role, …>` seria — um terceiro papel cairia no ramo restrito em silêncio.

O recolhimento da sidebar é persistido no cookie `sidebar_state`. A primitiva **grava** esse cookie, mas
não o lê: quem lê é o layout, com `cookies()` do `next/headers`, repassando o valor como `defaultOpen`. Sem
essa leitura a persistência seria só escrita e a sidebar voltaria aberta a cada recarga. É por isso que
`/panel` aparece como `ƒ` (sob demanda) no build, e não como estática — e o mesmo `cookies()` é o que
resolve o `role` da navegação.

O **título da aba é declarado por rota**, não pelo `(private)/layout.tsx`. `metadata` em layout vale como
padrão para o grupo inteiro, então um `title: 'Painel'` ali faria toda rota privada nova nascer com o
título errado até alguém lembrar de sobrescrevê-lo. O template `%s • Sala Livre` fica no layout raiz —
layout define template, rota define nome.

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

### Sala e operação das máquinas (`/panel`)

Primeira tela de operação. Responde a pergunta feita no balcão — *"tem máquina livre?"* — e deixa agir
sobre a resposta. É composta por cabeçalho, aviso de uso, o quadro da sala e a grade de computadores, todos
orquestrados por `_components/releases-board.tsx`, que é o único componente com estado: os cards são burros
e recebem callbacks, e os diálogos moram no container, um de cada, guardando só a máquina alvo.

**O aviso vem antes do quadro** (`releases-notice.tsx`) porque corrige uma premissa: quem abre esta tela
tende a achar que é aqui que se libera computador. Não é — **o próprio advogado se libera na máquina**, e o
painel é o caminho de exceção. O aviso é `hidden sm:flex`: no celular, três parágrafos empurrariam a sala
para fora da dobra, e quem abre o painel no celular está no balcão.

**A seleção de sala lê `GET /rooms/get-all`** (`src/server/rooms/get-all.ts`). O escopo por papel já vem
resolvido pela API — o painel **não** filtra por permissão. O que ele filtra é `inactive`: sala fora de
operação sai da lista em vez de aparecer desabilitada, porque não tem nada a oferecer e listá-la só gera a
pergunta "por que não posso escolher esta?".

> A sala exibida é **derivada**, não gravada: `rooms.find(...) ?? rooms.at(0)`. Gravar o padrão com um
> `useEffect` custaria um render com o quadro montado e nenhuma sala escolhida, mais um efeito que precisa
> saber não sobrescrever a escolha do usuário. Derivar resolve os dois e ainda cobre a sala que some da
> lista entre dois `fetch` (inativada por um `ADMIN`): em vez de tela quebrada, volta para a primeira.

> ⚠️ **`employeesRooms` é o vínculo, não o funcionário.** A mesma pessoa pode ter dois registros para a
> mesma sala, e o avatar apareceria duplicado. `room-employees.tsx` reduz por `employees.id` com um `Map`
> antes de renderizar — defesa contra o dado, não contra a interface. Acima de quatro avatares o excedente
> vira `+N` com os nomes no tooltip; zero colaboradores não renderiza nem o rótulo.

O `standardTime` é a cota **da sala** e vale **por dia**, compartilhada entre as máquinas — não é crédito
por computador. O texto da faixa diz isso literalmente, porque a leitura errada muda o atendimento.

Carregamento, erro e vazio são três estados distintos. O `skeleton` reproduz a estrutura do resultado (não
um retângulo genérico), senão a faixa muda de altura quando os dados chegam e empurra o conteúdo abaixo.
"Não foi possível carregar" pede nova tentativa; "nenhuma sala ativa" é um fato sobre o cadastro, e
insistir não muda.

#### A grade lê a sala, não a rota de computadores

`GET /computers/get-all` parece a fonte natural da grade e **não serve a esta tela**: ela chama
`checkIfEmployeeIsAdmin()`, e o painel é operado por `MEMBER` — a grade tomaria `401`. Os computadores
continuam vindo embutidos na sala, o que ainda evita uma segunda requisição, mantém `Select` e grade na
mesma fonte (duas fontes divergem quando uma revalida antes da outra) e preserva o escopo por papel já
resolvido no servidor. `GET /computers/get-all` fica reservado à futura tela de inventário do `ADMIN`, onde
o `room: { id, name }` que ela traz a mais é justamente o que falta.

> ⚠️ **`maintenance` e `inactive` são data, não booleano.** A `api-fr` tipa os dois como
> `z.date().nullable()`, que no JSON viram string ISO. O painel tipava `boolean | null` e o filtro
> `!room.inactive` funcionava por acidente — string não vazia é verdadeira. Qualquer comparação estrita
> (`=== true`) passaria a falhar em silêncio, e não há como formatar "em manutenção desde 12/08" a partir
> de um booleano.

#### Quem está em qual máquina

O inventário diz que a máquina está ocupada; **quem** a ocupa vem de
`GET /lawyers/get-all-releases/:roomId`. `_data/computer-view.ts` junta as duas leituras.

> ⚠️ **Essa rota devolve o histórico inteiro da sala**, ordenado do mais recente para o mais antigo — não
> há filtro de sessão aberta na API. O painel filtra `endDate === null` e indexa por `computer.id`, com um
> `reverse()` antes do `Map` para a sessão mais recente vencer se duas aparecerem abertas na mesma máquina.

> ⚠️ **A API não ordena os computadores.** O `select` de `computers` em `GET /rooms/get-all` não tem
> `orderBy`: a ordem é a que o Postgres devolver e muda entre requisições. Com polling de 30s, a grade se
> reembaralharia na frente do funcionário. A ordenação por `number` é do front, sobre uma **cópia** do
> array — `sort` muta, e o array pertence ao cache do React Query.

O `status` de três valores é derivado, nesta ordem: **manutenção → em uso → disponível**. Manutenção vence
`inUse` porque máquina em manutenção com a marca de uso travada não pode convidar alguém a encerrar uma
sessão que não existe. E "em uso" deriva de `session || inUse`, não só da sessão: se a leitura das
liberações falhar, a grade ainda marca as ocupadas pelo `inUse` da sala, perde os detalhes e **não** passa
a oferecer liberação por cima de quem está trabalhando. Uma faixa âmbar explica a degradação.

A conexão da estação é **ortogonal** aos três estados: não vira um quarto valor de `status`, e sim o campo
`isOnline`. Ela muda a leitura do card disponível (âmbar, rotulado "Offline", sem liberação) e acrescenta
uma ressalva ao card em uso, mas máquina em manutenção continua sendo manutenção, ligada ou não.

#### As quatro ações do balcão

| Ação | Rota | Onde aparece |
| --- | --- | --- |
| Liberar | `POST /lawyers/release-computer` (pública) | card disponível |
| Encerrar sessão | `POST /lawyers/close-computer/:sessionId` | card em uso |
| Enviar para manutenção | `PATCH /computers/maintenance/:id` | card disponível |
| Devolver à operação | `PATCH /computers/maintenance/:id/remove` | card em manutenção |

> ⚠️ **`birth` vai em `DDMMYYYY`, sem barras.** A API compara com o cadastro da OAB já formatado assim; o
> formulário digita `dd/mm/aaaa`. Errar isso faz *toda* liberação falhar com "informações não conferem" —
> a mensagem menos útil possível para depurar.

> ⚠️ **`notified: false` desfaz a liberação.** A sessão foi gravada, mas o Desktop daquela máquina não
> estava no WebSocket e não recebeu o evento — a tela nunca vai destravar. Avisar não bastava: a `api-fr`
> recusa duas sessões simultâneas para o mesmo advogado, então a sessão fantasma o prendia a uma máquina
> que não abre até alguém encerrá-la pelo card. O painel encerra na hora, e isso não custa cota (o consumo
> é contado em minutos inteiros). Se o encerramento também falhar, a mensagem para de descrever o problema
> e instrui a encerrar pelo card antes de tentar outra máquina.

> ⚠️ **A condição é `expiresAt && !notified`, não só `!notified`.** A rota tem dois caminhos de `200`: a
> liberação nova (com `expiresAt`) e o encerramento da sessão anterior que estourou o tempo (sem). O
> segundo também pode vir com `notified: false`, e ali não há sessão nova para desfazer.

#### Quem está ligado

`GET /computers/online/:roomId` lista as estações conectadas ao canal `/ws/computers` — as que conseguem
receber a ordem de abrir a tela. É a terceira consulta da tela, e o que permite barrar a máquina muda
**antes** de gravar sessão nela.

> ⚠️ **A rota devolve só as conectadas.** Ausência na lista é o sinal de offline — não há campo de estado
> para ler. E a leitura é da **conexão do programa**, não do computador: estação ligada com o Desktop
> fechado conta como offline, que é exatamente o que interessa.

`ComputerView.isOnline` é `boolean | null`, e o terceiro estado não é preciosismo: enquanto a resposta não
chega, ou se a consulta falha, `null` faz o card se comportar como antes da mudança. `false` por padrão
travaria a sala inteira num timeout de rede; `true` por padrão mentiria. Uma faixa âmbar explica a
degradação, porque a grade volta a não distinguir as mudas.

**As duas defesas cobrem janelas diferentes.** O bloqueio na grade pega a máquina que **já estava**
desligada — o caso comum, e o único que evita o vaivém do advogado. O desfazer pega a que **caiu** entre o
último refetch e a confirmação. Ficar só com uma das duas deixa um dos dois buracos aberto.

**É a única consulta da tela com polling** (20s). Estação que sobe não avisa o painel, e
`refetchOnWindowFocus` não dispara para quem nunca sai da aba: sem o intervalo, a máquina recém-ligada
ficaria com o botão travado indefinidamente. O intervalo do React Query pausa fora de foco, e o teto global
da `api-fr` é de 300 req/min por IP — três por minuto por funcionário não chega perto.

**Offline impede uma coisa só: receber a ordem de abrir a tela.** Manutenção continua oferecida (é o
desfecho natural de achar uma máquina muda, e é operação de banco), e encerrar sessão de máquina offline
também funciona — a sessão morre e a cota volta. O que não acontece é a tela dela limpar, e o card avisa
isso em vez de esconder o botão.

> ⚠️ **Depende da `api-fr` em `8089c01` ou posterior.** Contra uma API sem essa rota a consulta responde
> `404`, a tela cai no aviso de degradação e o comportamento volta ao anterior, com o desfazer de pé.

**Manutenção não é oferecida no card em uso** — a API recusa com `400` enquanto houver sessão, e oferecer o
botão só entregaria um erro no clique. O caminho correto é encerrar a sessão primeiro, que o card já
oferece. O `404` das rotas de manutenção é ambíguo de propósito (máquina inexistente e máquina fora das
salas do funcionário respondem igual, para não vazar inventário): repasse a mensagem como veio, sem tentar
interpretar.

**Os diálogos não fecham no confirmar.** Quem fecha é o container, e só no sucesso. Uma liberação recusada
— CPF que não confere, advogado inadimplente — fazia o diálogo sumir como se tivesse dado certo, e o
funcionário redigitava tudo. `AlertDialogAction` aqui é um `Button` puro, não um `Close` do base-ui: não
fecha sozinho e não precisa de `preventDefault`.

**A pendência é por card, não por grade.** O `isPending` de uma mutação do React Query é global e
desabilitaria a grade inteira a cada manutenção. Como a mutação carrega o `computerId` que recebeu,
`variables` diz qual card está ocupado e só ele trava.

#### Estado da tela

A sala escolhida vive na URL (`?sala=<roomId>`), então a tela recarrega e se compartilha sem perder o
contexto. Um valor inválido, ou de sala fora do escopo, cai na primeira da lista. O custo é a fronteira de
`Suspense` em `page.tsx` — sem ela o build falha ao pré-renderizar por causa do `useSearchParams`.

O saldo (`usedMinutes`, `remainingMinutes`) é calculado no **servidor** a cada requisição: vale para o
instante da resposta e envelhece no segundo seguinte. A primeira versão resolvia isso com polling de 30s —
repetindo uma rota que devolve o **histórico inteiro** da sala só para o número mexer.

Hoje o painel conta o tempo por conta própria. `useElapsedMinutes` (`src/hooks/`) devolve os minutos
decorridos desde o `dataUpdatedAt` da consulta, e `buildComputerViews` os desconta do saldo de cada sessão.
O relógio anda com a aba parada, sem requisição alguma, e cada revalidação reancora o número no valor do
servidor. O cliente **só subtrai tempo**: cota, bloqueio e encerramento continuam sendo decisão da API.

Duas guardas fazem parte do desenho:

- **Piso em zero.** Relógio da estação atrasado em relação ao do servidor daria decorrido negativo, e o
  saldo *cresceria* na tela — o pior erro possível para este número.
- **Primeira contagem no `useEffect`.** Ler o relógio durante o render gravaria um instante no HTML do
  servidor e outro no do cliente, e o React acusa erro de hidratação.

O saldo zerado na tela já sinaliza cota esgotada, antes mesmo da confirmação: a `api-fr` encerra a sessão
sozinha quando o `expiresAt` chega, e o refetch seguinte só confirma o que o card mostrou.

O que se perde sem o polling é a mudança feita **fora** do painel enquanto a aba está em foco — um advogado
que se libera sozinho na máquina aparece na volta de foco ou depois da próxima ação, não em até 30s. Falha
para o lado seguro: a API recusa liberar máquina ocupada e encerrar sessão inexistente, e o erro chega em
toast. Cai fora no dia em que a `api-fr` emitir eventos de negócio no WebSocket.

> ⚠️ **Datas do card levam `timeZone: 'America/Fortaleza'` fixo.** O card é client component, mas o Next
> também o renderiza no servidor — e servidor em UTC formataria hora diferente da do navegador, o que o
> React acusa como erro de hidratação.

Detalhes de interface que valem para as próximas telas:

- **Tempo é relógio, não número**: `01h:12min` em vez de "72 minutos" — no balcão se lê de relance. As
  unidades ficam no número porque `01:12` sozinho é lido como hora do dia. A barra ao lado existe para a
  leitura ainda mais rápida: o número diz quanto falta, a barra diz se é muito ou pouco.
- **Tooltip em botão desabilitado precisa de `span` envolvente.** Botão desabilitado não dispara evento de
  ponteiro; sem o wrapper, a explicação de por que ele está travado nunca apareceria.
- **`uppercase` é marcador de rótulo**, não de conteúdo. Nome de sala e de máquina vão em caixa normal —
  caixa alta competiria com a etiqueta acima e prejudicaria a leitura de nome longo.
- **Texto longo no `Select`**: o popup tem largura travada em `w-(--anchor-width)` e o `ItemText` do base-ui
  herda `whitespace-nowrap` com `min-width: auto`. Contenção exige as três peças juntas — `min-w-0` no item
  (zera a contribuição de largura mínima), `whitespace-normal` (para poder quebrar) e `line-clamp-2`.
- **Data validada por reconstrução**: regex `dd/mm/aaaa` sozinha aceita 31/02, porque o `Date` normaliza o
  dia inválido para o mês seguinte em silêncio. O schema monta o `Date` e compara os campos de volta.
- **`reset()` ao abrir o diálogo de liberação**: sem isso o CPF do advogado anterior reaparece na máquina
  seguinte, e o balconista libera a pessoa errada sem perceber.

---

### Conta do funcionário (`/profile`)

Primeira tela de conta do painel, destino do item que nascia inerte no menu do usuário. Três cartões numa
coluna de `max-w-3xl`: identificação (avatar, nome e papel), dados da conta (CPF mascarado e e-mail) e
segurança (o botão que abre a troca de senha).

**Só leitura, e a tela diz isso — exceto a foto.** Nome, CPF e e-mail são cadastro de administrador
(`PATCH /employees/update/:id`). O cartão de dados carrega a frase "para corrigir qualquer um destes dados,
procure um administrador" — sem ela, o funcionário procuraria um lápis que não existe. A foto é a exceção e
fica fora daquele cartão: `PATCH /employees/update-image` resolve o funcionário pelo próprio token, então
cada um troca a sua sem passar por ninguém.

**Mesma consulta da barra superior.** `queryKeys.getProfile()` com `staleTime` infinito, exatamente como o
bloco de usuário do topo. Chave própria significaria duas requisições e dois retratos do mesmo funcionário
podendo divergir na mesma aba — como se chega aqui pelo menu do usuário, o dado já está em cache.

**Troca de senha** (`PATCH /employees/change-password`) num diálogo controlado:

- Os nomes divergem de propósito: o formulário usa `confirmPassword`, a API espera `confirmNewPassword`. A
  tradução acontece num único ponto, na chamada da mutação.
- **O diálogo resiste ao fechamento durante o envio** (`if (isSubmitting) return` no `onOpenChange`). Fechar
  no meio da chamada limparia o formulário com a requisição de pé: o toast de erro chegaria depois, sem os
  dados na tela para corrigir.
- **`closeDialog` centraliza os três efeitos** — fechar, `reset()` e desligar "mostrar senhas". Se algum
  caminho de saída esquecesse o último, a senha visível vazaria para a próxima abertura.
- **No erro, só a senha atual é descartada** (`resetField` + `setFocus`). É o campo que costuma estar
  errado; limpar os três obrigaria a redigitar a nova senha duas vezes por um dígito trocado no primeiro.
- Validação local repete o `min(8)` e a igualdade da confirmação, e acrescenta `newPassword !==
  currentPassword` — a API recusa de qualquer jeito, e o `400` seria puro atrito. Os dois `refine` levam
  `path` explícito, senão o erro cai na raiz do objeto e o `FieldError` de cada campo fica mudo.
- `autoComplete`: `current-password` no primeiro campo, `new-password` nos outros dois. Errar isso faz o
  gerenciador de senhas preencher a senha antiga nos três.
- Um único "Mostrar senhas" para os três campos: quem liga a visibilidade quer conferir se a nova bate com a
  confirmação.

> ⚠️ **Trocar a senha não expulsa ninguém.** A `api-fr` só regrava o `passwordHash` — o JWT emitido antes
> continua aceito até expirar (1 dia), aqui e em qualquer outra máquina. Trocar a senha por desconfiança
> **não** encerra a sessão de quem já estava dentro. Depende da mesma denylist pendente do logout.

> A API dispara um e-mail de confirmação (Resend) depois da troca. Fora de produção o destinatário é fixo no
> código do backend, não o e-mail do funcionário — comportamento da `api-fr`, apenas anotado para não
> assustar em desenvolvimento.

**Troca da foto de perfil** (`PATCH /employees/update-image`), com o próprio avatar como gatilho:

- **O gatilho é a foto, não um botão ao lado.** É onde a mão vai primeiro. `<button>` de verdade com
  `aria-label`, `Tooltip` de "Atualizar foto de perfil" e véu com ícone de câmera em `group-hover` **e**
  `group-focus-visible` — sem o segundo, quem navega por teclado não veria indicação nenhuma.
- **`Dialog` controlado, sem `DialogTrigger`.** `Tooltip` e `Dialog` disputariam o mesmo elemento por
  `render` aninhado. O Base UI devolve o foco ao elemento que o tinha antes da abertura, então o retorno de
  foco continua correto.
- **Sem `react-hook-form` aqui.** Um campo só, e ele é `<input type="file">`. O motivo duro é de tipagem:
  `z.instanceof(File)` no escopo do módulo quebra o SSR do componente cliente, porque `File` não existe no
  Node. O schema usa `z.custom<File>`, cuja checagem só roda no `parse`, já no navegador.
- **Validação local espelha a API**: PNG, JPG ou WEBP, arquivo não vazio, até 5 MB (o teto do
  `@fastify/multipart`). O `accept` do input é só uma sugestão do sistema operacional — o usuário troca o
  filtro para "todos os arquivos" e escolhe um PDF sem esforço. Arquivo recusado **não** fica selecionado.
- **A pré-visualização é um `objectURL` revogado no `cleanup`.** Sem a revogação, cada arquivo escolhido
  deixaria um blob preso na memória pelo resto da sessão — no balcão a aba fica dias aberta.
- **O `value` do input é zerado ao limpar a seleção.** Sem isso, escolher **o mesmo** arquivo de novo não
  dispara `change`, e a tela fica sem pré-visualização, parecendo travada.
- **O sucesso escreve no cache, não invalida.** A API devolve a `imageUrl`, então `setQueryData` evita um
  `GET /employees/profile` para descobrir o que já se sabe. E fecha uma janela real: com
  `invalidateQueries`, entre a resposta e o fim da nova consulta o botão reabilitaria com o arquivo ainda
  selecionado — dois cliques seriam dois uploads e dois arquivos no bucket. O `updater` é imutável de
  propósito; mutar o objeto anterior devolveria a mesma referência e a foto não trocaria na tela.
- **Nenhum `Content-Type` manual na chamada.** O axios só monta `multipart/form-data; boundary=...` quando
  o cabeçalho não foi informado. Declarando-o na mão, o `boundary` some e o Fastify não separa as partes.
- Mesma regra de fechamento da troca de senha: `Esc`, clique fora e "Cancelar" ficam sem efeito enquanto o
  envio está de pé.

> Cada envio grava um nome novo no bucket (`crypto.randomUUID()` no `profiles` do Supabase) e a `api-fr`
> apaga a imagem anterior depois de gravar a nova. Como a URL sempre muda, não há risco de o navegador
> servir a foto antiga do cache. Falha na remoção deixa arquivo órfão, mas não desfaz a troca.

> Não há recorte no cliente: o avatar é quadrado e usa `object-cover`, então foto retangular perde as
> bordas. A pré-visualização mostra exatamente o enquadramento final, antes do envio.

**O item do menu virou âncora**: `DropdownMenuItem` com `render={<Link href="/profile" />}`, não
`router.push` no clique. Navegação programática descartaria abrir em nova aba, o prefetch do `next/link` e o
endereço na barra de status.

---

## 🎨 Origem do design

A landing, a tela de login e a 404 derivaram do projeto **Claude Design "Sala Livre"**
(`c3a63c9a-47ad-47c7-8349-2d496f96c4f4`, arquivos `Sala Livre - Home`, `- Login` e `- 404`).
Divergências deliberadas em relação ao design original:

- O botão "Acessar painel" do cabeçalho foi substituído pela **logo da OAB-MA** — inclusive na 404, que
  reaproveita o `Header` real em vez do nav próprio do design.
- Ícones lucide substituem os glifos tipográficos (`⌁ ◷ ⎙ ◳`) dos cards de diferenciais.
- Os contadores da prévia do painel são derivados dos dados, não literais.
- Paleta traduzida para tokens: destaque `rose-700`, disponível `green-600`, manutenção `slate-500`. O
  `amber-500` entrou depois, e não como quarto estado: é o tom de "funciona, mas há algo a saber" — as
  faixas de degradação e a estação offline.
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
