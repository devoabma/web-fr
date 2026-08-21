## Context

A `api-fr` fecha o fluxo em duas rotas públicas:

- `POST /employees/password-recovery`, corpo `{ cpf, email }`. Procura o funcionário com
  `findUnique({ cpf, email })` — o **par** precisa bater. Gera um código de 6 caracteres `[A-Z0-9]`, envia
  por e-mail com um link para `${WEB_URL}/auth/reset-password?code=...`, apaga os tokens anteriores do
  funcionário e grava o novo com `expiresAt` de 5 minutos. Rate limit de **5 por 15 minutos por IP**, com
  `continueExceeding: true` — cada tentativa a mais durante o bloqueio **reinicia** a janela.
- `POST /employees/reset-password`, corpo `{ code, password, confirmPassword }` (as duas senhas com
  `trim().min(8)` e um `refine` de igualdade). Busca o token com `findUnique({ code })`, recusa expirado,
  recusa senha idêntica à anterior e dispara um e-mail de confirmação. Rate limit de **10 por 10 minutos
  por IP**.

Ambas devolvem `400 { message }` e `429 { message, retryAfterInSeconds }` — o formato que
`src/lib/http/api-error.ts` já sabe ler desde a tela de login.

## Goals / Non-Goals

**Goals**
- Tirar o `/auth/forgot-password` do 404 e fechar o ciclo até o login com a senha nova.
- Aproveitar o link do e-mail: chegar em `/auth/reset-password?code=...` com o campo já preenchido.
- Impedir que o próprio usuário queime a cota de 5 por 15 minutos com cliques repetidos.
- Traduzir cada recusa da API para o campo que a originou, em vez de um erro genérico no topo.

**Non-Goals**
- Reenviar o código a partir da tela de redefinição — o reenvio mora em `/auth/forgot-password`, que é onde
  estão o CPF e o e-mail; a tela de redefinição só oferece o link para voltar lá.
- Autenticar o funcionário automaticamente depois de redefinir. A API não devolve sessão, e entrar com a
  senha nova é a confirmação de que ela funcionou.
- Encerrar as sessões abertas — a API não tem denylist de token.
- Medidor de força de senha: a API exige 8 caracteres e nada mais; inventar régua no front recusaria senha
  que o backend aceita.

## Decisions

### O código é normalizado no front, não corrigido no backend

`maskRecoveryCode` sobe para caixa-alta, descarta o que não é `[A-Z0-9]` e corta em 6 enquanto o usuário
digita. Não é enfeite: a API busca o token com `findUnique({ code })`, comparação **sensível a maiúsculas**
no Postgres. Um código colado do e-mail com um espaço no fim, ou digitado em minúsculo, voltaria como
"código inválido" e mandaria o funcionário pedir outro sem necessidade — gastando a cota da rota anterior.

### `isRecoveryCode` vive em `utils/masks`, não no schema do formulário

A página `/auth/reset-password` é um Server Component e precisa validar o `?code=` antes de entregá-lo ao
formulário. O arquivo do schema arrasta `react-hook-form`, que não roda no servidor. A validação pura fica
no módulo de máscara, importável dos dois lados.

### O `?code=` é higienizado antes de virar valor inicial

O parâmetro vem da URL, ou seja, de fora. `sanitizeCode` faz `trim`, sobe para caixa-alta e só aceita se
casar com o formato; qualquer outra coisa vira string vazia e o campo nasce em branco. Sem isso, um link
adulterado plantaria lixo dentro do campo — e, pior, um código quase-certo faria o usuário enviar um
formulário condenado, consumindo tentativa da cota.

### O e-mail **não** é normalizado para minúsculas

O caminho oposto ao do código, e de propósito. A `api-fr` grava o e-mail como foi digitado no cadastro (só
`.trim()`) e o procura com `findUnique`. Se o front baixasse a caixa, o funcionário cadastrado como
`Fulano@oabma.org.br` nunca casaria — inclusive digitando exatamente o endereço certo. Espelhar o backend
aqui é mais seguro do que "arrumar" o dado.

### O reenvio tem cooldown de 60 segundos, ancorado em um instante absoluto

O teto da rota é 5 por 15 minutos por IP **e a janela reinicia a cada excesso**: dois cliques nervosos
trancam o funcionário justamente quando ele mais precisa do código. O contador guarda o instante do fim
(`cooldownEndsAt`) e recalcula o restante a cada tique, em vez de subtrair 1 por segundo. Aba em segundo
plano ou notebook suspenso engasgam o `setInterval` — um contador que só decrementa ficaria parado em "42s"
e nunca liberaria o botão.

### Confirmação em vez de tela nova depois do envio

Enviado o código, o formulário dá lugar a um painel no mesmo lugar, com o e-mail de destino, o prazo de 5
minutos, o reenvio e o atalho "Já tenho o código". Uma rota nova exigiria carregar CPF e e-mail por query
string — dado de identificação na URL, no histórico do navegador de uma máquina compartilhada. O par fica
em memória (`sentTo`), que é exatamente o que o reenvio precisa e nada além disso.

### O foco depois do erro é escolhido pela mensagem

A API recusa a redefinição por dois motivos muito diferentes — código inválido/expirado e senha igual à
anterior — e devolve os dois como `400` sem nenhum campo que os distinga além do texto. O formulário lê a
mensagem: se ela fala em "código", o foco vai para o código; senão, para a senha. Foco fixo mandaria o
funcionário corrigir justamente o que estava certo.

### A dica do campo ocupa o lugar do erro, não uma linha extra

`FieldDescription` quando não há erro, `FieldError` quando há. O mínimo de 8 caracteres e a recusa de senha
repetida aparecem **antes** de errar, e o bloco não muda de altura na troca — sem salto de layout no
instante em que o usuário está lendo o que deu errado.

### O `metadata` desce do layout para as páginas

`(public)/auth/layout.tsx` fixava `title: 'Entrar'`. Com três rotas debaixo dele, as telas de recuperação
herdariam o rótulo errado na aba e no histórico. Cada página passa a declarar o próprio título.

## Risks / Trade-offs

- **Cooldown só no cliente.** Recarregar a página zera o contador; a proteção real continua sendo o rate
  limit da API. O cooldown existe para o erro honesto (clicar de novo achando que não foi), não contra
  abuso deliberado.
- **A leitura da mensagem por regex é acoplada ao texto da API.** Se o backend reescrever "código" na
  recusa, o foco cai na senha — degradação silenciosa e sem estrago, já que a mensagem completa continua
  visível no aviso do topo. O caminho definitivo seria um código de erro no corpo do `400`.
- **`/auth/reset-password` é dinâmica por causa do `searchParams`.** Rota pública que poderia ser estática;
  o preenchimento automático a partir do link do e-mail vale o custo.
