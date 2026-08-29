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
- **TanStack React Table 9** — primitiva `DataTable` das áreas administrativas
- **date-fns** — formatação de datas nas tabelas
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
│       ├── admin/rooms/           # /admin/rooms — cadastro, listagem, edição e ativar/inativar sala (page + _components)
│       ├── admin/computers/       # /admin/computers — cadastro, listagem, edição e exclusão (page + _components)
│       ├── admin/employees/       # /admin/employees — cadastro, edição, vínculos e ativar/inativar (page + _components)
│       ├── printers/              # /printers — histórico de impressões (page + _components)
│       ├── releases/              # /releases — histórico de liberações (page + _components + _data)
│       └── _components/shared/
│           ├── filters/           # sala, período e o corte de período — reusados pelas duas telas de histórico
│           ├── panel-header/      # index.tsx (servidor) + panel-user.tsx e panel-status.tsx (ilhas cliente)
│           └── panel-sidebar/     # casca, itens de navegação e controle de recolher
├── components/
│   ├── app/                       # uma seção/feature por arquivo
│   │   └── client-providers.tsx   # Toaster + QueryClientProvider, montado pelo layout RAIZ
│   └── ui/                        # primitivas shadcn/base-ui
│       └── data-table/            # tabela reusável (TanStack v9): features, rodapé de paginação
├── constants/
│   ├── query-keys.ts              # chaves do React Query, centralizadas
│   └── ufs.ts                     # as 27 UFs, espelho da lista fechada da api-fr
├── server/                        # funções de acesso à api-fr, uma por endpoint
│   ├── employees/                 # perfil, login, logout, troca de senha, CRUD, vínculos e ativar/inactive
│   ├── rooms/                     # get-all, create, activate e inactive (PATCH /rooms/deactivate/:id)
│   ├── computers/                 # get-all, create, update, delete, conectadas e entrada/saída de manutenção
│   ├── printers/                  # get-all (roomId opcional no caminho)
│   └── lawyers/                   # sessões: listar (roomId opcional), liberar e encerrar
├── hooks/
│   ├── use-mobile.ts              # breakpoint de 768px, usado pela sidebar
│   └── use-elapsed-minutes.ts     # minutos decorridos desde uma resposta, para o saldo andar na tela
├── styles/globals.css             # tokens do tema (:root e .dark)
├── utils/
│   ├── index.ts                   # helpers sem dependência (getInitials, formatDuration, formatMinutes)
│   ├── masks/                     # máscaras de entrada (CPF, data de nascimento, código de recuperação, slug, MAC)
│   └── schemas/                   # schemas Zod reutilizáveis (CPF, MAC)
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
- **URLs em inglês, interface em português** — `/panel`, `/auth/sign-in`, `/admin/computers`; os rótulos que o
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

**Base URL:** `https://api-fr.oabma.org.br` em produção. Docs vivas em `/docs` (Scalar).

### Rotas de saúde

Duas rotas públicas, com consumidores diferentes — e a distinção não é cosmética:

| Rota | Responde | Quem lê |
| --- | --- | --- |
| `GET /health` | `200 { status }` sempre que o processo está de pé. **Não toca no banco.** | O `HEALTHCHECK` do Dockerfile da API |
| `GET /ready` | `200 { status, database }` ou `503` quando o banco não responde em 3s | O selo do cabeçalho deste painel (`panel-status.tsx`) |

> ⚠️ **Não troque o `/ready` pelo `/health` no selo, nem faça o `/health` consultar o banco.** Para o
> orquestrador, "não saudável" significa uma coisa só: reinicie o contêiner. Reiniciar a API não conserta
> banco fora do ar — derruba os WebSockets dos Desktops de todas as salas e, se a queda durar, vira laço de
> reinício. Com o Neon em scale-to-zero, um cold start já bastaria. É por isso que são duas rotas.

O `/health` é isento de rate limit (`UNLIMITED_ROUTES` na API); o `/ready` tem teto próprio de 60/min por
IP, porque é rota pública que encosta no banco.

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
- **Baixar arquivo da fila de impressão** — a listagem existe e a tela `/printers` já a consome, mas o
  download não. O `fileUrl` aponta para o Storage, em outro domínio, onde `<a download>` é ignorado pelo
  navegador: a tela **abre** o arquivo em aba nova, que é o máximo honesto daqui. Vira download de verdade
  no dia em que a `api-fr` servir o arquivo pelo próprio domínio.
- **Relatórios** — nada implementado. A *listagem* de sessões existe e `/releases` a consome desde
  **2026-08-28**; o que falta são os agregados (uso por sala, impressões por advogado, tempo médio).
- **A rota de sessões não pagina nem aceita filtro algum** — nem por advogado, nem por data, ao contrário
  da de impressões. `/releases` filtra tudo no cliente porque não há para onde empurrar o trabalho. E o
  aperto chega antes aqui: impressões somem toda sexta, sessões ficam para sempre.
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
| `/auth/forgot-password` | `(public)` | pronta: CPF + e-mail, confirmação no lugar do formulário e reenvio travado por 60s |
| `/auth/reset-password` | `(public)` | pronta: código de 6 caracteres (aceita o `?code=` do e-mail), nova senha e confirmação. **Dinâmica** por causa do `searchParams` |
| `/admin/rooms` | `(private)` | salas de liberação: cadastro em painel lateral, tabela com busca e paginação, edição em diálogo e alternância entre ativa e inativa. Só `ADMIN` — `MEMBER` é devolvido ao painel pelo `proxy.ts` |
| `/admin/computers` | `(private)` | computadores de liberação: cadastro em painel lateral, tabela com busca por sala ou descrição, edição em diálogo e exclusão confirmada por digitação. Só `ADMIN` — `MEMBER` é devolvido ao painel pelo `proxy.ts` |
| `/admin/employees` | `(private)` | colaboradores: cadastro em painel lateral, tabela com busca por nome ou CPF, edição em painel lateral, gestão das salas vinculadas e alternância entre ativo e inativo. Só `ADMIN` — para `MEMBER` a seção inteira nem é renderizada |
| `/printers` | `(private)` | histórico de impressões: filtros de sala (`?sala=`), período e busca, tabela com o arquivo em aba nova e aviso do expurgo semanal. Aberta aos dois papéis — o escopo por sala é o que a `api-fr` já resolve |
| `/releases` | `(private)` | histórico de liberações: filtros de sala (`?sala=`), período, situação e busca, com o desfecho de cada sessão e a duração das abertas andando na tela. **Somente leitura** — encerrar é do painel de operação. Aberta aos dois papéis |
| `/privacy`, `/support`, `/status` | — | **linkadas pelo rodapé, não existem**; declaradas em `PUBLIC_ROUTES` |
| `not-found.tsx` | — | 404 do produto, pronta |

> Não existe `/auth/sign-up`: cadastro de funcionário é `POST /employees/create-account`, ação restrita a
> `ADMIN` dentro do painel. Não há auto-cadastro no produto.

> ⚠️ **Rota nova é protegida até prova em contrário.** Ao criar uma tela pública, registre-a em
> `PUBLIC_ROUTES` (`src/lib/auth/routes.ts`) — senão o `proxy.ts` a redireciona para o login e nem a 404
> aparece. Foi o que aconteceu com o rodapé, que apontava para `/privacidade` e `/suporte` enquanto a lista
> declarava `/privacy` e `/support`; os `href` foram alinhados à convenção de URLs em inglês.

> **As telas de recuperação não vão para `PUBLIC_ROUTES`.** Elas caem em `AUTH_ROUTES` (`/auth`), que é
> mais estrito: alcançável só por quem **não** tem sessão. Quem já está logado e tenta abrir
> `/auth/forgot-password` é devolvido ao painel pelo proxy — quem está dentro troca a senha em `/profile`,
> com a senha atual em mãos.

> **O hero da landing continua apontando para `/auth/sign-in`**, e não para `/panel` — correto para quem
> não tem sessão, e quem tem é devolvido ao painel pelo próprio proxy.

### Shell do painel

O `(private)/layout.tsx` monta o shell em **"T"**: a barra superior (`panel-header/`) atravessa a largura
inteira e, abaixo dela, a navegação lateral (`panel-sidebar/`) e a área de conteúdo com rolagem própria. A
marca do produto mora na barra superior — assim continua visível com a sidebar recolhida à faixa de ícones —
e aponta para `/panel`, não para a landing.

A moldura é **flutuante** desde a change `painel-flutuante`: o fundo do painel tem o tom da navegação e a
área de conteúdo aparece como ilha, com cantos arredondados, sombra e respiro. No desktop isso é o
`variant="inset"` que a primitiva já trazia e estava desligado; abaixo de 768px as classes equivalentes são
declaradas no layout, porque as da primitiva começam em `md:`. Duas armadilhas do caminho ficaram
registradas em comentário no código: a cor de fundo do wrapper vem de um seletor `has-data-[variant=inset]`
que **não casa no mobile** (lá a navegação vive num portal, fora do wrapper), e o `overflow-hidden` da ilha
é o que impede o conteúdo rolado de passar por cima do canto arredondado. A barra superior perdeu a borda
inferior junto: com o fundo na mesma cor dela, a linha vira um risco atravessando a tela.

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

