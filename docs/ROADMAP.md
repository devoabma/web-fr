# Sala Livre — Front Web · Roadmap de Construção

> Rastreio incremental do painel web, derivado de [`docs/DOC.md`](./DOC.md) e do domínio documentado em
> [`api-fr/docs/DOC.md`](../../api-fr/docs/DOC.md).
> Legenda: `[ ]` pendente · `[~]` em andamento · `[x]` concluído.

---

## 0. Fundação

- [x] Projeto Next.js 16 (App Router + Turbopack) com React Compiler
- [x] Tailwind CSS v4 com tokens de tema em `oklch` (`src/styles/globals.css`), variantes clara e escura
- [x] shadcn no estilo `base-nova` sobre `@base-ui/react` (`components.json`)
- [x] Helper `cn()` (clsx + tailwind-merge) em `src/lib/utils.ts`
- [x] Convenções de lint/format no `biome.json` (largura 130, sem ponto e vírgula, `useSortedClasses` como erro)
- [x] Layout raiz: fonte Space Grotesk, metadata do produto, favicon, `ClientProviders` com o `Toaster` e o
      `QueryClientProvider` (o arquivo mora em `src/components/app/`, não no grupo `(private)`)
- [x] OpenSpec inicializado (`openspec/`, comandos `/opsx:*`)
- [x] Documentação do repositório (`docs/DOC.md`, `docs/ROADMAP.md`)
- [x] Grupos de rota `(public)` e `(private)` separando o que exige sessão
- [x] Layout privado deixou de duplicar o documento HTML do layout raiz (fonte, `globals.css` e `Toaster`
      agora só na raiz)
- [x] Validação e máscara de CPF reutilizáveis (`src/utils/schemas/`, `src/utils/masks/`)
- [x] Cliente HTTP da `api-fr` (`src/lib/axios.ts`, base URL por env e `withCredentials`) com leitura
      defensiva de `400`/`429` em `src/lib/http/api-error.ts`
- [~] Variáveis de ambiente validadas — schema Zod em `src/env.ts`; falta o `.env.example`
- [x] Camada de dados: **React Query**, com `QueryClient` por requisição no servidor e sem retentativa em `4xx`
- [~] Tratamento global de erro e estados de carregamento — `not-found.tsx` pronto; falta `error.tsx` e `loading.tsx`
- [ ] Deploy

---

## 1. Landing pública

- [x] Cabeçalho com marca do produto e logo da OAB-MA
- [x] Hero com badge, título, subtítulo e chamada para o painel
- [x] Prévia do painel com os três estados do computador (disponível / em uso / manutenção)
- [x] Seção de diferenciais (4 cards)
- [x] Rodapé com copyright e navegação
- [x] Responsividade mobile-first em todas as seções
- [x] Página 404 (`not-found.tsx`) na identidade do produto, reaproveitando cabeçalho e rodapé, com retorno
      pelo histórico e destino alternativo quando não há histórico
- [ ] Rotas do rodapé: `/privacidade`, `/suporte`, `/status` — hoje caem na 404
- [ ] Conferência em viewport real (320px / 768px / 1440px)
- [ ] Validação de contraste dos estados

---

## 2. Autenticação

- [x] Tela de login `/auth/sign-in` — UI, validação, estados e integração com a API
- [x] Validação local do CPF (dígitos verificadores) e máscara progressiva
- [x] Layout split com painel de marca, responsivo (formulário primeiro no mobile)
- [x] Estados de envio, erro por campo e slot de erro geral (`errors.root`)
- [x] Integrar `POST /employees/session/auth`
- [x] Persistência da sessão pelo cookie `httpOnly` da API — o `{ token }` do corpo é descartado, nada vai
      para `localStorage`
