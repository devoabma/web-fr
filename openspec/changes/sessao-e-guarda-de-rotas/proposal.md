## Why

A tela de login estava pronta e não autenticava ninguém: `handleSignIn` fazia `console.log(data)`. E o
painel, do outro lado, respondia a **qualquer visitante** — bastava digitar `/panel`. Eram os dois lados da
mesma lacuna, listados como itens 8.1 a 8.4 da change `autenticacao-tela-de-login` e como os primeiros
pendentes da seção 2 do roadmap.

Enquanto o login não integra, nada mais do painel pode ser construído de verdade: toda tela seguinte lê
dados por sessão, e o corte por papel (`ADMIN` vê o inventário, `MEMBER` não) depende de um `role` que só
chega junto com o token. O bloco de usuário da barra superior é o exemplo mais visível — exibia "Hilquias
Ferreira Melo" e um avatar do `github.com`, fixos no código.

Havia também uma decisão de arquitetura pendente: a `api-fr` responde `{ token }` **e** grava um cookie
`httpOnly`. Este painel precisava escolher qual dos dois carrega a sessão, e a escolha determina onde a
guarda de rotas pode viver.

## What Changes

- **Cliente HTTP** (`src/lib/axios.ts`): instância única com base URL vinda do ambiente e
  `withCredentials`, para que o cookie `httpOnly` da sessão viaje nas requisições.
- **Ambiente validado** (`src/env.ts`): `NEXT_PUBLIC_API_URL` e `NEXT_PUBLIC_DOMAIN` passam por schema Zod,
  citadas nominalmente para sobreviverem à substituição do bundle do cliente.
- **Leitura de sessão** (`src/lib/auth/session.ts`): decodificação do payload do JWT, validação de formato e
  de papel, e checagem de expiração — sem verificar assinatura, que é responsabilidade da API.
- **Política de rotas** (`src/lib/auth/routes.ts`): lista de rotas públicas, de autenticação e restritas a
  `ADMIN`, com casamento por segmento. A regra é **negar por padrão**.
- **Guarda de navegação** (`src/proxy.ts`): redireciona visitante sem sessão para o login guardando o
  destino original, devolve ao painel quem já entrou e tenta voltar ao login, corta `/admin/*` para
  `MEMBER` e descarta cookie inservível.
- **Login integrado**: `POST /employees/session/auth` via React Query, com retorno à rota original,
  mensagem de erro do servidor na área de erro geral e **tempo de espera do `429` em texto legível**.
- **Perfil real na barra superior**: `GET /employees/profile` alimenta nome e avatar, com estado de
  carregamento próprio e iniciais quando o funcionário não tem foto.
- **React Query** instalado e montado no layout raiz, com cliente por requisição no servidor e política de
  retentativa que não insiste em erro `4xx`.

## Capabilities

### New Capabilities
- `sessao-do-painel`: Posse e validade da sessão do funcionário, alcance das rotas conforme o papel e
  retorno ao destino pretendido depois da autenticação.

### Modified Capabilities
- `autenticacao-funcionario`: o envio do formulário deixa de ser inerte e passa a autenticar contra a API,
  com tratamento nomeado para credenciais inválidas, excesso de tentativas e indisponibilidade.
- `navegacao-do-painel`: o bloco de usuário da barra superior deixa de ser fixo e passa a identificar o
  funcionário autenticado.

## Impact

- Código novo: `src/env.ts`, `src/proxy.ts`, `src/lib/axios.ts`, `src/lib/react-query.ts`,
  `src/lib/auth/{routes,session}.ts`, `src/lib/http/api-error.ts`, `src/constants/query-keys.ts`,
  `src/server/employees/{sign-in,get-profile}.ts`,
  `src/app/(private)/_components/shared/panel-header/panel-user.tsx`.
- Alterado: `src/app/(public)/auth/sign-in/_components/form-auth.tsx`,
  `src/app/(private)/_components/shared/panel-header/index.tsx`, `src/app/layout.tsx`, `next.config.ts`
  (host do Supabase para os avatares), `package.json` (`@tanstack/react-query`).
- Movido: `client-providers.tsx` de `(private)/_components/shared/` para `src/components/app/` — ele é
  montado pelo layout **raiz** e serve também o grupo `(public)`, onde o login usa React Query.
- **A guarda do `proxy.ts` é otimista, não é autorização.** Ela lê o cookie sem verificar a assinatura do
  JWT: um cookie forjado a atravessa. A autorização real continua sendo da `api-fr`, que valida o token a
  cada requisição. O papel do proxy é evitar que o usuário veja telas vazias, não proteger dados.
- **Toda rota nasce protegida.** Rota pública nova precisa ser registrada em `PUBLIC_ROUTES`, ou o proxy a
  redireciona para o login.
- **"Manter-me conectado" segue decorativo.** O corpo aceito pela API é `{ cpf, password }` e o cookie tem
  validade fixa de 1 dia; o checkbox não altera nada. Registrado como lacuna no roadmap.
- **Sem logout ainda.** A sessão expira sozinha em 1 dia, ou o cookie inservível é descartado pelo proxy.
- `/auth/sign-in` **permanece estática**: o parâmetro de retorno é lido de `window.location` dentro do
  submit, e não por `useSearchParams`, que exigiria fronteira de `Suspense` e tiraria a rota da
  pré-renderização.