> ⚠️ **`src/components/ui/sidebar.tsx` não é mais a primitiva original.** Quatro alterações locais sustentam
> o arranjo em "T" e um `shadcn add sidebar` desfaz as quatro:
>
> 1. **`--sidebar-offset`** — o container da sidebar é `fixed` e passaria por baixo do header. A variável
>    é declarada no provider com padrão `0rem` (arranjo padrão do shadcn preservado) e sobrescrita pelo
>    layout do painel com a altura do header. A sidebar então começa em `top-(--sidebar-offset)` e mede
>    `calc(100svh - var(--sidebar-offset))`. A altura vive em dois lugares — `h-12` no `PanelHeader` e a
>    constante `HEADER_HEIGHT` no layout: mudar um sem o outro descola a sidebar do header.
> 2. **`TooltipProvider` com `delay={0}`** — no modo de faixa de ícones o tooltip é o único rótulo do item,
>    e o padrão do base-ui é 600ms de espera.
> 3. **Posicionamento `top`/`bottom`** no lugar de `inset-y-0`.
> 4. **O ramo mobile usa `Drawer`, não `Sheet`** — painel flutuante com arrasto, igual aos formulários. O
>    `Sheet` deixou de ser usado no projeto por causa disso; o componente foi mantido por ser peça da
>    biblioteca de interface, não código morto de aplicação.

O `SidebarTrigger` da barra superior existe só abaixo de 768px (`md:hidden`), onde a sidebar vira painel
sobreposto. Sem ele a navegação só abria por `Ctrl/Cmd+B` — atalho que não existe no toque, justamente o
contexto dessas larguras.

Abaixo de 768px a sidebar é o **mesmo `Drawer` dos formulários administrativos**, e não mais o `Sheet`
genérico: painel flutuante com respiro de `0.75rem`, cantos arredondados e **fechamento por arrasto**, que
num menu de navegação é o gesto que se tenta primeiro. Dois detalhes vieram junto — a largura precisa de `!`
porque o `DrawerContent` declara a sua num seletor `data-[swipe-axis=x]:sm:` mais específico, e a faixa
mobile (< 768px) atravessa esse `sm:`; e `--drawer-bleed-background` precisa ir a `transparent`, senão a
faixa que o `::after` pinta para fora da borda aparece como um risco dentro do respiro.

> ⚠️ **Escolher uma área fecha o menu — só no mobile.** O painel cobre o conteúdo, então navegar sem fechá-lo
> deixava a página escolhida atrás do próprio menu, e o toque parecia não ter funcionado. `NavItems` chama
> `setOpenMobile(false)` no clique, guardado por `isMobile`: no desktop a navegação tem coluna própria e
> fechá-la a cada clique seria perder o menu sem motivo.

**A marca é ancorada à coluna da navegação** (`panel-header/panel-brand.tsx`). Ela ocupa exatamente a
largura da coluna e o símbolo cai na mesma vertical dos ícones do menu: o botão de um item começa a 16px da
borda (8px do respiro do `inset` + 8px do `px-2` do `SidebarContent`) e mede 32px, que é o tamanho do
`BrandMark` — alinhar as caixas alinha também os centros, nos dois estados. Recolhida a navegação, o bloco
encolhe para os mesmos 4rem e o símbolo **não sai do lugar**. Por isso a barra superior ganhou `md:pl-0`: é
a marca que paga o recuo da esquerda, para medir a partir da borda da tela.

> ⚠️ **O `PanelHeader` é Server Component e precisa continuar sendo.** Quem consulta o perfil é
> `panel-header/panel-user.tsx`, uma ilha cliente. Subir o `useQuery` para o header — e com ele um
> `if (!profile) return null` — apaga a barra inteira enquanto o perfil não chega, **inclusive o
> `SidebarTrigger`**: abaixo de 768px o usuário fica sem nenhum caminho para abrir a navegação, e o
> conteúdo salta quando a barra reaparece. O estado de carregamento pertence ao bloco de usuário, com
> `skeleton` do tamanho final. O mesmo vale para `panel-status.tsx`, a segunda ilha: o selo de saúde
> consulta sozinho e falha sozinho, sem levar a barra junto.
>
> A marca (`panel-brand.tsx`) é a **segunda** ilha cliente da barra, pelo mesmo raciocínio: a largura dela
> depende de a navegação estar recolhida — informação que só o contexto da sidebar tem e nenhuma media query
> alcança. Cliente é o pedaço, não a barra.

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

#### Em que versão a estação está

O Desktop informa a própria versão no `register` do WebSocket, a `api-fr` grava em `appVersion` /
`appVersionReportedAt` (commit `b01add1`), e os dois campos vêm embutidos nos computadores de
`GET /rooms/get-all` — **sem requisição nova**, de carona na resposta que a grade já busca. O número
aparece abaixo da pílula de estado, em `tabular-nums`, para que os dígitos caiam na mesma coluna entre
cartões vizinhos e dez máquinas virem uma lista conferível de relance.

**A régua da defasagem é a própria sala**, não uma versão oficial. O painel não tem como saber qual release
está publicada — não há rota que diga —, e cravar o número no front criaria uma constante que envelhece em
silêncio e um dia acusaria o parque inteiro. Comparar com as vizinhas responde a pergunta que interessa:
"alguma máquina desta sala está diferente das outras?". Pega o caso que ninguém enxerga sozinho — a
atualização que falhou no meio, a estação desligada no dia da rodada, a que voltou para a versão anterior.
O preço é assumido: sala inteira parada numa versão antiga não destaca ninguém, e sala de um computador só
nunca destaca.

> ⚠️ **A comparação é numérica, segmento a segmento — nunca alfabética.** `'1.0.10' < '1.0.7'` é verdadeiro
> em ordem de texto: a comparação ingênua elegeria `1.0.7` como topo da sala e marcaria a máquina **mais
> atualizada** como a atrasada, mandando o técnico ao computador errado. Segmento ausente ou não numérico
> (um sufixo `-beta`) vale zero: o campo é texto livre do lado do cliente, e o pior desfecho aceitável é o
> destaque não aparecer — destacar a máquina errada, não.

> ⚠️ **`appVersionReportedAt` não é "vista por último".** A versão só viaja no `register`, isto é, a cada
> conexão. Estação semanas no ar sem cair mantém um carimbo antigo estando perfeitamente saudável. Por isso
> o tooltip diz "informada em", e quem responde quem está conectado agora continua sendo
> `GET /computers/online/:roomId`.

**`v—` não é erro, e por isso ocupa lugar em vez de sumir.** Ou a estação não conectou desde que a `api-fr`
passou a guardar, ou roda um Desktop antigo que não manda o campo (a API ignora o envio ausente e não grava
nada). Esconder a linha faria o cartão sem informação parecer um cartão sem problema, e a leitura de
relance passaria a depender de perceber uma ausência — que ninguém percebe.

O âmbar reaparece aqui, e o cartão já o usa para "offline". A sobreposição é aceita: uma estação pode estar
muda **e** atrasada, são dois avisos legítimos sobre a mesma máquina, e o rótulo ao lado do ponto pulsante
diz qual é qual. **Nada disso trava ação alguma** — máquina desatualizada continua servindo advogado, e
travar a operação por causa de um número inventaria um problema maior que o observado.

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

### Recuperação de senha (`/auth/forgot-password` e `/auth/reset-password`)

O caminho de quem está **do lado de fora**: sem sessão, sem senha e sem como pedir nada ao painel. Quem está
dentro troca a senha em `/profile`; aqui só se chega pelo link da tela de login ou pelo e-mail.

São duas telas e duas rotas públicas da API:

| Tela | Rota da API | Corpo | Teto |
| --- | --- | --- | --- |
| `/auth/forgot-password` | `POST /employees/password-recovery` | `{ cpf, email }` | 5 por 15 min por IP, **janela reinicia a cada excesso** |
| `/auth/reset-password` | `POST /employees/reset-password` | `{ code, password, confirmPassword }` | 10 por 10 min por IP |

O código tem **6 caracteres `[A-Z0-9]`** e vale **5 minutos**. Cada solicitação apaga os códigos anteriores
daquele funcionário: o último e-mail é sempre o que vale.

**As duas caixas andam em direções opostas, e isso é proposital.** O código sobe para caixa-alta
(`maskRecoveryCode`) porque a API o procura com `findUnique({ code })`, comparação sensível a maiúsculas —
código colado em minúsculo voltaria como inválido. Já o **e-mail vai como foi digitado**, sem
`.toLowerCase()`: a `api-fr` grava o endereço do cadastro só com `.trim()` e o procura pelo mesmo
`findUnique`, então normalizar no front recusaria justamente quem foi cadastrado com maiúscula. A regra é
espelhar o backend, não "arrumar" o dado.

**O `?code=` do e-mail é higienizado antes de encostar no campo.** O e-mail traz
`${WEB_URL}/auth/reset-password?code=...`; o Server Component faz `trim`, sobe a caixa e só aceita o valor
se ele casar com o formato — qualquer outra coisa vira campo vazio. Um código quase-certo plantado por link
adulterado faria o funcionário enviar um formulário condenado e gastar tentativa da cota. Por isso
`isRecoveryCode` mora em `src/utils/masks/recovery-code.ts`, e não no arquivo do schema: o schema arrasta o
`react-hook-form`, que não roda no servidor.

**Enviado o código, o formulário dá lugar a um painel de confirmação** no mesmo endereço — não a uma rota
nova. Rota nova exigiria carregar CPF e e-mail por query string, ou seja, dado de identificação no histórico
do navegador de uma máquina de balcão. O par fica em memória (`sentTo`), que é exatamente o que o reenvio
precisa e nada além.