- [x] Proteção de rotas do painel e redirecionamento de não autenticados (`src/proxy.ts`, negar por padrão)
- [x] Retorno ao destino pretendido depois do login (`?redirect=`, restrito a caminho interno)
- [x] Leitura do `role` para corte de acesso a `/admin/*` (ADMIN vs MEMBER)
- [x] Tratamento do `429` no login, exibindo o tempo de espera (`retryAfterInSeconds`)
- [x] Esqueci minha senha (`POST /employees/password-recovery`) — rota `/auth/forgot-password` com CPF e
      e-mail, painel de confirmação no lugar do formulário e reenvio travado por 60s. O e-mail vai **sem**
      normalizar a caixa: a API grava como foi digitado no cadastro e compara com `findUnique`
- [x] Redefinir senha com o código de 6 caracteres (`POST /employees/reset-password`) — rota
      `/auth/reset-password`, com o `?code=` do link do e-mail higienizado antes de preencher o campo, código
      normalizado para caixa-alta enquanto se digita e foco escolhido pela mensagem da API (código vs. senha)
- [x] Trocar senha do usuário logado (`PATCH /employees/change-password`) — diálogo em `/profile` com senha
      atual, nova e confirmação, "mostrar senhas" único para os três campos e tratamento de `429`
- [x] Tela de configurações de conta em `/profile` — identificação, CPF mascarado e e-mail em leitura, com o
      item do menu do usuário virando âncora (`Link`) em vez de `router.push`
- [x] Trocar a própria foto de perfil (`PATCH /employees/update-image`, multipart, máx. 5MB) — o avatar da
      tela de conta é o gatilho, com pré-visualização e validação local antes do envio. A resposta traz a
      `imageUrl` nova, escrita direto no cache: a tela e o menu do usuário trocam a foto sem nova consulta
- [x] Logout (`POST /employees/session/logout`) pelo menu do usuário — a API apaga o cookie `httpOnly`, o
      painel limpa o cache do React Query e devolve ao login. Falha de rede avisa por toast e **não** navega,
      porque a sessão continua de pé
- [ ] Denylist de token na `api-fr` — o logout hoje remove o cookie, mas um JWT já copiado segue aceito até
      expirar (1 dia). Vale também para a troca de senha: a API só regrava o hash, então **quem já estava
      logado em outra máquina continua dentro** mesmo depois da senha mudar
- [ ] "Manter-me conectado" é decorativo: a API aceita só `{ cpf, password }` e fixa o cookie em 1 dia.
      Decidir entre remover o campo ou pedir suporte na `api-fr`
- [ ] Revisar `Domain`/`SameSite` do cookie quando painel e API forem para domínios distintos em produção

---

## 3. Painel — moldura e navegação

- [x] Shell do painel em `(private)/layout.tsx`, em "T": barra superior atravessando o topo, sidebar e área
      de conteúdo com rolagem própria abaixo dela
- [x] Marca do produto na barra superior, visível também com a sidebar recolhida à faixa de ícones
- [x] Sidebar colapsável para faixa de ícones, nas cores da marca (tokens `--sidebar-*` reescritos)
- [x] Navegação em duas seções — Operação e Administração — declarada como dado (`NAV_SECTIONS`)
- [x] Item ativo por `usePathname`, casando rotas de detalhe, com `aria-current="page"`
- [x] Recolhimento preservado entre recargas: cookie `sidebar_state` lido no servidor como `defaultOpen`
- [x] Sidebar vira painel sobreposto (`Sheet`) abaixo de 768px, aberta pelo gatilho da barra superior
- [x] Rota `/panel` criada — primeira rota do grupo `(private)`; deixou de ser placeholder e passou a
      abrigar a visão da sala (seção 4)
- [x] Bloco de usuário da barra superior com dados da sessão (`GET /employees/profile`), com `skeleton`
      durante o carregamento e iniciais do nome quando não há foto
- [x] Menu do usuário no avatar da barra superior: nome, e-mail, papel traduzido e saída do sistema, com
      `aria-label` no gatilho (abaixo de 640px o nome ao lado não é exibido)
