## 1. Primitiva de tabela (concluída)

- [x] 1.1 `components/ui/table.tsx` (shadcn) adicionado ao design system
- [x] 1.2 `data-table-features.ts` declarando as features do TanStack v9 e o tipo `DataTableFeatures`
- [x] 1.3 `columnMeta` com `className` e `skeletonClassName`, para alinhamento e esqueleto por coluna
- [x] 1.4 `data-table/index.tsx` recebendo `columns`, `data`, `isLoading`, `pageSize`, `skeletonRows` e
      `emptyMessage`
- [x] 1.5 Esqueleto no formato da tabela durante o carregamento, uma linha por `skeletonRows`
- [x] 1.6 Linha única de vazio com `colSpan` do total de colunas
- [x] 1.7 `data-table-pagination.tsx` com contagem, seletor de linhas por página e as quatro navegações
- [x] 1.8 Contagem lida de `getPrePaginatedRowModel()` — `getRowModel()` já vem fatiado
- [x] 1.9 Piso de 1 em `getPageCount()`, para a lista vazia não anunciar "Página 1 de 0"
- [x] 1.10 Ramo de carregamento no rodapé, no lugar de "Total: 0 registros"

## 2. Listagem das salas (concluída)

- [x] 2.1 `rooms-table.tsx` consumindo `GET /rooms/get-all` por `useQuery` com `queryKeys.getRooms()`
- [x] 2.2 `rooms-columns.tsx` com nome, tempo padrão, descrição, status, data de criação e ações
- [x] 2.3 `createdAt` acrescentado a `RoomProps` e formatado com `date-fns`, com recuo para `—` quando a
      data não for válida
- [x] 2.4 Tempo padrão exibido como `120min (2h)` pelo `formatMinutes`
- [x] 2.5 Status como `Badge` — destrutivo para inativa, contorno com ponto pulsante para ativa
- [x] 2.6 Campo de busca por nome acima da tabela
- [x] 2.7 Fallback `?? []` dentro do `useMemo`, para não trocar a identidade de `data` a cada render
- [x] 2.8 Aviso de falha de carregamento com `role="alert"`, no lugar da tabela
- [x] 2.9 Cabeçalho da área empilhando abaixo de 640px, com o botão de cadastro em largura total

## 3. Ativar e inativar (concluída)

- [x] 3.1 `server/rooms/activate.ts` chamando `PATCH /rooms/activate/:id`
- [x] 3.2 `server/rooms/inactive.ts` chamando `PATCH /rooms/deactivate/:id`
- [x] 3.3 `inactive-room.tsx` com diálogo de confirmação dizendo quantos computadores saem do quadro
- [x] 3.4 Plural correto na contagem de computadores, inclusive o caso de nenhum
- [x] 3.5 `activate-room.tsx` sem confirmação — ação construtiva e reversível pelo botão ao lado
- [x] 3.6 Botão desabilitado durante a chamada nos dois sentidos, para o duplo clique não render
      "Sala já está inativa." depois do sucesso
- [x] 3.7 Diálogo resistindo ao fechamento enquanto a chamada está de pé
- [x] 3.8 `queryKeys.getRooms()` invalidada após cada alternância
- [x] 3.9 `getApiErrorMessage` + `getRetryAfterInSeconds` nos dois sentidos, no padrão do resto do painel

## 4. Utilitários (concluída)

- [x] 4.1 `formatDuration` em `utils/` — a leitura em horas que era local do formulário
- [x] 4.2 `formatMinutes` derivado dela, para a coluna da tabela (`120min (2h)`)
- [x] 4.3 Remover a duplicidade: havia duas funções `formatMinutes` com o mesmo nome e resultados
      diferentes, uma em `utils/` e outra dentro de `new-room.tsx`

## 5. Verificação

- [x] 5.1 `pnpm exec tsc --noEmit` sem erros
- [x] 5.2 `pnpm biome check --write` sem issues
- [x] 5.3 `pnpm build` — `/admin/rooms` segue registrada como rota dinâmica
- [ ] 5.4 Cadastrar uma sala com um `ADMIN` real e conferir que ela aparece na tabela sem recarregar
- [ ] 5.5 Inativar uma sala com computadores e conferir a contagem e o plural no diálogo
- [ ] 5.6 Inativar uma sala sem computador nenhum e conferir o texto correspondente
- [ ] 5.7 Reativar a sala e conferir que ela volta ao seletor do painel
- [ ] 5.8 Clicar duas vezes em inativar e conferir que só um `PATCH` acontece
- [ ] 5.9 Tentar fechar o diálogo (ESC e clique fora) durante a chamada e conferir que ele resiste
- [ ] 5.10 Buscar por um trecho de nome estando na página 2 e conferir que a paginação volta à primeira
- [ ] 5.11 Trocar as linhas por página e conferir contagem e navegação
- [ ] 5.12 Conferir o esqueleto de carregamento e a mensagem de vazio
- [ ] 5.13 Derrubar a API e conferir o aviso de falha no lugar da tabela
- [ ] 5.14 Conferir a tabela abaixo de 768px — rolagem horizontal e rodapé empilhado

## 6. Próximos passos (fora desta change)

- [ ] 6.1 Editar sala (`PATCH /rooms/update/:id`) — o botão da linha existe e ainda não faz nada
- [ ] 6.2 Decidir a semântica de cor do interruptor: estado atual (hoje) ou consequência do clique
- [ ] 6.3 Unificar a formatação de data do painel — `date-fns` aqui, `Intl.DateTimeFormat` na grade
- [ ] 6.4 Modo servidor da `DataTable`, quando a `api-fr` ganhar paginação
- [ ] 6.5 Reusar a primitiva em `/admin/employees` e `/admin/computers`