**O reenvio trava por 60 segundos**, e o contador é derivado de um instante absoluto (`cooldownEndsAt`), não
decrementado a cada tique — aba em segundo plano ou notebook suspenso engasgam o `setInterval`, e um
contador que só subtrai ficaria parado em "42s" sem nunca liberar o botão. A trava é contra o erro honesto
(clicar de novo achando que não foi): como a janela da API reinicia a cada excesso, dois cliques nervosos
trancariam o funcionário justamente quando ele mais precisa do código. Proteção real continua sendo o rate
limit da API — recarregar a página zera o contador do cliente.

**O foco depois do erro é escolhido pela mensagem.** A API recusa a redefinição por dois motivos muito
diferentes — código inválido/expirado e senha igual à anterior — e devolve os dois como `400` sem nada que
os distinga além do texto. O formulário lê a mensagem: se fala em "código", o cursor vai para o código;
senão, para a senha. Acoplamento ao texto do backend, assumido: se a API reescrever a frase, o foco cai no
campo errado e nada mais — a mensagem completa continua no aviso do topo. O caminho definitivo é um código
de erro no corpo do `400`.

> ⚠️ **Redefinir a senha não expulsa ninguém.** Como na troca pela tela de conta, a `api-fr` só regrava o
> `passwordHash`: um JWT já emitido segue válido até expirar (1 dia). Quem recuperou o acesso por
> desconfiança **não** derruba a sessão de quem estava dentro.

> Em `NODE_ENV != production` a `api-fr` manda o e-mail para um destinatário fixo no código do backend, não
> para o e-mail do funcionário. É comportamento da API — anotado aqui para não assustar em desenvolvimento.

> A API responde igual para par inexistente e par trocado (`400 "Credenciais inválidas."`). Bom para
> privacidade, ruim para diagnóstico: a tela repassa a mensagem da API sem inventar detalhe que ela não deu.

**O `metadata` desceu do layout para as páginas.** `(public)/auth/layout.tsx` fixava `title: 'Entrar'`; com
três rotas debaixo dele, as telas de recuperação herdariam esse rótulo na aba e no histórico. Cada página
declara o próprio título.

---

### Salas de liberação (`/admin/rooms`)

Primeira área administrativa a existir de fato. A tela tem o cabeçalho
da área, um painel lateral (`Sheet`) com o formulário de nova sala e a **tabela das salas cadastradas**, com
busca por nome ou descrição, paginação, edição em diálogo e a alternância entre ativa e inativa. O ciclo da sala está
fechado: criar, ver, corrigir e tirar de operação sem sair da tela.

Sala é a raiz do modelo: computador pertence a uma sala, funcionário é vinculado a salas, sessão de advogado
acontece dentro de uma sala. Sem esta tela, todo ambiente novo começava por um `INSERT` na mão.

**Quatro campos, duas regras de negócio:**

| Campo | Validação do front | Na `api-fr` |
| --- | --- | --- |
| `name` | 3 a 60 caracteres | obrigatório; gravado em **maiúsculas** |
| `uf` | uma das 27 siglas, por `<Select>` | opcional no `POST` com default `'MA'`; opcional **sem** default no `PATCH` |
| `standardTime` | inteiro de **15 a 480 minutos** | opcional; qualquer inteiro positivo |
| `description` | até 200 caracteres | opcional; em branco vira `undefined`, não string vazia |

O `standardTime` **é a cota diária** de cada advogado naquela sala. Erro de digitação aqui não quebra tela
nenhuma — muda em silêncio quanto tempo cada advogado tem no dia inteiro. Daí duas defesas: o teto de 480
minutos (decisão **do front**; a API aceita mais) e a leitura em horas ao lado do campo, com
`aria-live="polite"`, para `180` ser conferido como `3h` sem aritmética mental.

#### A UF decide quem recebe atualização — e erra em silêncio

A `uf` da sala não é campo de relatório. O **Desktop** a recebe no registro do canal WebSocket
(`websocket/handler.ts` seleciona `room: { select: { name: true, uf: true } }`) e a grava em disco; é ela que
decide se aquela máquina entra numa publicação de versão dirigida a um estado. Antes da coluna existir, a
sigla era digitada à mão pelo instalador do Desktop, máquina por máquina.

O modo de falha é o pior possível: **mudo**. Uma sala do Maranhão marcada como `MT` é cadastro perfeitamente
válido — a API aceita, a tela aceita, nada reclama. A estação apenas deixa de casar com a onda dirigida ao
estado dela, e ninguém percebe até uma sala inteira estar parada numa versão antiga. Daí as três decisões:

- **`<Select>` das 27 siglas, nunca texto livre** (`constants/ufs.ts`). É a razão de o campo existir. O
  `z.enum(UFS)` no schema do formulário é a rede embaixo, para o caso de o campo chegar vazio por reset.
- **Cada opção mostra a sigla e o nome por extenso** (`UF_NAMES`). As siglas que mais se confundem — `MA`,
  `MT`, `MS` — são as dos vizinhos geográficos; `MA  Maranhão` no item torna a escolha errada visível na hora
  de escolher, e não meses depois. Para a API vai só a sigla.
- **A sigla aparece colada ao nome na listagem** (`SALA GTI · MA`), e não em coluna própria. É a única tela em
  que uma sala marcada no estado errado pode ser flagrada, e o erro se percebe lendo a sala inteira de uma
  vez: "essa sala não é de lá".

> ⚠️ **No `PATCH`, a `uf` só viaja quando muda.** É o único campo do formulário de edição em que *ausente*
> tem significado: a rota monta `...(uf && { uf })` e não tem default, então não mandar é o que diz "mantém".
> Mandar `''` ou `null` volta `400` do enum. Os outros três campos continuam indo sempre — regime misto no
> mesmo formulário, registrado aqui para não parecer descuido.

> ⚠️ **A troca de UF não alcança as máquinas já ligadas.** O Desktop só descobre a UF nova no próximo
> registro do canal. O formulário de edição avisa disso ao detectar a troca — sem esse texto, a mudança
> pareceria valer imediatamente para as estações conectadas naquele momento.

> ⚠️ **A lista de UFs é espelhada no front.** Não existe rota que devolva as siglas aceitas, e criar uma
> seria uma requisição para buscar uma constante que não muda. O custo é manter `constants/ufs.ts` em
> sincronia com `utils/validations/uf.ts` da `api-fr`; o sintoma da divergência seria uma sigla oferecida e
> recusada com `400`.

> ⚠️ **Ordem de deploy.** A `api-fr` com a migração precisa subir **antes** do painel. Com a API antiga, a
> `uf` no `POST` é descartada em silêncio pelo strip do Zod, mas o `get-all` volta sem o campo: a listagem
> apresenta o separador sem sigla e a edição abre com o seletor vazio, travando no envio. Degrada, não
> quebra — mas é uma janela de confusão evitável.

> ⚠️ **A busca da tabela não alcança a sigla.** A UF chegou a entrar no filtro e **saiu** na change
> `esqueleto-e-buscas-das-tabelas`: com duas letras ela casa com meia tabela — `MA` acha "SALA MANHÃ" e
> "SALA DE REUNIÃO" — e alargava o resultado em vez de recortá-lo. Auditar por estado hoje é rolar a lista;
> um filtro próprio, separado da busca de texto, ficou registrado como próximo passo.

#### A unicidade da sala é do `slug`, não do nome

A `api-fr` deriva o identificador com `slugify(name, { lower: true, strict: true })` e recusa com `400`
(`"Sala com esse nome já cadastrada."`) quando ele colide. Quem digita "Sala 1" e "Sala-1" acha que criou
duas salas; a API vê `sala1` nas duas vezes e recusa a segunda falando de um **nome** que o administrador
acabou de conferir.

Por isso o formulário mostra a prévia do identificador embaixo do campo de nome, enquanto se digita
(`utils/masks/slug.ts`). A máscara imita as etapas do `slugify` estrito de propósito — **inclusive o descarte
do hífen digitado**, que faz "Sala-1" virar `sala1`. Prévia que embeleza é pior que nenhuma: promete um
identificador que o banco não vai ter.

> O `slug` **não viaja no corpo** da requisição: a rota não lê esse campo. A prévia é espelho, não contrato —
> se a API trocar de estratégia de slug, ela passa a mentir sem nada quebrar.

#### O que o formulário protege

- **Fechar o painel lateral durante o envio é bloqueado.** O `reset()` limparia o formulário com a chamada
  de pé, e o aviso de erro chegaria a uma tela sem os dados para corrigir — mesmo cuidado do diálogo de
  troca de senha.
- **Botão desabilitado enquanto envia.** Dois cliques disparavam dois `POST`; o segundo voltava como "sala já
  cadastrada" logo depois de a sala ter sido criada com sucesso.
- **Erro da API é o texto que aparece** (`getApiErrorMessage` + `getRetryAfterInSeconds`), com o foco de
  volta no campo de nome — é o campo que a API recusa na prática.
- **`queryKeys.getRooms()` invalidada** após o cadastro: a sala nova aparece no seletor do painel sem
  recarregar a página.

#### A tabela é primitiva do design system

`components/ui/data-table/` não pertence à tela de salas. As cinco áreas administrativas têm a mesma
anatomia — buscar, paginar, agir na linha —, e é copiando um arquivo de `_components/` que os rodapés
começam a divergir entre telas. A primitiva recebe `columns`, `data`, `isLoading` e `emptyMessage`; a tela
só descreve as colunas (`rooms-columns.tsx`).