- [ ] Status real do sistema no lugar do badge fixo "All OK" (nada consulta o `/health` da API ainda)
- [x] Esconder a seção "Administração" de `MEMBER` (filtro sobre `NAV_SECTIONS`, não item desabilitado) —
      `adminOnly` na seção, `role` lido do cookie no layout privado, de modo que o grupo nunca chega ao
      HTML de quem não pode vê-lo
- [x] Título da aba declarado por rota, e não pelo `(private)/layout.tsx` — rota nova do painel deixa de
      herdar "Painel"
- [~] Criar as cinco áreas que a sidebar já referencia — `/admin/rooms` existe (só cadastro, ver seção 5);
      `/printers`, `/releases`, `/admin/computers` e `/admin/employees` ainda caem na 404
- [ ] `loading.tsx` por área, com o `skeleton` já instalado
- [~] Levar o hero da landing e o login para `/panel` — o login já leva; o hero continua apontando para
      `/auth/sign-in` (correto para quem não tem sessão, mas o proxy já devolveria ao painel quem tem)
- [ ] Conferir contraste dos itens ativo/inativo sobre o azul, nos temas claro e escuro

---

## 4. Painel — visão da sala

- [x] Cabeçalho da tela e aviso de uso: o advogado se libera sozinho na máquina, o painel é o caminho de
      exceção (oculto abaixo de 640px, para não empurrar a sala para fora da dobra)
- [x] Seleção de sala a partir de `GET /rooms/get-all` (escopo já filtrado por papel na API) — sala inativa
      fora da lista, primeira sala ativa assumida como padrão, com estados de carregamento, erro e vazio
- [x] Colaboradores da sala em fileira de avatares, deduplicados por funcionário (`employeesRooms` é o
      vínculo, não a pessoa), excedente em contador com os nomes no tooltip
- [x] Cota diária e total de computadores da sala selecionada
- [x] Sala escolhida vive na URL (`?sala=`) — a tela recarrega e se compartilha sem perder o contexto
- [x] Grade de computadores com os três estados, montada sobre a API — os computadores vêm embutidos em
      `GET /rooms/get-all`, **não** de `GET /computers/get-all`, que é ADMIN-only e devolveria `401` ao
      funcionário comum. Ordenada por número, porque a API não ordena
- [x] Contagem por estado (disponíveis / em uso / em manutenção) na faixa da sala
- [x] Colocar/retirar de manutenção (`PATCH /computers/maintenance/:id` e `.../remove`) — ação direta, sem
      diálogo; ausente no card em uso, porque a API recusa com `400` enquanto houver sessão
- [x] Encerrar sessão de um advogado (`POST /lawyers/close-computer/:sessionId`) — diálogo destrutivo que
      só fecha no sucesso, com o saldo restante no retorno
- [x] Liberar computador manualmente (`POST /lawyers/release-computer`) — a rota **existe e é pública**,
      recebe `macCode` e serve o painel sem alteração; a marcação anterior de bloqueio estava errada.
      `birth` vai em `DDMMYYYY`, sem barras
- [x] Estações desconectadas marcadas na grade, antes do clique (`GET /computers/online/:roomId`, que
      devolve **só as conectadas**) — cartão âmbar rotulado "Offline", liberação bloqueada, manutenção e
      encerramento preservados, e as livres e mudas fora da contagem de disponíveis. É a única consulta da
      tela com polling (20s), porque estação que sobe não avisa o painel
- [x] Liberação desfeita quando `notified` volta falso: a sessão recém-criada é encerrada na hora, em vez
      de ficar de pé travando o advogado numa máquina que não abre (a API recusa duas sessões simultâneas).
      Cobre a estação que cai entre o refetch e a confirmação; falhando o desfazer, a mensagem instrui a
      encerrar pelo cartão
- [x] Contador de tempo restante por sessão — `hh:mm` e barra de saldo, lidos de
      `GET /lawyers/get-all-releases/:roomId`, apresentados como `01h:12min`
- [x] Degradação honesta quando as sessões não carregam: a ocupação da sala é preservada e uma faixa âmbar
      explica o que faltou, em vez de mostrar tudo como disponível
