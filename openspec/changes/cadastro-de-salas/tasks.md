## 1. Rota da área (concluída)

- [x] 1.1 Criar `(private)/admin/rooms/page.tsx` com cabeçalho e descrição da área
- [x] 1.2 Posicionar o gatilho de cadastro à direita do cabeçalho
- [x] 1.3 Confirmar que a rota já é coberta pelo corte de papel do `proxy.ts` (`ADMIN_ROUTES`)
- [x] 1.4 Declarar `metadata.title = 'Salas'` na própria rota, como manda a convenção fixada na change
      `secao-administracao-por-papel` — sem isso a aba herdaria o template sem nome de área
- [x] 1.5 Corrigir o texto do cabeçalho, que prometia gerenciar computadores e filas de impressão nesta tela

## 2. Formulário de nova sala (concluída)

- [x] 2.1 `new-room-schema.tsx` com Zod: `name` (3–60), `standardTime` (inteiro, 15–480), `description`
      (até 200)
- [x] 2.2 `standardTime` com `valueAsNumber` no `register` — campo numérico entrega string por padrão
- [x] 2.3 Painel lateral (`Sheet`) com formulário externo ao rodapé, ligado por `form="new-room-form"`
- [x] 2.4 Quadro de leitura em horas ao lado do campo de minutos, com `aria-live="polite"`
- [x] 2.5 `Number.isFinite` antes da conversão — campo vazio chega como `NaN`
- [x] 2.6 Prévia do identificador como descrição do campo de nome, cedendo lugar ao erro quando houver
- [x] 2.7 `Textarea` adicionado ao design system

## 3. Máscara do identificador (concluída)

- [x] 3.1 `maskSlug` reproduzindo as etapas do `slugify(name, { lower: true, strict: true })`
- [x] 3.2 Descartar o hífen digitado, como o `strict` faz — "Sala-1" vira `sala1`
- [x] 3.3 Remover o corte em 40 caracteres: o nome já é limitado a 60 e truncar faria a prévia mentir
- [x] 3.4 `\p{Diacritic}` no lugar da faixa de combinantes crua, para o motivo do `replace` ficar legível

## 4. Integração com a `api-fr` (concluída)

- [x] 4.1 `server/rooms/create.ts` chamando `POST /rooms/create`
- [x] 4.2 `description` opcional no tipo da requisição; campo em branco vira `undefined`
- [x] 4.3 Invalidar `queryKeys.getRooms()` após o cadastro
- [x] 4.4 `try/catch` com `getApiErrorMessage` e `getRetryAfterInSeconds`, no mesmo padrão da troca de senha
- [x] 4.5 Devolver o foco ao campo de nome quando a API recusa
- [x] 4.6 Bloquear o fechamento do painel lateral enquanto a requisição está de pé
- [x] 4.7 Desabilitar o botão durante o envio — dois cliques criavam a sala e depois acusavam duplicidade

## 5. Vocabulário da grade (concluída)

- [x] 5.1 `PC-01` → `ESTAÇÃO-01` em `panel/_data/computer-view.ts`

## 6. Verificação

- [x] 6.1 `pnpm exec tsc --noEmit` sem erros
- [x] 6.2 `pnpm biome check --write src` sem issues
- [x] 6.3 `pnpm build` — `/admin/rooms` registrada como rota dinâmica
- [ ] 6.4 Cadastrar uma sala com um `ADMIN` real e conferir que ela aparece no seletor do painel sem
      recarregar a página
- [ ] 6.5 Repetir o nome de uma sala existente e conferir que a mensagem da API aparece e o foco volta ao
      campo de nome
- [ ] 6.6 Digitar "Sala-1" e conferir que a prévia mostra `sala1` — e que a API grava o mesmo
- [ ] 6.7 Digitar acento e cedilha no nome ("Plantão Cível") e conferir a prévia `plantao-civel`
- [ ] 6.8 Enviar sem descrição e conferir que a sala fica sem descrição, não com texto vazio
- [ ] 6.9 Clicar duas vezes no botão de criar e conferir que só um cadastro acontece
- [ ] 6.10 Tentar fechar o painel lateral (ESC e clique fora) durante o envio e conferir que ele resiste
- [ ] 6.11 Conferir o painel lateral abaixo de 768px — rolagem do formulário e rodapé fixo
- [ ] 6.12 Conferir a leitura em horas com 15, 90, 180 e 480 minutos
- [ ] 6.13 Abrir `/admin/rooms` com um `MEMBER` e confirmar o retorno ao painel pelo proxy

## 7. Próximos passos (fora desta change)

- [ ] 7.1 Listar as salas na própria tela (`GET /rooms/get-all`) — hoje quem cadastra não vê o resultado
- [ ] 7.2 Editar (`PATCH /rooms/update/:id`) e ativar/inativar (`/activate/:id`, `/deactivate/:id`)
- [ ] 7.3 Levar o teto de 480 minutos à `api-fr`, para valer também na edição
- [ ] 7.4 Decidir se a ilustração da landing acompanha o rótulo `ESTAÇÃO-01` da grade
- [ ] 7.5 Criar as demais áreas administrativas: `/admin/computers` e `/admin/employees`