O TanStack Table **v9** exige declarar as features (`tableFeatures({...})`), e o tipo delas atravessa
`ColumnDef` e `ReactTable`. Daí o arquivo `data-table-features.ts` separado: é o `DataTableFeatures` que as
colunas de cada tela importam — inclusive o `columnMeta` (`className`, `skeletonClassName`,
`skeletonAnchorClassName`) que alinha a coluna e dá o formato do esqueleto de carregamento.

- **Esqueleto no formato da tabela, não spinner.** Um spinner centralizado troca a moldura duas vezes: some,
  entra a tabela, os cabeçalhos saltam. O placeholder usa a mesma grade de colunas.
- **Quem sustenta a altura é a caixa, não o traço.** A linha do esqueleto mede `h-5` — a altura de linha do
  `text-sm` — e o traço dentro dela mede `h-3`. Com o traço mais baixo *e* a caixa junto, cada linha do
  carregamento ficava 4px mais curta que a definitiva e a tabela encolhia 40px quando os dados chegavam;
  com o traço da altura inteira, o placeholder virava uma tela cinza competindo com o conteúdo que anuncia.
  A separação resolve os dois (change `esqueleto-e-buscas-das-tabelas`).
- **A coluna-âncora tem esqueleto composto.** As três tabelas começam com ladrilho de 32px e duas linhas de
  texto, e é essa célula que define a altura da linha (56px contra 44px das demais). A coluna se declara
  âncora preenchendo `skeletonAnchorClassName` — `rounded-full` em colaboradores, `rounded-md` em salas e
  computadores — e ganha círculo/ladrilho mais duas barras. Âncora que esquecer a chave volta a encolher a
  linha.
- **Quatro linhas de esqueleto, não a página inteira.** O padrão era `skeletonRows = pageSize`; como o total
  de registros só se conhece na resposta, imitar a página é chute. Quatro comunicam "é uma tabela e está
  carregando" pela metade do espaço — e a tabela crescer quando os dados chegam não empurra para cima o que
  já estava lido, que era o problema do encolhimento.
- **O rodapé tem ramo de carregamento.** Sem ele, anunciaria "Total: 0 registros" para uma consulta que
  ainda nem respondeu.
- **A contagem vem de `getPrePaginatedRowModel()`** — `getRowModel()` já veio fatiado pela página atual.
- **`getPageCount()` devolve `0` na lista vazia**, o que imprimiria "Página 1 de 0"; o rodapé força o piso
  em 1.

> **Busca e paginação são do cliente.** `GET /rooms/get-all` devolve tudo de uma vez, sem paginação nem
> filtro — a mesma lacuna já registrada para funcionários e computadores. O filtro roda num `useMemo` sobre
> `data.rooms`, e o `?? []` mora **dentro** dele: o TanStack memoiza o row model pela identidade de `data`, e
> um `[]` literal no atributo seria um array novo a cada render. Como o modelo central observa essa
> identidade, trocar a busca já devolve a paginação à primeira página sozinho. A busca cobre **nome ou
> descrição** — os dois campos que a célula da sala apresenta.

#### A linha mostra a equipe e o parque

Duas colunas alimentadas por dado que `GET /rooms/get-all` já devolvia e a tela descartava:

- **Equipe** — fileira de avatares dos colaboradores da sala, com **os mesmos rostos e as mesmas cores** da
  tabela de colaboradores. A cor é o que liga a mesma pessoa entre as duas telas. Excedente vira contador
  com os nomes na dica. Antes, saber quem responde por uma sala exigia abrir `/admin/employees` e cruzar na
  mão.
- **Estações** — a contagem de máquinas, mais um selo âmbar quando alguma está em manutenção.

A manutenção entra e a **ocupação não**, de propósito: manutenção é condição de inventário, que é o assunto
desta tela, enquanto ocupação é estado do momento, muda enquanto se olha e já tem casa no painel de
operação. As duas juntas transformariam a listagem administrativa num painel pela metade.

> ⚠️ **A equipe é a que está em exercício, não o histórico.** A `api-fr` filtra dessa lista os colaboradores
> inativos (`where: { employees: { inactive: null } }`), porque desligar alguém é soft delete e o vínculo
> continua na tabela de junção. Um desligado some daqui sozinho, sem que a tela faça nada.

> ⚠️ **Sala sem máquina alguma diz isso explicitamente.** O painel de operação simplesmente não desenha
> cartão para ela — e ausência de cartão se lê como "está tudo certo aqui". Esta é a única tela onde a sala
> vazia aparece como fato.

#### As três tabelas falam a mesma língua

Salas, computadores e colaboradores nasceram em momentos diferentes e cada uma resolvia identidade e
espaçamento à sua maneira. O alinhamento vive em `components/ui/table.tsx` e nas colunas de cada tela:

- **Respiro.** A célula passou de `p-2` para `px-4 py-3`, e o cabeçalho de `h-10 px-2` para `h-11 px-4`. O
  aperto era **horizontal**: 8px de cada lado dão 16px de calha entre colunas, e a primeira encostava na
  borda. Custo aceito: as células são `whitespace-nowrap`, então a tabela rola horizontalmente mais cedo em
  tela estreita — o contêiner tem `overflow-x-auto`, então rola em vez de quebrar.
- **Célula de identidade.** Cada linha abre com âncora visual, identificador e informação secundária
  apagada logo abaixo: avatar + nome + e-mail no colaborador, ladrilho + `ESTAÇÃO-01` + descrição na
  máquina, ladrilho + nome · UF + descrição na sala. Computadores deixou de gastar duas colunas com número
  e descrição — ninguém procura a descrição sem antes achar a estação.
- **A âncora da sala e da estação é neutra.** O estado tem coluna própria; colorir o ladrilho diria a mesma
  coisa duas vezes. Só o avatar do colaborador é colorido, e por outro motivo.

`getAvatarColor(id)` (em `utils/index.ts`) dá ao avatar sem foto uma cor estável de uma paleta de oito.

> ⚠️ **A semente é o `id`, não o nome.** A cor existe para reencontrar a mesma pessoa correndo o olho pela
> lista — e entre telas, porque a equipe da sala usa as mesmas cores. Se derivasse do nome, corrigir
> "Mariana Costa" para "Mariana Costa Silva" trocaria a cor dela. Repetição a partir da nona pessoa é
> esperada e inofensiva: a cor é pista, nunca identidade — quem identifica é o nome ao lado.

> ⚠️ **As classes da paleta estão escritas por extenso.** O Tailwind lê o código como texto: um
> `bg-${cor}-500/15` montado em runtime não existiria no CSS gerado.

#### Ativar e inativar são dois componentes, não um botão com `if`

A `api-fr` não exclui sala: o que existe é `PATCH /rooms/activate/:id` e `/rooms/deactivate/:id`. Rotas
diferentes, mensagens diferentes e — o que decide a separação — **níveis de confirmação diferentes**.

- **Inativar pede confirmação** e o diálogo diz quantos computadores deixam de aparecer para os funcionários,
  com o plural certo, e afirma que nada é apagado.
- **Reativar vai direto.** Não há consequência a avisar e a ação é desfeita pelo botão ao lado; confirmar ali
  seria cerimônia sem conteúdo.
- **Botão desabilitado durante a chamada** nos dois sentidos. Sem isso, o duplo clique dispara dois `PATCH` e
  o segundo volta como "Sala já está inativa." — erro para uma ação que acabou de dar certo.
- **O diálogo resiste ao fechamento** enquanto a chamada está de pé: fechar esconderia a sala, e o aviso de
  erro chegaria a uma tela sem o contexto do que se tentava fazer.
- **`queryKeys.getRooms()` invalidada** depois de cada alternância — a mesma chave do seletor do painel.

O status aparece como `Badge` (destrutivo na inativa, contorno com ponto pulsante na ativa) e não como cor da
linha: sala fora de uso é estado normal, não falha, e listrar a tabela de vermelho competiria com a leitura
das outras colunas.

> ⚠️ **A cor do interruptor descreve o estado, não a ação** — verde na sala ativa, vermelho na inativa. Quem
> lê a cor como consequência do clique entende invertido; quem diz a ação são o tooltip e o diálogo. A coluna
> de status já dá o mesmo estado por escrito.

#### Editar é diálogo, cadastrar é painel lateral

`PATCH /rooms/update/:id` é `ADMIN`-only e aceita **corpo parcial** — `name`, `uf`, `standardTime` e
`description` são todos opcionais. O formulário de edição (`update-room.tsx`) repete os quatro campos do
cadastro, com a mesma prévia de identificador e a mesma leitura do tempo em horas, mas em `Dialog` e não em
`Sheet`.

A escolha não é estética. Cadastrar é composição: o administrador chega com a sala na cabeça e preenche do
zero, e o painel lateral deixa a tela livre ao lado. Editar é correção pontual disparada **de dentro de uma
linha da tabela** — o diálogo centralizado mantém a linha visível ao redor em vez de jogar a leitura para a
borda.

- **Clique fora não fecha** (`disablePointerDismissal` do Base UI). O formulário de edição abre preenchido, e
  a tabela ocupa a tela atrás dele: um clique torto na linha de baixo descartaria tudo, sem aviso e sem
  desfazer. **ESC e Cancelar continuam fechando** — modal sem saída pelo teclado é barreira de
  acessibilidade, não proteção.
- **Os campos são recarregados da sala a cada abertura** (`reset`), e não zerados no fechamento. Zerar no
  fechamento faria o formulário piscar com os valores antigos durante a animação de saída; não resetar em
  lugar nenhum faria um rascunho abandonado reaparecer na abertura seguinte **parecendo dado salvo**.