- [x] Saldo andando sozinho na tela — o cálculo é do servidor, e o painel desconta os minutos decorridos
      desde a resposta (`useElapsedMinutes`). O polling de 30s saiu: revalidação na montagem, na volta de
      foco e depois de cada ação. Tempo real continua dependendo do item 8

---

## 5. Gestão (ADMIN)

### Funcionários
- [ ] Listar (`GET /employees/get-all`) — **sem paginação na API**
- [ ] Cadastrar (`POST /employees/create-account`)
- [ ] Editar (`PATCH /employees/update/:id`)
- [ ] Ativar / inativar (`PATCH /employees/activate/:id` e `/deactivate/:id`)
- [ ] Vincular / desvincular de salas (`POST /employees/link-with-rooms` e `/unlink-with-rooms`)
- ❌ Trocar a foto de **outro** funcionário — não existe na API: `PATCH /employees/update-image` resolve o
      funcionário pelo próprio token (`getIdCurrentEmployee`), então cada um só troca a sua. Feito na seção 2

### Salas
- [ ] Listar (`GET /rooms/get-all`) — a tela `/admin/rooms` ainda não mostra as salas cadastradas
- [x] Cadastrar (`POST /rooms/create`) — painel lateral com nome, tempo padrão em minutos (lido em horas ao
      lado) e descrição; a prévia do identificador mostra o `slug` que a API vai gravar, porque é ele, e não
      o nome, que decide a unicidade da sala
- [ ] Editar (`PATCH /rooms/update/:id`)
- [ ] Ativar / inativar (`PATCH /rooms/activate/:id` e `/deactivate/:id`)

### Computadores
- [ ] Listar com filtros por sala e descrição (`GET /computers/get-all`) — **sem paginação na API**
- [ ] Cadastrar (`POST /computers/create`)
- [ ] Editar (`PATCH /computers/update/:id`)
- [ ] Excluir (`DELETE /computers/delete/:id`) — recusa com `400` se estiver em uso

---

## 6. Fila de impressão

- [ ] Listar impressões da(s) sala(s) do funcionário (`GET /printers/get-all/:roomId?`)
- [ ] Aviso de expurgo semanal (sexta-feira, 23:59:59)
- [ ] ⛔ Baixar arquivo para impressão — **bloqueado: rota não existe na API**
- [ ] ⛔ Marcar como baixado / impresso — **bloqueado: não implementado na API**

---

## 7. Histórico e relatórios

- [ ] Listar sessões (`GET /lawyers/get-all-releases/:roomId?`) com filtros por advogado e data
- [ ] ⛔ Uso por sala e computador — **bloqueado: não implementado na API**
- [ ] ⛔ Impressões por advogado e sala — **bloqueado: não implementado na API**
- [ ] ⛔ Tempo médio por sessão — **bloqueado: não implementado na API**

---

## 8. Tempo real

- [ ] ⛔ Consumir eventos da API por WebSocket — **bloqueado**: o canal atual é Desktop↔API, não é
      autenticado e não emite `computer_released` / `session_started`. Até lá, a grade só se atualiza na
      volta de foco e depois de cada ação do balcão — o relógio da sessão anda por conta própria.

---

## 🔗 Dependências do backend

Itens marcados com ⛔ dependem de trabalho na `api-fr`. Ordem sugerida para destravar este painel:

1. **Paginação reutilizável** — afeta todas as listagens.
2. **Download do arquivo de impressão** — sem ele a fila é só leitura.
3. **Eventos de negócio no WebSocket** — a única forma de o painel ver o que acontece fora dele sem
   voltar a repetir requisições.
4. **Relatórios**.

> **Resolvidos:** _liberar computador manualmente_ saiu desta lista — `POST /lawyers/release-computer` já
> existia, é pública e recebe `macCode`; nunca foi bloqueio. _Restringir o CORS ao `WEB_URL`_ foi feito na
> `api-fr` e habilitou a sessão por cookie `httpOnly`.
