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
- [ ] Esqueci minha senha (`POST /employees/password-recovery`) — rota `/auth/forgot-password` já linkada
      pela tela de login, mas inexistente
- [ ] Redefinir senha com o código de 6 caracteres (`POST /employees/reset-password`)
- [ ] Trocar senha do usuário logado (`PATCH /employees/change-password`)
- [ ] Tela de configurações de conta — o item já existe no menu do usuário, mas está **inerte**: não há
      destino para onde levar
- [x] Logout (`POST /employees/session/logout`) pelo menu do usuário — a API apaga o cookie `httpOnly`, o
      painel limpa o cache do React Query e devolve ao login. Falha de rede avisa por toast e **não** navega,
      porque a sessão continua de pé
- [ ] Denylist de token na `api-fr` — o logout hoje remove o cookie, mas um JWT já copiado segue aceito até
      expirar (1 dia)
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
- [x] Rota `/panel` criada como placeholder — primeira rota do grupo `(private)`
- [x] Bloco de usuário da barra superior com dados da sessão (`GET /employees/profile`), com `skeleton`
      durante o carregamento e iniciais do nome quando não há foto
- [x] Menu do usuário no avatar da barra superior: nome, e-mail, papel traduzido e saída do sistema, com
      `aria-label` no gatilho (abaixo de 640px o nome ao lado não é exibido)
- [ ] Status real do sistema no lugar do badge fixo "All OK" (nada consulta o `/health` da API ainda)
- [ ] Esconder a seção "Administração" de `MEMBER` (filtro sobre `NAV_SECTIONS`, não item desabilitado) —
      o `proxy.ts` já barra o acesso, falta esconder o item
- [ ] Criar as cinco áreas que a sidebar já referencia — hoje `/printers`, `/releases`, `/admin/rooms`,
      `/admin/computers` e `/admin/employees` caem na 404
- [ ] `loading.tsx` por área, com o `skeleton` já instalado
- [~] Levar o hero da landing e o login para `/panel` — o login já leva; o hero continua apontando para
      `/auth/sign-in` (correto para quem não tem sessão, mas o proxy já devolveria ao painel quem tem)
- [ ] Conferir contraste dos itens ativo/inativo sobre o azul, nos temas claro e escuro

---

## 4. Painel — visão da sala

- [ ] Seleção de sala a partir de `GET /rooms/get-all` (escopo já filtrado por papel na API)
- [ ] Grade de computadores com os três estados em tempo quase real
- [ ] Colocar/retirar de manutenção (`PATCH /computers/maintenance/:id` e `.../remove`)
- [ ] Encerrar sessão de um advogado (`POST /lawyers/close-computer/:sessionId`)
- [ ] Contador de tempo restante por sessão
- [ ] ⛔ Liberar computador manualmente — **bloqueado: rota não existe na API**

---

## 5. Gestão (ADMIN)

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