- **Salvar exige alteração** (`isDirty`) e uma só (`isPending`). Editar um campo e devolvê-lo ao valor
  original desarma o botão de novo, porque não há o que salvar. Sem a trava do envio, o segundo `PATCH` de um
  duplo clique poderia voltar como "Sala com esse nome já cadastrada." — a sala colidindo com o nome que ela
  mesma acabou de receber.

> ⚠️ **A descrição tem três estados, não dois.** A rota testa `description !== undefined`: omitir mantém o
> que está gravado, `null` limpa e `''` **grava uma descrição em branco**. Como o campo de texto devolve `''`
> quando esvaziado, o envio converte com `description || null` — e o tipo em `server/rooms/update.ts` é
> `string | null` justamente para o compilador cobrar essa distinção de quem chamar a função.

> ⚠️ **O nome aparece em caixa alta no formulário.** A `api-fr` grava `name.toUpperCase()` no cadastro e na
> edição, então o campo mostra o que está no banco. Normalizar isso é decisão da camada de apresentação — o
> formulário precisa mostrar o valor real, não uma versão embelezada do que a API guarda.

> ⚠️ **Renomear pode ser recusado depois de preenchido.** A colisão de `slug` só é conhecida na resposta: a
> prévia do identificador mostra o que vai ser gravado, mas não sabe quais já existem. E **duas mãos editando
> a mesma sala se sobrescrevem** — não há verificação de versão no corpo, a última gravação vence em
> silêncio.

> ⚠️ **Duas estratégias de data no mesmo projeto.** A coluna de criação usa `date-fns`; a grade do painel usa
> `Intl.DateTimeFormat` (`computer-card.tsx`). Se `date-fns` não render mais que uma coluna, a dependência
> sai.

#### `ESTAÇÃO-01` no lugar de `PC-01`

O rótulo do cartão da grade (`panel/_data/computer-view.ts`) é lido em voz alta no balcão — "vá para a
estação 3". `PC` é abreviação de manual técnico. Mudou o vocabulário, não o dado: o número continua vindo de
`computer.number`. A ilustração da landing (`dashboard-preview.tsx`) ainda mostra `PC-01`; é peça de
marketing, com nomes de sala fictícios, mas agora diverge do produto.

---

### Computadores de liberação (`/admin/computers`)

Segunda área administrativa. A tela abre com a tabela já montada — diferente de `/admin/rooms`, que nasceu
só com o formulário e ficou um ciclo inteiro sem mostrar ao administrador o que ele acabou de cadastrar.

O computador é o objeto que o **Desktop** conhece. Ele não pede liberação por número nem por descrição: pede
pelo `macCode`. Um MAC digitado errado não quebra tela nenhuma — e é exatamente esse o problema. A máquina
aparece normalmente na grade do painel, porque a grade vem de `/rooms/get-all` e essa rota não tem como saber
se o endereço confere. O que nunca acontece é a conexão: o Desktop daquela máquina entra no WebSocket com o
MAC **real**, que não corresponde a registro nenhum, e por isso ela jamais aparece em
`GET /computers/online/:roomId`. A grade a marca como offline e o botão **Liberar fica desabilitado**
(`computer-card.tsx`).

Ou seja: a estação nasce inoperante e continua assim até alguém desconfiar do cadastro. O funcionário não
"atende uma máquina fantasma" — ele vê a máquina, tenta liberar e não consegue, sem que nada na tela aponte
para o MAC. É o campo mais frágil desta tela e o que menos avisa quando está errado.

**Quatro campos, duas regras do servidor:**

| Campo | Validação do front | Na `api-fr` |
| --- | --- | --- |
| `roomId` | `cuid2`; só salas **ativas** no seletor | obrigatório |
| `number` | inteiro ≥ 1, sugerido como `maior + 1` da sala | **único por sala** — colisão volta `400` |
| `description` | 1 a 50 caracteres | **única por sala**; gravada em **maiúsculas** |
| `macCode` | 12 dígitos hexadecimais, qualquer separador | **único globalmente** — colisão volta `400` |

#### Máscara e schema fazem coisas diferentes

`utils/masks/mac-code.ts` age **a cada tecla**: descarta o que não é hexadecimal, corta em 12 dígitos, sobe
para maiúscula e agrupa de dois em dois com hífen. É o que mantém o campo legível durante a digitação e o que
impede o dedo errado de entrar. O `maxLength={17}` do campo é 12 dígitos mais 5 hífens.

`utils/schemas/mac-code.ts` age **no envio** e resolve outro problema: MAC é escrito de várias formas por aí
— `00:1A:2B:3C:4D:5E`, `001a.2b3c.4d5e`, com espaço, sem nada. Um endereço colado de um inventário externo
não pode ser recusado por causa do separador. O schema normaliza para os 12 hexadecimais, valida, e só então
reaplica o formato com hífen que a API grava. Colar e digitar chegam ao mesmo lugar.

#### O número é único por sala, então a sala escolhe o número

`POST /computers/create` recusa com `400` quando o `number` repete **dentro da mesma sala** — e o
administrador não tem como saber de cabeça quais números aquela sala já usou. Trocar a sala no seletor
preenche o campo com `maior + 1` e lista abaixo os números em uso.

É `maior + 1` e não o primeiro buraco de propósito: quem cadastra a quinta máquina espera o 5, não o 3 que
sobrou de uma exclusão. A numeração fica esparsa; o comportamento fica previsível.

> O `setValue` vai com `shouldValidate`. Sem isso, a mensagem de erro de um envio anterior ficava na tela
> embaixo do campo que a troca de sala acabou de preencher com um valor válido.

#### Só sala ativa entra no seletor

Sala inativa não recebe liberação. Cadastrar máquina nela é criar inventário morto — some do painel e o
administrador só descobre depois. O seletor filtra por `inactive === null`; não havendo nenhuma sala ativa, o
seletor e o botão de envio caem juntos, com o motivo abaixo do campo em vez de um formulário que não vai a
lugar nenhum.

#### Manutenção vence "em uso" na coluna de situação

Os dois estados são independentes no banco: uma máquina pode ter `maintenance` preenchido e `inUse` ainda
`true` de uma sessão anterior. Mostrar "Em uso" nesse caso manda o balconista tentar encerrar uma sessão que
não está de pé. A ordem é: **manutenção → em uso → disponível**.

> A listagem **mostra** a manutenção, mas não a alterna. Quem faz isso é a grade do painel — e o
> `refreshBoard` passou a invalidar `queryKeys.getComputers()` para as duas telas não divergirem. Como o
> painel é operado por `MEMBER` e `/computers/get-all` é `ADMIN`-only, invalidar uma query que não está
> montada não dispara request nenhum: não há risco de `401`.

#### A exclusão não é a da sala

Sala tem inativação (soft delete). Computador **não**: `DELETE /computers/delete/:id` apaga o registro e leva
junto, em cascata, o histórico de sessões (`computer_sessions`) e as impressões (`printers`) daquela máquina.
Um clique numa linha de tabela é barato demais para isso — daí a confirmação por digitação da descrição, no
lugar do "tem certeza?". A conferência ignora caixa e espaço nas pontas: o atrito serve para o administrador
reler o nome da máquina, não para brigar com o teclado. Fechar o diálogo limpa o campo, senão reabrir já
viria confirmado.

Máquina **em uso** tem a exclusão bloqueada — a API recusa com `400`, porque a sessão do advogado precisa ser
encerrada antes. O botão usa `aria-disabled`, não `disabled`: botão desabilitado não dispara `hover`, e o
tooltip é justamente o que explica por que a ação está fora do ar.

#### Editar corrige o MAC sem apagar o histórico

`PATCH /computers/update/:id` é `ADMIN`-only e aceita corpo **parcial** — `macCode`, `number`, `description`
e `roomId`, todos opcionais. O botão de editar abre um diálogo no mesmo arranjo do cadastro
(`update-computer.tsx`), com `disablePointerDismissal` como em `/admin/rooms`.

É a única forma de consertar um MAC errado sem passar pela exclusão, que levaria o histórico de sessões e as
impressões junto.

Duas diferenças em relação ao cadastro, e as duas existem por causa da API:

- **A sala atual entra no seletor mesmo inativa.** A API só verifica que a sala de destino existe, não que
  está ativa — barrar sala inativa é decisão desta tela. Mas filtrar sem exceção deixaria sem valor o seletor
  da máquina que está justamente numa sala desativada: o campo abriria vazio, o `isDirty` marcaria uma
  mudança que ninguém fez, e o formulário pareceria corrompido antes de o usuário tocar em nada.
- **Os números em uso não incluem os da própria máquina.** A API compara com `id: { not: id }`; listar o
  próprio número como ocupado mandaria trocar um valor que já é válido.

> ⚠️ **A edição não recusa máquina em uso** — a exclusão recusa. Trocar o MAC com sessão aberta desgarra a
> estação até o Desktop reconectar com o endereço novo: é exatamente o efeito desejado quando o MAC estava
> errado, e um estrago quando estava certo. Só quem opera sabe qual é o caso, então a tela **avisa** no
> diálogo em vez de bloquear.

> ⚠️ **Busca e paginação rodam no cliente.** A paginação é a do `DataTable` (10 por página, com o rodapé de
> sempre), igual à de `/admin/rooms`. Quem não pagina é a **API**: `GET /computers/get-all` devolve o
> inventário inteiro e aceita só `roomId` e `description` como filtro, sem cobrir **nome** de sala nem
> **MAC**. Como se procura das três formas ("todas as máquinas da Sala 2", "aquela COMPUTADOR 03" e o MAC
> copiado da configuração do Desktop), a lista vem num request só e o filtro é aplicado em memória. Com
> inventário grande, o que pesa é o transporte, não a tabela.

