## Why

A tela de login linkava `/auth/forgot-password` desde a change `autenticacao-tela-de-login`, e esse link
levava a um **404**. Era o único caminho de saída para quem esquecia a senha — e ele não existia.

A change `configuracoes-de-conta` fechou a troca de senha de quem consegue entrar (`PATCH
/employees/change-password`). Faltava exatamente o caso oposto, o único que importa quando o funcionário
está do lado de fora: **não lembro a senha, não tenho sessão, não tenho como pedir nada ao painel**. A
`api-fr` já expunha as duas rotas públicas do fluxo (`POST /employees/password-recovery` e `POST
/employees/reset-password`) e o e-mail de recuperação já saía com um link para
`${WEB_URL}/auth/reset-password?code=...` — apontando para uma rota que o front nunca implementou.

Sem isso, a única recuperação possível era ligar para a administração e pedir uma senha nova na mão.

## What Changes

- **Rota `/auth/forgot-password`**: pede CPF e e-mail cadastrados, dispara o e-mail com o código de 6
  caracteres e troca o formulário por um painel de confirmação com reenvio.
- **Rota `/auth/reset-password`**: recebe o código (digitado ou vindo do `?code=` do e-mail), a nova senha e
  a confirmação, e encerra com um painel de sucesso que devolve ao login.
- **`src/server/employees/request-password-recovery.ts`** e **`src/server/employees/reset-password.ts`**:
  as duas rotas públicas da API pelo cliente axios, com o corpo espelhando o schema Zod do backend.
- **`src/utils/masks/recovery-code.ts`**: `RECOVERY_CODE_LENGTH`, `maskRecoveryCode` (caixa-alta e
  `[A-Z0-9]`, cortando em 6) e `isRecoveryCode`, compartilhados entre o Server Component e o formulário.
- **Trava de reenvio de 60 segundos** na tela de recuperação, derivada de um instante absoluto.
- **`metadata.title` sai do layout de autenticação** e passa a viver em cada página: com três rotas sob
  `/auth`, um título fixo em `'Entrar'` no layout rotularia "Entrar" as telas de recuperação também.

## Capabilities

### Added Capabilities
- `recuperacao-de-senha`: o funcionário sem sessão recupera o acesso por e-mail, sem depender de um
  administrador redefinir a senha por ele.

### Modified Capabilities
- `autenticacao-funcionario`: o título de cada tela do fluxo de autenticação passa a ser definido pela
  própria página, não pelo layout compartilhado.

## Impact

- Código novo: `src/app/(public)/auth/forgot-password/page.tsx` e
  `_components/form-forgot-password{,-schema}.tsx`; `src/app/(public)/auth/reset-password/page.tsx` e
  `_components/form-reset-password{,-schema}.tsx`; `src/server/employees/request-password-recovery.ts`;
  `src/server/employees/reset-password.ts`; `src/utils/masks/recovery-code.ts`.
- Alterado: `src/app/(public)/auth/layout.tsx` (perde o `metadata`),
  `src/app/(public)/auth/sign-in/page.tsx` (ganha o `metadata`).
- As duas rotas caem em `AUTH_ROUTES` (`/auth`) sem nenhuma linha nova no `proxy.ts`: já são exclusivas de
  quem **não** tem sessão, pela política de negar por padrão de `src/lib/auth/routes.ts`.
- `/auth/forgot-password` entra no build como estática (`○`); `/auth/reset-password` como dinâmica (`ƒ`),
  porque lê `searchParams`.
- **O e-mail não é normalizado para minúsculas no envio.** A `api-fr` grava o endereço como foi digitado no
  cadastro (só `.trim()`) e o procura com `findUnique` — comparação sensível a maiúsculas no Postgres.
  Normalizar no front recusaria justamente o funcionário cadastrado com maiúscula.
- **A API responde igual para par inexistente e par trocado** (`400 "Credenciais inválidas."`), o que é
  bom para privacidade e ruim para diagnóstico: a tela repassa a mensagem da API sem inventar detalhe.
- **A redefinição não encerra sessão nenhuma.** Como na troca de senha, a `api-fr` só regrava o
  `passwordHash`: um JWT anterior segue válido até expirar. Ressalva registrada, mitigação depende da API.
- Em `NODE_ENV != production` a API envia o e-mail para um destinatário fixo no código do backend, não para
  o e-mail do funcionário — comportamento da API, anotado aqui para não assustar em desenvolvimento.
