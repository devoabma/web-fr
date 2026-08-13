# Sala Livre — Front Web · Roadmap de Construção

> Rastreio incremental do painel web, derivado de [`docs/DOC.md`](./DOC.md) e do domínio documentado em
> [`api-fr/docs/DOC.md`](../../api-fr/docs/DOC.md).
> Legenda: `[ ]` pendente · `[~]` em andamento · `[x]` concluído.

---

## 0. Fundação

- [x] Projeto Next.js 16 (App Router + Turbopack) com React Compiler
- [x] Tailwind CSS v4 com tokens de tema em `oklch` (`src/app/styles/globals.css`), variantes clara e escura
- [x] shadcn no estilo `base-nova` sobre `@base-ui/react` (`components.json`)
- [x] Helper `cn()` (clsx + tailwind-merge) em `src/lib/utils.ts`
- [x] Convenções de lint/format no `biome.json` (largura 130, sem ponto e vírgula, `useSortedClasses` como erro)
- [x] Layout raiz: fonte Space Grotesk, metadata do produto, favicon, `ClientProviders` com o `Toaster`
- [x] OpenSpec inicializado (`openspec/`, comandos `/opsx:*`)
- [x] Documentação do repositório (`docs/DOC.md`, `docs/ROADMAP.md`)
- [ ] Cliente HTTP da `api-fr` (base URL por env, injeção do token, tratamento de `400`/`401`/`429`)
- [ ] Variáveis de ambiente validadas (`.env.example` + schema)
- [ ] Camada de dados (React Query ou Server Actions — decisão pendente)
- [ ] Tratamento global de erro e estados de carregamento (`error.tsx`, `loading.tsx`)
- [ ] Deploy

---

## 1. Landing pública

- [x] Cabeçalho com marca do produto e logo da OAB-MA
- [x] Hero com badge, título, subtítulo e chamada para o painel
- [x] Prévia do painel com os três estados do computador (disponível / em uso / manutenção)
- [x] Seção de diferenciais (4 cards)
- [x] Rodapé com copyright e navegação
- [x] Responsividade mobile-first em todas as seções
- [ ] Rotas do rodapé: `/privacidade`, `/suporte`, `/status`
- [ ] Conferência em viewport real (320px / 768px / 1440px)
- [ ] Validação de contraste dos estados

---

## 2. Autenticação

- [ ] Tela de login (`POST /employees/session/auth`)
- [ ] Persistência da sessão e injeção do token nas requisições
- [ ] Proteção de rotas do painel e redirecionamento de não autenticados
- [ ] Leitura do `role` para exibição condicional de ações (ADMIN vs MEMBER)
- [ ] Tratamento do `429` no login, exibindo o tempo de espera (`retryAfterInSeconds`)
- [ ] Esqueci minha senha (`POST /employees/password-recovery`)
- [ ] Redefinir senha com o código de 6 caracteres (`POST /employees/reset-password`)
- [ ] Trocar senha do usuário logado (`PATCH /employees/change-password`)
- [ ] Logout

---

## 3. Painel — visão da sala

- [ ] Rota `/painel` (destino da chamada do hero)
- [ ] Seleção de sala a partir de `GET /rooms/get-all` (escopo já filtrado por papel na API)
- [ ] Grade de computadores com os três estados em tempo quase real
- [ ] Colocar/retirar de manutenção (`PATCH /computers/maintenance/:id` e `.../remove`)
- [ ] Encerrar sessão de um advogado (`POST /lawyers/close-computer/:sessionId`)
- [ ] Contador de tempo restante por sessão
- [ ] ⛔ Liberar computador manualmente — **bloqueado: rota não existe na API**

---

## 4. Gestão (ADMIN)

### Funcionários
- [ ] Listar (`GET /employees/get-all`) — **sem paginação na API**
- [ ] Cadastrar (`POST /employees/create-account`)
- [ ] Editar (`PATCH /employees/update/:id`)
- [ ] Ativar / inativar (`PATCH /employees/activate/:id` e `/deactivate/:id`)
- [ ] Vincular / desvincular de salas (`POST /employees/link-with-rooms` e `/unlink-with-rooms`)
- [ ] Trocar foto de perfil (`PATCH /employees/update-image`, multipart, máx. 5MB)

### Salas
- [ ] Listar (`GET /rooms/get-all`)
- [ ] Cadastrar (`POST /rooms/create`)
- [ ] Editar (`PATCH /rooms/update/:id`)
- [ ] Ativar / inativar (`PATCH /rooms/activate/:id` e `/deactivate/:id`)

### Computadores
- [ ] Listar com filtros por sala e descrição (`GET /computers/get-all`) — **sem paginação na API**
- [ ] Cadastrar (`POST /computers/create`)
- [ ] Editar (`PATCH /computers/update/:id`)
- [ ] Excluir (`DELETE /computers/delete/:id`) — recusa com `400` se estiver em uso

---

## 5. Fila de impressão

- [ ] Listar impressões da(s) sala(s) do funcionário (`GET /printers/get-all/:roomId?`)
- [ ] Aviso de expurgo semanal (sexta-feira, 23:59:59)
- [ ] ⛔ Baixar arquivo para impressão — **bloqueado: rota não existe na API**
- [ ] ⛔ Marcar como baixado / impresso — **bloqueado: não implementado na API**

---

## 6. Histórico e relatórios

- [ ] Listar sessões (`GET /lawyers/get-all-releases/:roomId?`) com filtros por advogado e data
- [ ] ⛔ Uso por sala e computador — **bloqueado: não implementado na API**
- [ ] ⛔ Impressões por advogado e sala — **bloqueado: não implementado na API**
- [ ] ⛔ Tempo médio por sessão — **bloqueado: não implementado na API**

---

## 7. Tempo real

- [ ] ⛔ Consumir eventos da API por WebSocket — **bloqueado**: o canal atual é Desktop↔API, não é
      autenticado e não emite `computer_released` / `session_started`. Até lá, polling.

---

## 🔗 Dependências do backend

Itens marcados com ⛔ dependem de trabalho na `api-fr`. Ordem sugerida para destravar este painel:

1. **Paginação reutilizável** — afeta todas as listagens.
2. **Liberar computador manualmente** — é a ação central do painel de sala.
3. **Download do arquivo de impressão** — sem ele a fila é só leitura.
4. **Restringir o CORS ao `WEB_URL`** — habilita a sessão por cookie `httpOnly`.
5. **Eventos de negócio no WebSocket** — troca polling por tempo real.
6. **Relatórios**.