#### O código MAC é a chave de pareamento

É por ele que o Desktop se registra no WebSocket, e o servidor casa **byte a byte**. Por isso a coluna o
trata como ficha técnica, não como texto corrido:

- **`font-mono`, e não `tabular-nums`.** O código tem letras além de números, e `tabular-nums` só alinha
  dígitos — a coluna ficava serrilhada. Monoespaçada alinha a coluna inteira, que é o que permite conferir
  caractere a caractere.
- **Exibido verbatim.** A `api-fr` guarda o campo como `z.string()` opaca e única, sem formato imposto. Um
  `uppercase` cosmético mostraria na tela algo diferente do que está gravado — justo onde alguém compara com
  a configuração da estação para descobrir por que ela não conecta.

Ao lado dele, a coluna **Desktop** mostra a última versão que a estação informou. As duas são companheiras:
o MAC diz com qual máquina o Desktop deveria falar, a versão diz se ele chegou a falar. Estação cadastrada e
sem versão é o sintoma de instalação que nunca subiu.

> ⚠️ **Ausência de versão não é erro**, e o carimbo não é "vista por último". Sem versão significa que a
> estação não conectou desde que a `api-fr` passou a guardar o dado, ou que o envio está desligado na
> configuração local dela. E a versão só trafega no `register` do WebSocket, isto é, a cada conexão: máquina
> que não cai há semanas mantém carimbo antigo **estando no ar**. Quem responde "está online agora" é
> `GET /computers/online`.

> ⚠️ **A colisão de `number` continua possível.** A sugestão do próximo livre reduz a chance, mas duas abas
> cadastrando na mesma sala ainda colidem — quem recusa é o `400`.

---

### Colaboradores (`/admin/employees`)

Terceira e última área administrativa, e a que fechou o ciclo por último: cadastra, lista, vincula salas no
próprio cadastro, **edita** e **ajusta os vínculos pela listagem**.

Até esta tela, criar uma conta do painel só era possível direto no banco. A única conta existente era a que
alguém inseriu à mão.

**Quatro campos, e o que a `api-fr` faz com cada um:**

| Campo | Validação do front | Na `api-fr` |
| --- | --- | --- |
| `name` | 3 a 60 caracteres | obrigatório, sem limite |
| `cpf` | máscara progressiva + dígitos verificadores; enviado só com os dígitos | **único** — colisão volta `400` |
| `email` | formato + caixa baixa | **único** — colisão volta `400` |
| `password` | mínimo de 8 caracteres | gravada com `hash`, e **enviada em texto por e-mail** |

O CPF reusa `maskCpf` e `cpfSchema` — os mesmos do login, deliberadamente. É a **credencial de acesso**: se
esta tela gravasse "123.456.789-09" onde o login procura "12345678909", criaria uma conta que o próprio
login não encontra.

#### A recusa aponta o campo, não o toast

Salas e computadores mandam a mensagem de `400` para o toast, e lá isso basta porque há um candidato óbvio
ao conflito. Aqui há **dois** campos únicos, e um toast dizendo "Já existe um funcionário cadastrado com
esse CPF." obriga o usuário a traduzir a frase para saber onde mexer, com o formulário inteiro preenchido na
frente dele.

`resolveDuplicatedField` procura `cpf` e `mail` na mensagem da API e devolve o campo, que recebe `setError`
e `setFocus`. Quando nada casa, cai no toast geral. A frase não aparece nos dois lugares ao mesmo tempo.

> ⚠️ **A identificação depende do texto da mensagem.** Se a `api-fr` reescrever essas frases, o erro deixa
> de apontar o campo e vira aviso geral. Degrada, não quebra.

#### A senha é digitada por quem não é o dono dela

O administrador escolhe a senha inicial, e a `api-fr` a envia **em texto** no e-mail de boas-vindas, junto
com o link do login. É o desenho da API, não uma escolha desta tela.

Duas consequências no formulário:

- **Alternância Mostrar/Ocultar**, como no login. Aqui ela pesa mais: quem digita não vai poder reler o
  valor em lugar nenhum depois do cadastro.
- **`autoComplete="new-password"`**. Com `off` ou `current-password`, o gerenciador do navegador ofereceria
  a credencial do **administrador logado** num campo cujo conteúdo vai por e-mail para outra pessoa.

Não há confirmação de senha, e a ausência é deliberada: em `change-password` e `reset-password` quem digita
é o dono da senha, e o erro de digitação o tranca para fora. Aqui o valor vai por e-mail exatamente como foi
escrito — um engano não tranca ninguém, o colaborador recebe a senha errada e entra com ela.

> ⚠️ **O `201` não é prova de que o e-mail saiu.** A rota registra a falha do provedor no log e responde
> `201` do mesmo jeito. Como a senha só existia naquela mensagem, o colaborador criado sem e-mail entregue
> depende do fluxo de esqueci-minha-senha. O toast de sucesso nomeia o endereço de destino porque um e-mail
> digitado errado passa por todas as validações — é um endereço válido, só não é o dela — e, sem listagem,
> esse é o único momento em que dá para notar.

#### O vínculo com salas entra no cadastro

Era a pendência registrada aqui: `POST /employees/link-with-rooms` é outra rota, e o cadastro respondia
`{ message }` **sem o `id`** do colaborador criado, então as duas chamadas não podiam ser encadeadas — para
vincular seria preciso recarregar a listagem inteira e procurar a pessoa pelo CPF.

A `api-fr` passou a devolver `employeeId` no `201` (change `atomic-employee-account-creation`), e o
formulário ganhou um combobox de seleção múltipla. Três regras do desenho:

- **É opcional.** `roomIds: []` significa "cadastra e pronto", e nenhuma segunda requisição sai. O vínculo é
  conveniência do cadastro, não requisito dele.
- **Só salas ativas são oferecidas**, porque `link-with-rooms` recusa sala inativa com `400`.
- **Não é atômico**, e isso é aceito: se a criação passa e o vínculo falha, o colaborador existe sem sala —
  estado válido e recuperável pela própria tela. O erro do vínculo é comunicado sem sugerir que o cadastro
  não aconteceu.

#### Editar corrige nome, e-mail e papel

`PATCH /employees/update/:id` aceita corpo **parcial** com `name`, `email` e `role`, e o painel de edição
(`update-employee.tsx`) monta esse corpo a partir de `dirtyFields`: só o que mudou viaja. Reenviar o e-mail
intocado faria a API revalidar unicidade de um dado que ninguém tocou, e ampliaria a janela para um `400`
sem relação com a edição em curso.

O painel é lateral, e não diálogo como em salas e computadores: as três ações desta tela convivem na mesma
linha, e a coerência que importa é a da própria tela — o cadastro daqui também é painel lateral.

- **O CPF aparece bloqueado.** A rota não o aceita. Escondê-lo faria a ausência parecer esquecimento;
  mostrá-lo travado, com a explicação no campo, responde a dúvida onde ela nasce. Corrigir CPF continua
  sendo operação de banco.
- **O papel entrou na tela pela edição.** O cadastro segue sem escolha (a rota de criação não lê `role`, e o
  Prisma aplica `@default(MEMBER)`), mas promover alguém a `ADMIN` **deixou de ser operação de banco**: é
  aqui.
- **O administrador não altera o próprio papel.** A `api-fr` permite; quem impede é a tela. Rebaixar-se tira
  o acesso à área administrativa na hora — inclusive a este painel, que seria o único caminho de volta.
- **Editando a si mesmo, `getProfile()` também é invalidado.** Nome e e-mail do usuário logado estão no
  cabeçalho: salvar a correção e continuar vendo o dado antigo faria duvidar de que gravou.

> ⚠️ **Ativar/inativar colaborador continua de fora.** `PATCH /employees/activate/:id` e `/deactivate/:id`
> existem e estão registradas nas rotas da API; a coluna Situação segue só exibindo.

#### As salas do colaborador se ajustam pela listagem

`manage-employee-rooms.tsx` abre com as salas atuais marcadas: marcar vincula, desmarcar desvincula, um
botão grava. O desenho inteiro é ditado pelo que as duas rotas recusam.

- **O envio é o delta, não a seleção.** `link-with-rooms` responde `400` — *"As salas X, Y já foram
  vinculadas ao funcionário."* — quando o corpo traz uma sala já vinculada. Mandar a seleção inteira
  derrubaria o salvamento em toda edição. O painel compara com `employeesRooms` e monta dois corpos
  disjuntos.
- **`link` roda antes de `unlink`.** As duas chamadas não compartilham transação. `link` é a que valida
  (sala inativa, sala inexistente, vínculo repetido) e a que costuma falhar; caindo ela primeiro, nada foi
  removido e o colaborador continua como estava.
- **Sucesso parcial é anunciado como tal.** Se o `link` passou e o `unlink` caiu, o estado no servidor é
  real e incompleto: o painel invalida as listas e avisa o que entrou e o que não saiu, em vez de fechar
  calado.
- **Sala inativa já vinculada continua na lista**, marcada como tal e desmarcável — o `unlink` não valida
  situação. Escondê-la faria o painel abrir sem um vínculo que existe, e salvar qualquer outra mudança a
  mandaria para o `unlink` sem ninguém ter pedido. Inativa **sem** vínculo não é oferecida, porque o `link`
  a recusa.
