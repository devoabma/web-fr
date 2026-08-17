## Context

A `api-fr` autentica em `POST /employees/session/auth` e responde `200 { token }` **e** um `Set-Cookie`
`httpOnly` (`@fr-auth-token`, `Domain=localhost` em desenvolvimento, validade de 1 dia). O JWT carrega
`{ sub, role, exp }`, com `role` em `ADMIN | MEMBER`.

Duas restrições moldaram as decisões abaixo:

1. O cookie é `httpOnly` — JavaScript do navegador **não consegue lê-lo**. Só o servidor do Next enxerga.
2. A API já corrigiu o CORS (`origin: WEB_URL`, `credentials: true`), então cookie credenciado funciona. A
   ressalva registrada em `docs/DOC.md` sobre `origin: '*'` exigir `Authorization: Bearer` está vencida.

## Goals / Non-Goals

**Goals:**
- Sessão carregada pelo cookie da API, sem cópia em `localStorage`.
- Guarda de rotas que nega por padrão, para que rota nova nasça protegida.
- Retorno ao destino pretendido depois do login.
- Erro de rate limit legível, com o tempo de espera em português.

**Non-Goals:**
- Logout, recuperação e troca de senha — cada um tem seu endpoint e sua tela.
- Renovação silenciosa de token: a API não expõe `refresh`.
- Filtro da seção "Administração" na sidebar por papel — o proxy já barra o acesso; esconder o item é
  trabalho da change de navegação por papel.
- Autorização real no front. Ela é da API, sempre.

## Decisions

### O cookie `httpOnly` é a sessão; o `{ token }` do corpo é descartado

A alternativa seria guardar o token devolvido no corpo e injetá-lo como `Authorization: Bearer` a cada
requisição. Isso obrigaria a persistir o token em algum lugar que o JavaScript alcança — `localStorage` ou
um cookie legível — e é exatamente o que o `httpOnly` existe para evitar: qualquer XSS passaria a valer
sessão roubada.

Ficando com o cookie, o navegador o anexa sozinho (`withCredentials: true`) e o token nunca toca o
JavaScript da aplicação. O custo é depender do CORS da API continuar restrito ao `WEB_URL`, e de o cookie
ser gravado num domínio que o painel compartilhe — em produção, `Domain` precisa cobrir os dois subdomínios.

### A guarda vive no `proxy.ts`, é otimista, e não substitui a API

`proxy.ts` é o nome do middleware no Next 16. Ele roda antes da renderização, o que o torna o único lugar
capaz de impedir que o usuário **veja** a tela — e não apenas que ela venha vazia.

Ele decodifica o payload do JWT (base64url) e confere formato, papel e `exp`. **Não verifica a assinatura**:
isso exigiria o segredo do JWT dentro do front, o que seria pior do que não verificar. A consequência está
escrita no topo do arquivo: um cookie forjado atravessa o proxy. Ele decide **para onde mandar**, não **o
que liberar** — quem libera é a API, que valida o token de verdade a cada requisição.

Sem `exp` o token é tratado como expirado, e não como eterno. É a leitura conservadora: token sem validade
declarada não é token confiável.

### Negar por padrão

`PUBLIC_ROUTES`, `AUTH_ROUTES` e `ADMIN_ROUTES` são listas explícitas; tudo que não casa com nenhuma delas
é protegido. O contrário — listar as rotas privadas — só funcionaria enquanto ninguém esquecesse de
registrar uma tela nova, e um esquecimento desses não falha em desenvolvimento: falha em produção, expondo
uma tela.

O casamento é por segmento (`pathname === route || pathname.startsWith(route + '/')`), e não `startsWith`
puro, que casaria `/administrativo` com `/admin`.

### Cookie inservível é apagado, não ignorado

Um token expirado ou corrompido continua sendo reenviado pelo navegador a cada requisição. Se o proxy
apenas o ignorasse, o usuário ficaria em laço: entra em `/panel`, é mandado ao login, o cookie velho
continua lá, e nada muda. Por isso todo caminho que conclui "não há sessão" limpa o cookie na resposta — com
o mesmo `domain` e `path` usados pela API na gravação, porque o navegador casa o cookie a remover por
(nome, domínio, caminho).

