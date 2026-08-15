## Context

O login é a única tela que todo usuário do painel vê, e é também a mais sensível a erro operacional: a
`api-fr` limita `POST /employees/session/auth` a **5 tentativas por 10 minutos, contadas por IP + CPF**. Um
funcionário que erra a senha três vezes está a duas tentativas de ficar bloqueado por dez minutos. Isso
molda duas decisões desta change: validar o máximo possível no cliente (um CPF malformado não deve gastar
tentativa) e reservar desde já um lugar visível para a mensagem de erro vinda do servidor.

O design saiu do projeto Claude Design "Sala Livre" (`c3a63c9a-47ad-47c7-8349-2d496f96c4f4`, arquivo
`Sala Livre - Login`), na mesma linguagem da landing.

## Goals / Non-Goals

**Goals:**
- Rota `/auth/sign-in` navegável, responsiva de 320px até desktop.
- Validação local que impede requisições inúteis contra um endpoint com rate limit agressivo.
- Estrutura de erro pronta para receber `400` e `429` da API sem refatorar o formulário.
- Separar `(public)` de `(private)` antes que existam rotas privadas — depois seria migração.

**Non-Goals:**
- Chamada real à API, persistência de sessão, injeção de token e proteção de rotas.
- Recuperação e redefinição de senha (`/auth/forgot-password`) — a rota é linkada, não implementada.
- Cadastro de funcionário pela web: `/auth/sign-up` é um placeholder e o cadastro real é ação de `ADMIN`
  dentro do painel, não uma tela pública de auto-registro.

## Decisions

### Validar CPF no cliente, com dígito verificador

O `cpfSchema` não checa só o formato: normaliza para 11 dígitos e confere os dois dígitos verificadores,
rejeitando também as sequências repetidas (`111.111.111-11`). Com 5 tentativas por 10 minutos, deixar um
CPF inválido chegar ao servidor desperdiça uma tentativa real do usuário. O custo é duplicar no front uma
regra que a API também aplica — aceitável, porque a regra do CPF é fixa e não muda com o domínio.

### Máscara no valor do formulário, normalização no schema

O `maskCpf` formata enquanto o usuário digita e o valor mascarado é o que vive no estado do RHF. O
`cpfSchema` faz `transform` removendo tudo que não é dígito **antes** de validar, então o payload enviado à
API já sai limpo. A alternativa — guardar dígitos crus e formatar só na exibição — exigiria controlar
posição de cursor manualmente.

### `Controller` para CPF e checkbox, `register` para senha

`register` basta para inputs não controlados. O CPF precisa de `Controller` porque o `onChange` transforma
o valor (aplica a máscara), e o `Checkbox` do `@base-ui/react` expõe `onCheckedChange`/`inputRef` em vez da
interface nativa. Usar `Controller` em tudo seria uniforme, mas re-renderizaria o formulário inteiro a cada
tecla na senha.

### `errors.root` como canal do erro da API

O bloco de alerta no topo do formulário lê `errors.root?.message`. É o ponto único onde `400` ("CPF ou
senha inválidos") e `429` ("aguarde X segundos") vão aparecer, via `setError('root', …)`, sem tocar no
layout na change de integração.

### Layout split com o formulário primeiro no mobile

Em desktop, marca à esquerda e formulário à direita. Abaixo de `md`, `order-1`/`order-2` colocam o
formulário acima do painel de marca: quem abre o login no celular quer digitar, não ler a proposta de
valor. O painel de marca continua abaixo, funcionando como rodapé institucional.

### `BrandMark` como componente, não arquivo SVG

O símbolo aparece em quatro contextos com cores diferentes — branco no painel escuro, marca d'água a 4% de
opacidade, primário no 404, acento em rose. Um `<Image src="/logo.svg">` não permite recolorir. O
componente usa `currentColor` no traço principal e expõe `accentClassName` para o traço de destaque.

### `GridOverlay` sai do layout raiz

Estava no `layout.tsx`, o que o aplicava a **todas** as rotas — inclusive ao login, que tem fundo próprio, e
ao 404. Passou para `page.tsx` (landing) e `not-found.tsx`, que o querem explicitamente.

## Risks / Trade-offs

- **Regra de CPF duplicada** entre front e API: se a API afrouxar a validação, o front rejeita antes.
- **`/auth/forgot-password` não existe**: o link "Esqueci minha senha" leva a 404 até a change de recuperação.
- **`sign-up` público**: a rota está reservada, mas cadastro é ação de `ADMIN`. Se não for usada, remover —
  uma rota pública de cadastro num sistema interno é superfície de ataque desnecessária.
- **`axios` sem uso**: entrou no `package.json` antes da change que o consome.
- **Sessão ainda não existe**: `/auth/sign-in` é hoje uma tela decorativa. Nada impede navegar para rotas do
  grupo `(private)` quando elas surgirem — a proteção vem junto com a integração.

## Migration Plan

`(internal-layout)` → `(private)` e `src/app/styles/globals.css` → `src/styles/globals.css` são renomeações
com atualização dos imports em `layout.tsx`. Grupos de rota entre parênteses não afetam a URL, então
nenhuma rota pública mudou de endereço.

## Open Questions

- A sessão será cookie `httpOnly` ou `Authorization: Bearer`? Depende do CORS da API ser restringido ao
  `WEB_URL` (hoje `*`), o que impede cookie credenciado.
- "Manter-me conectado" muda o tempo de vida da sessão? O token da API vale 1 dia, fixo — sem suporte do
  backend, o checkbox não tem efeito real.
- `/auth/sign-up` fica ou sai?