- **Os nomes das salas vêm de duas fontes.** Os vínculos atuais já chegam nomeados em `employeesRooms`; o
  catálogo (`GET /rooms/get-all`) só é buscado ao abrir, para oferecer as salas que faltam. Sem esse
  fallback o primeiro quadro mostraria marcadores em branco — e marcador vazio parece vínculo corrompido.

> ⚠️ **Não existe rota de sincronizar salas.** Ajustar vínculos custa duas requisições sem transação comum.
> A ordem escolhida torna a falha do primeiro passo inofensiva; a do segundo deixa o estado incompleto, e aí
> quem conta a verdade é o aviso.

#### A listagem

Tabela no mesmo `DataTable` das outras duas áreas: colaborador (avatar com iniciais coloridas, nome e
e-mail na mesma célula), CPF pontuado, papel, situação, data de criação e ações.

`GET /employees/get-all` é **ADMIN-only, não pagina e não aceita filtro algum** — a lista vem inteira e a
busca roda no cliente, cobrindo **nome ou CPF**.

> ⚠️ **A busca tira a pontuação antes de comparar.** A API guarda e devolve só os 11 dígitos, e a coluna
> exibe pontuado. Como o usuário digita o que está vendo, comparar os dois em bruto nunca acharia ninguém:
> "123.456" precisa encontrar o mesmo que "123456".

O papel ganha ênfase **por contraste, não por peso**: administrador em violeta com escudo, colaborador em
cinza achatado. Dois selos de mesmo peso lado a lado se anulariam — o olho veria "tem coisa nas duas linhas"
sem distinguir qual importa. O violeta foi escolhido porque a paleta do painel já tem recados atribuídos:
esmeralda é ativo, rosa é ocupado, âmbar é aviso. Papel não é estado nem alerta.

> ⚠️ **A listagem não mostra as salas vinculadas, de propósito.** O campo `employeesRooms` vem do servidor
> (change `list-employee-linked-rooms` na API) e alimenta o **painel de vínculos**, não a coluna: vínculo é
> coisa que se edita, não que se confere de relance. E o painel depende dele para calcular o delta.

#### Ativar e inativar o colaborador — o mesmo par das salas, com uma trava a mais

A coluna Situação existia desde a primeira versão da tabela, mas **nada na interface a produzia**: um
colaborador desligado continuava entrando no painel até alguém mexer no banco. `PATCH
/employees/activate/:id` e `/deactivate/:id` já estavam registradas na `api-fr`, ADMIN-only, respondendo
`{ message }`.

O desenho é o mesmo de salas — dois componentes, um por sentido; confirmação só ao inativar; botão
desabilitado durante a chamada para o duplo clique não virar um "Funcionário já está inativo." em vermelho
sobre uma ação bem-sucedida.

**O que salas não tinham: a trava de auto-inativação.**

A API recusa com `400` quem tenta inativar o próprio cadastro — e faz sentido, senão o administrador se
trancaria para fora do painel. Mas deixar a recusa chegar como toast transforma uma regra fixa numa
tentativa frustrada. A tela compara o id da linha com o do `getProfile()` (leitura de cache: o cabeçalho do
painel já buscou o perfil) e neutraliza o botão antes do clique.

> ⚠️ **`aria-disabled`, não `disabled`** — e o `onClick` guardado por `!isHimself`, para o `aria-disabled`
> não ser só cosmético. Botão `disabled` **não dispara hover** no Chrome, e o tooltip é justamente o que
> explica por que a ação sumiu; sem isso o botão ficaria apagado, mudo e sem motivo. É o mesmo padrão de
> `delete-computer.tsx` para a máquina em uso.

> ⚠️ **A confirmação não promete uma desconexão que não acontece.** O `inactive` é verificado em
> `core/employees/authenticate.ts`, na hora do **login** — o middleware de autenticação não o consulta. Um
> funcionário com o painel aberto continua navegando até o JWT expirar (1 dia). Escrever "ele perde o acesso
> agora" seria mentira verificável: bastaria o inativado apertar F5. O diálogo diz *"o bloqueio vale a partir
> do próximo acesso"*, e o efeito imediato depende de uma denylist de token na `api-fr` — a mesma lacuna que
> já afeta o logout e a troca de senha.

A confirmação também **conta quantas salas continuam vinculadas**. O medo de quem clica em algo destrutivo é
apagar junto o que estava ao lado; nomear o que fica responde isso antes da pergunta. Nenhum `unlink`
acontece, o histórico permanece, e reativar devolve tudo como estava.

Só `queryKeys.getEmployees()` é invalidada. O único cadastro que aparece no cabeçalho do painel é o do
próprio administrador — e ele não pode se inativar, então o perfil não tem como ficar velho.

> **Diferente de computadores, colaborador não se exclui.** Não há `DELETE /employees/:id` na `api-fr`:
> inativar é o que existe no lugar, e é soft delete como o das salas. A máquina, essa, apaga de verdade — e
> leva o histórico junto, por isso a confirmação dela exige digitar a descrição.

### Histórico de impressões (`/printers`)

Primeira tela fora da área administrativa desde o painel de operação, e a última das cinco áreas que a
sidebar prometia e que ainda caía na 404.

O caso de uso é de balcão: o advogado envia o arquivo pela estação e volta ao guichê pedindo a impressão.
Quem atende precisa saber **quem** imprimiu, **de qual máquina**, **quando**, e chegar ao arquivo.

**Uma rota só, `GET /printers/get-all/:roomId?`**, com o `roomId` opcional no caminho. A resposta já vem
ordenada da impressão mais recente para a mais antiga e traz, por linha, o advogado, a sala, o computador e
o `fileUrl`.

#### O escopo por papel não é reimplementado aqui

A `api-fr` resolve o escopo dentro da própria consulta: `ADMIN` enxerga todas as salas, `MEMBER` só aquelas
em que está vinculado (`computerWhere` em `core/printers/get-all.ts`). Sem `roomId`, a rota devolve
exatamente o que aquele funcionário pode ver — e é isso, e nada mais, que a opção "Todas as salas" usa.

Não há um `if (role === 'ADMIN')` nesta tela. Repetir a regra no cliente criaria uma segunda fonte de
verdade que envelheceria sozinha, e que — sendo cliente — não protege coisa alguma.

#### O aviso do topo diz as duas coisas que a lista não conta

A `api-fr` apaga os arquivos enviados **toda sexta-feira às 23:59** (`jobs/delete-weekly-prints.cron.ts`).
Uma tela que não dissesse isso deixaria o balcão descobrir o expurgo no dia em que precisasse de algo que já
não existe mais.

A segunda frase é o recorte: o funcionário enxerga as salas em que está vinculado. Sem ela, uma lista curta
seria lida como "houve poucas impressões" em vez de "este é o seu pedaço".

Como o painel de operação, o aviso é oculto abaixo de 640px — no celular ele empurraria a lista para fora
da dobra, e a lista é o motivo de a tela existir.

#### Três filtros, e só um deles vai para a URL

| Filtro | Onde vive | Por quê |
| --- | --- | --- |
| Sala | `?sala=` | decide **o que a tela carrega** da API; recarregar ou colar o link tem de voltar à mesma sala |
| Período | estado | só estreita o que já está na mão |
| Busca | estado | idem |

Encher a URL de estado que não muda requisição nenhuma torna o endereço ruído. A sala é a exceção porque é
chave de consulta — e porque um link de sala colado no chat do balcão é uso real.

Um `?sala=` que não corresponda a uma sala visível — inexistente, inativa, ou fora do escopo daquele
funcionário — **cai em "todas as salas"**. A alternativa seria uma tela vazia com um erro, e o histórico não
tem por que sumir porque um parâmetro envelheceu.

#### Os filtros rodam no cliente, e isso tem prazo de validade

A rota **já aceita** `?lawyer=`, `?startDate=` e `?endDate=`. A tela não os usa, por duas razões:

- **A lista já está inteira na mão.** A `api-fr` não pagina esta rota. Mandar a busca ao servidor trocaria
  um filtro instantâneo por uma ida à rede a cada tecla, sobre dados que o navegador já tem.
- **A busca do cliente alcança mais.** Ela cobre advogado, computador **e** sala; o `?lawyer=` cobre só o
  primeiro.

> ⚠️ **Isso deixa de valer no dia em que a rota paginar.** Aí o cliente passa a ver uma página, filtrar
> localmente vira mentira, e os três parâmetros são o caminho pronto. O ponto de troca é o `queryFn` — por
> isso a chave `getPrinters(roomId)` já nasce parametrizada pela sala.

#### O fuso é o da Seccional, não o de quem olha

A coluna de data e o corte dos períodos usam `America/Fortaleza` fixo. A impressão aconteceu no balcão: uma
enviada às 22h precisa aparecer no dia em que foi enviada, e não no seguinte porque alguém abriu o painel de
outro fuso. Sem isso, "hoje" seria uma pergunta sobre o relógio de quem olha.

Os períodos comparam **chaves de dia** em `en-CA` (`2026-08-27`), não instantes. Nesse formato a ordem
lexicográfica é a ordem cronológica, então "últimos 7 dias" vira um `>=` de strings — sem aritmética de
`Date`, que é justamente onde o fuso escapa. A janela conta com o dia corrente (`now - 6 dias`), senão
"últimos 7 dias" mostraria oito.

#### O botão de abrir é um link, e "abrir" é o que ele faz