### Destino de retorno lido de `window.location`, não de `useSearchParams`

O proxy guarda a rota original em `?redirect=`. `useSearchParams` num componente cliente força a rota a
sair da pré-renderização estática ou a ganhar uma fronteira de `Suspense`; ler `window.location.search`
dentro do submit não custa nada disso, porque o handler só roda no navegador.

O valor é entrada de terceiro — quem monta o link do login escolhe o parâmetro. Só caminho interno é aceito:
`//evil.com` e `https://evil.com` são absolutos para o navegador e virariam open redirect assinado pelo
domínio do painel.

### `QueryClient` por requisição no servidor, único no navegador

Um `new QueryClient()` no escopo do módulo é criado uma vez por **processo**. No servidor isso significa um
cache compartilhado entre requisições de usuários diferentes — o perfil de quem renderizou primeiro vazando
para o próximo. `getQueryClient()` devolve instância nova quando `isServer` e reaproveita a mesma no
navegador, onde o cache precisa mesmo sobreviver aos re-renders.

A retentativa padrão foi desligada para `4xx`: são decisões da API, não falhas de transporte, e repetir
devolve o mesmo status. No `429` repetir é ativamente prejudicial — cada tentativa consome o teto e empurra
o desbloqueio para a frente.

### O bloco de usuário é ilha cliente; a barra superior volta a ser servidor

A primeira versão pôs `useQuery` no `PanelHeader` e um `if (!profile) return null` antes do `return`. Isso
apagava a barra inteira enquanto o perfil não chegava — inclusive o `SidebarTrigger`, que abaixo de 768px é
o **único** caminho para abrir a navegação. Em conexão lenta o usuário ficava sem menu, sem marca e com o
conteúdo saltando quando o header aparecia.

A consulta desceu para `panel-user.tsx`, que assume o estado de carregamento com `skeleton` do tamanho
final. O `PanelHeader` voltou a ser Server Component, e o brilho radial da barra — perdido na primeira
integração — foi restaurado.

### `imageUrl` é anulável no contrato

`GET /employees/profile` declara `imageUrl: z.string().nullable()`. Tipar como `string` no front não muda o
que a API envia: entrega `null` ao `src` do `next/image`, que estoura em tempo de execução. Quem nunca subiu
foto recebe as iniciais do nome sobre a mesma moldura.

### `429` traduzido para tempo de espera

O login aceita 5 tentativas por 10 minutos por IP + CPF. A resposta traz `retryAfterInSeconds`, e exibir
"erro" genérico deixaria o usuário insistindo contra uma porta fechada — gastando as tentativas que ainda
tivesse. `formatWaitTime` transforma o número em "2 minutos" ou "1 minuto e 30 segundos".

A leitura dos erros é defensiva (`src/lib/http/api-error.ts`): nem tudo que chega ao `catch` veio da API.
Queda de rede não traz `response`, e um 502 de gateway responde HTML — `err.response.data.message` direto
quebraria o próprio tratamento de erro.

### Só a senha é descartada no erro

Limpar o formulário inteiro obrigaria a redigitar o CPF a cada tentativa. São cinco antes do bloqueio de 10
minutos; o foco volta para a senha, que é o campo que o usuário provavelmente errou.

## Risks / Trade-offs

- **Cookie entre domínios em produção.** Em desenvolvimento `localhost` cobre as duas portas (cookie ignora
  porta). Em produção, `api-fr.oabma.org.br` e o domínio do painel só compartilham cookie se a API gravar
  `Domain=.oabma.org.br` com `SameSite=None; Secure`. Se o painel for para outro domínio, a decisão do
  cookie precisa ser revisitada.
- **Cache de perfil entre usuários na mesma aba.** `getProfile` usa `staleTime` infinito. O login chama
  `queryClient.clear()` para que a sessão nova não herde o perfil da anterior; quando o logout existir, ele
  precisará fazer o mesmo.
- **`MEMBER` em `/admin/*` é redirecionado, não recebe 403.** A sidebar ainda não esconde a seção, então
  chegar lá é endereço digitado à mão. Devolver ao painel é menos ruído que uma tela de erro.
