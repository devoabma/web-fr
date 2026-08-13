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
├── app/
│   ├── layout.tsx                 # fonte, metadata, providers, fundo decorativo
│   ├── page.tsx                   # composição da landing
│   ├── styles/globals.css         # tokens do tema (:root e .dark)
│   └── (internal-layout)/
│       └── _components/shared/    # providers de cliente (ClientProviders)
├── components/
│   ├── app/                       # uma seção/feature por arquivo
│   └── ui/                        # primitivas shadcn/base-ui
└── lib/utils.ts                   # cn() — clsx + tailwind-merge
```

**Convenções:**

- Um arquivo por seção em `src/components/app/`, kebab-case, **export nomeado**.
- Server Components por padrão. `'use client'` só onde há estado, evento ou API de browser.
- Cores sempre por **token do tema** (`text-primary`, `text-muted-foreground`, `bg-card`, `border`) — nunca hex.
- Escala numérica do Tailwind v4 (`max-w-310`, `pt-18.5`) em vez de valores arbitrários quando possível.
- `cn()` para classes condicionais.

**Formatação (`biome.json`):** aspas simples no TS, duplas no JSX, **sem ponto e vírgula**, largura 130,
`arrowParentheses: asNeeded`, trailing comma `es5`. `organizeImports` e `useSortedClasses` são **erro** —
sempre rodar `pnpm biome check --write` depois de editar JSX.

---

## 🔌 Integração com a `api-fr`

**Base URL:** `https://api-fr.oabma.org.br` em produção. Docs vivas em `/docs` (Scalar), healthcheck em `/health`.

### Autenticação

`POST /employees/session/auth` com `{ cpf, password }` responde `200 { token }` **e** define um cookie
`httpOnly` (`TOKEN_COOKIE_NAME`, padrão `@my-token`), válido por 1 dia. O JWT carrega `{ sub, role }`.

> ⚠️ **A API está com `CORS origin: '*'`.** Com origem curinga o navegador não envia cookie credenciado,
> então enquanto isso não for restringido ao `WEB_URL` este front precisa enviar
> `Authorization: Bearer <token>` explicitamente.

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

> O login é o caso mais sensível: cinco tentativas por 10 minutos contadas por IP + CPF. Um usuário que
> erra a senha algumas vezes bate o teto — a UI precisa dizer quanto falta esperar, não apenas "erro".

---

## ⚠️ Lacunas da API que travam telas deste painel

Levantado em **2026-08-12** a partir de [`api-fr/docs/ROADMAP.md`](../../api-fr/docs/ROADMAP.md).
Confirmar antes de planejar as telas correspondentes.

- **Paginação não existe em nenhuma listagem**, embora o requisito não-funcional exija 10 itens por página.
  Afeta funcionários, salas, computadores, sessões e impressões.
- **Liberar computador manualmente pelo funcionário** — requisito previsto, rota não implementada.
- **Baixar arquivo da fila de impressão** — a listagem existe, o download não.
- **Relatórios** — nada implementado.
- **Tempo real** — o WebSocket é hoje um canal Desktop↔API. Não há eventos `computer_released` /
  `session_started`, e o canal não é autenticado. Um painel "ao vivo" hoje só consegue polling.

---

## 🎨 Origem do design

A landing derivou do projeto **Claude Design "Sala Livre"**
(`c3a63c9a-47ad-47c7-8349-2d496f96c4f4`). Divergências deliberadas em relação ao design original:

- O botão "Acessar painel" do cabeçalho foi substituído pela **logo da OAB-MA**.
- Ícones lucide substituem os glifos tipográficos (`⌁ ◷ ⎙ ◳`) dos cards de diferenciais.
- Os contadores da prévia do painel são derivados dos dados, não literais.
- Paleta traduzida para tokens: destaque `rose-700`, disponível `green-600`, manutenção `slate-500`.

---

## 📋 Fluxo de trabalho

Cada incremento é documentado como uma change no **OpenSpec** (`openspec/changes/<nome>/`), com
`proposal.md`, `design.md`, `tasks.md`, `.openspec.yaml` e delta specs em `specs/<capability>/spec.md`.
O progresso é rastreado em [`docs/ROADMAP.md`](./ROADMAP.md).