O roadmap pedia "baixar". O arquivo está no Storage, em outro domínio, e `<a download>` entre origens é
**ignorado** pelo navegador — o atributo estaria ali mentindo. Um `<a target="_blank">` vestido com
`buttonVariants` faz o que promete: abre o arquivo, e de lá o usuário salva, imprime de novo ou copia o
endereço.

Sendo link de verdade, ganha de graça o menu de contexto, o "abrir em nova janela" e a presença na lista de
links da página. O `aria-label` começa pelo verbo (para quem navega por voz pedir "abrir" e acertar) e
termina pelo nome do advogado, que é o que diferencia uma linha da outra.

> ⚠️ **A URL é a do Storage.** Se ela expirar ou passar a exigir credencial, o botão falha fora do alcance
> desta tela, e não há como distinguir isso de um arquivo já apagado. Servir o arquivo pela própria API é o
> que transformaria isso em download de verdade — segue na lista de dependências do backend.

#### Só as salas seguram a tela

Enquanto as salas carregam, a toolbar inteira fica em esqueleto: são elas que decidem qual sala está
selecionada, e renderizar o seletor antes disso o faria mostrar "Todas as salas" para pular à sala da URL um
instante depois. A espera pelas impressões é a própria tabela quem mostra — o layout não sai do lugar.

Pelo mesmo motivo a consulta de impressões espera as salas (`enabled: !isPendingRooms`): antes disso um
`?sala=` ainda não virou id validado, e buscar agora traria o histórico inteiro para trocá-lo pelo da sala em
seguida, gastando dois requests.

**Se as salas falharem, a tela não cai.** Sem `roomId` a rota já devolve tudo o que o funcionário pode ver;
o que se perde é o filtro por sala, e isso vira um aviso âmbar acima da tabela. Um seletor vazio sem
explicação é pior que a falha.

#### A lista vazia tem três causas e três saídas

Vazio porque não há nada guardado, porque a busca não achou, ou porque o período não alcança. Cada um pede
uma ação diferente de quem está olhando — esperar, corrigir o texto, ampliar o período — e uma mensagem
única ("nenhum resultado") faria as três parecerem a primeira, que é a única sem saída.

#### A contagem espera a lista

Contar antes de os dados chegarem escreveria "00 impressões" a cada troca de sala, e zero é uma afirmação
sobre o resultado, não uma espera. Enquanto a consulta corre, a contagem é esqueleto. O total ao lado
(`· 42 no total`) só aparece quando algum filtro está de fato escondendo linhas — comparar 42 com 42 não
informa nada.

> **A paginação é a da tabela, não da API.** O histórico de uma semana inteira não cabe numa tela, e a
> `api-fr` ainda devolve a lista sem paginar. Quando ela paginar, a troca acontece no `DataTable` e no
> `queryFn`, juntos.

> **Os filtros de sala e de período saíram daqui em 2026-08-28.** Eles vivem em
> `_components/shared/filters/` e são compartilhados com `/releases`; o componente desta tela virou
> `printers-table.tsx` ao adotá-los. Comportamento idêntico: a lista padrão de períodos não inclui os 30
> dias (num histórico semanal, um mês nunca mudaria o resultado) e o rótulo de "todo o período" continua
> sobrescrito aqui para "desde a última limpeza".

### Histórico de liberações (`/releases`)

A última rota da sidebar que ainda caía na 404. Com ela, **nenhum item da navegação aponta para o vazio**.

O painel de operação responde o agora: quem está em cada máquina, quanto tempo falta. O que ele não responde
é o depois — *aquele advogado esteve aqui ontem? quanto tempo usou? a sessão acabou por tempo ou alguém
encerrou no balcão?* Cada uma dessas perguntas terminava no banco.

**A rota já era consumida**, `GET /lawyers/get-all-releases/:roomId?`. O painel de operação a chamava com
sala obrigatória, filtrava `endDate === null` e **jogava o resto fora**: o histórico inteiro já trafegava e
era descartado a cada requisição. `getAllReleases` passou a aceitar `roomId` opcional, e o que era
descartado virou a tela.

#### O desfecho da sessão é derivado, não lido

A `api-fr` não tem campo de status. Ela devolve `endDate` (nulo enquanto aberta) e `usedAllTime`. A pergunta
da auditoria é outra — *como isso terminou?* — e a resposta é a combinação dos dois:

| Estado | Condição | O que significa |
| --- | --- | --- |
| Em andamento | `endDate === null` | alguém está na máquina agora |
| Tempo esgotado | fechada, `usedAllTime` | a API fechou sozinha no `expiresAt` |
| Encerrada | fechada, sem `usedAllTime` | alguém interveio no balcão antes do tempo |

A distinção entre os dois últimos é a que tem valor: ela separa o fluxo normal da exceção, que é exatamente
o que se procura num histórico.

> ⚠️ **Cota zerada na tela não fecha a sessão.** Ela vira `usedAllTime`, porque a API encerra por conta
> própria quando o `expiresAt` chega e o refetch seguinte só confirma. Mas o status continua "em andamento":
> o encerramento é da API, e anunciá-lo antes mostraria como fechada uma sessão em que ainda há alguém
> sentado na máquina.

#### A duração das sessões abertas anda sozinha

`usedMinutes` e `remainingMinutes` vêm calculados do servidor e já nascem defasados. Para uma sessão fechada
isso não importa — o número congelou junto com ela. Para uma aberta, o tempo de tela continua correndo.

`buildReleaseViews` recebe os minutos decorridos desde a resposta (`useElapsedMinutes`, o mesmo hook do
painel de operação) e desconta. O relógio da linha anda sem uma requisição por minuto na `api-fr`.

#### Quatro filtros, e de novo só a sala vai para a URL

Mesma regra das impressões, pelo mesmo motivo: a sala decide **o que a tela carrega**, e um link colado no
chat do balcão tem de voltar à mesma sala. Período, situação e busca só estreitam o que já está na mão.

**Sala inativa continua no seletor** — e aqui está a diferença em relação às impressões, que filtram
`!room.inactive`. Não se imprime numa sala fora de operação; mas as sessões que aconteceram nela continuam
sendo registro, e esconder a sala esconderia o passado dela junto. É justamente o passado que esta tela
existe para mostrar.

Isso **não** virou parâmetro do componente compartilhado. Cada tela filtra a própria lista antes de passar;
o `RoomFilter` mostra o que recebe. Um `showInactive` embutiria no controle uma regra que é da tela.

#### Os ladrilhos de contagem ignoram o filtro de situação, de propósito

Os ladrilhos ("3 em andamento · 12 com tempo esgotado · 8 encerradas") contam o conjunto já estreitado por
período e busca, mas **inteiro quanto ao estado**. Se respeitassem o filtro de situação, escolher "em
andamento" zeraria os outros dois — e o ladrilho deixaria de ser a leitura de relance que justifica sua
existência para virar um eco do filtro.

Daí as duas etapas no componente: `scopedReleases` (período + busca) alimenta a contagem, e
`filteredReleases` (+ situação) alimenta a tabela.

#### A lista vazia tem quatro causas, e a situação fala por último

Nada registrado, busca sem resultado, período sem alcance, situação inexistente no recorte. **A ordem das
verificações importa**: a situação é o filtro mais estreito, então ela sobrescreve as outras mensagens.
Dizer "amplie o período" quando o que zerou a lista foi pedir só as sessões em andamento mandaria a pessoa
mexer no controle errado.

#### A tela não encerra sessão

O painel de operação encerra; esta lista. A tentação é óbvia — a linha "em andamento" está ali, com o botão
a um passo — e é por isso que o aviso do topo manda usar o painel. Duas telas capazes de encerrar sessão é
um caminho a mais para o clique errado sobre um advogado que está usando a máquina naquele instante.

#### Os filtros no cliente aqui não têm prazo de validade — têm um limite

Nas impressões, filtrar no cliente foi escolha sobre uma rota que **aceita** `?lawyer=`, `?startDate=` e
`?endDate=`. Aqui a rota não aceita nada além do `roomId` no caminho, e não pagina. Não há para onde
empurrar o trabalho: a lista chega inteira porque é assim que a API a serve.

> ⚠️ **Sem expurgo e sem paginação, o histórico só cresce.** Impressões somem toda sexta; sessões ficam para
> sempre. A paginação da tabela segura a renderização, mas a resposta inteira trafega — e o problema chega
> antes aqui do que nas impressões.

---

## 🎨 Origem do design

A landing, a tela de login e a 404 derivaram do projeto **Claude Design "Sala Livre"**
(`c3a63c9a-47ad-47c7-8349-2d496f96c4f4`, arquivos `Sala Livre - Home`, `- Login` e `- 404`).
Divergências deliberadas em relação ao design original:

- O botão "Acessar painel" do cabeçalho foi substituído pelo **espaço de marca da instituição** — inclusive
  na 404, que reaproveita o `Header` real em vez do nav próprio do design. Desde **2026-08-28** esse espaço
  é marca branca: o arquivo é `public/assets/logo-cliente.png`, nomeado pelo papel e não pela seccional, e o
  que está fixo é a **altura** (`h-9 w-auto`), para qualquer proporção entrar sem esticar o cabeçalho. O
  `alt` não nomeia instituição — envelheceria em silêncio na troca, anunciando o nome errado a quem usa
  leitor de tela. No painel do login o `brightness-0 invert` pinta o traço de branco, e isso **depende de o
  PNG ter fundo transparente**: com fundo opaco vira um retângulo branco sólido.
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
