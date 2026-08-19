## 1. Decisão de rota (concluída)

- [x] 1.1 Comparar `GET /computers/get-all` com os computadores embutidos em `GET /rooms/get-all`
- [x] 1.2 Constatar que `/computers/get-all` chama `checkIfEmployeeIsAdmin()` — `MEMBER` tomaria `401`
- [x] 1.3 Registrar a decisão no comentário de `src/server/rooms/get-all.ts`, para não ser refeita
- [x] 1.4 Constatar que `POST /lawyers/release-computer` é pública e recebe `macCode` — a liberação
      manual nunca esteve bloqueada, ao contrário do que o roadmap registrava

## 2. Correções na camada de dados existente (concluída)

- [x] 2.1 `maintenance: boolean | null` → `string | null` — a API tipa `z.date()`, que no JSON é ISO
- [x] 2.2 `inactive: boolean | null` → `string | null`, mesma razão
- [x] 2.3 `queryKeys.getReleases(roomId)` no catálogo de chaves

## 3. Camada de dados nova (concluída)

- [x] 3.1 `src/server/lawyers/get-all-releases.ts` — `GET /lawyers/get-all-releases/:roomId`
- [x] 3.2 Documentar no arquivo que a rota devolve o histórico inteiro, não só as sessões abertas
- [x] 3.3 `src/server/lawyers/release-computer.ts` — corpo `{ cpf, oab, birth, macCode }`
- [x] 3.4 Documentar que `birth` vai em `DDMMYYYY`, sem barras
- [x] 3.5 Documentar o campo `notified` — existe para o painel, não para o Desktop
- [x] 3.6 `src/server/lawyers/close-session.ts` — `POST /lawyers/close-computer/:sessionId`
- [x] 3.7 `src/server/computers/put-into-maintenance.ts` — `PATCH /computers/maintenance/:id`
- [x] 3.8 `src/server/computers/take-out-of-maintenance.ts` — `PATCH /computers/maintenance/:id/remove`
- [x] 3.9 Documentar nas duas que a API recusa com `400` a máquina em uso e devolve `404` ambíguo para
      máquina inexistente ou fora das salas do funcionário

## 4. Tradução entre os dois modelos (concluída)

- [x] 4.1 `_data/computer-view.ts` com `ComputerView` e `buildComputerViews`
- [x] 4.2 Filtrar `endDate === null` e indexar as sessões por `computer.id`
- [x] 4.3 `reverse()` antes do `Map` — a mais recente vence se houver duas abertas na mesma máquina
- [x] 4.4 Ordenar por `number` com cópia do array (`sort` muta o cache do React Query)
- [x] 4.5 Derivar `status` com manutenção vencendo `inUse` — resolve o item 7.15 da change anterior
- [x] 4.6 Derivar `in-use` de `session || inUse`, para a grade não mentir se as sessões falharem
- [x] 4.7 Apagar `_data/rooms.ts` — dado fake sem referência restante

## 5. Grade e cartão (concluída)

- [x] 5.1 `ComputerCard` recebendo `computer`, `standardTime` e os quatro callbacks
- [x] 5.2 Três estados descomentados: faixa lateral, caixa do ícone e pílula na cor do estado
- [x] 5.3 Corpo por estado: cota (disponível), advogado + relógio + barra (em uso), desde quando
      (manutenção)
- [x] 5.4 Divisor da barra protegido contra `standardTime` zero
- [x] 5.5 Sinalizar cota do dia esgotada (`usedAllTime`)
- [x] 5.6 Estado "em uso sem sessão registrada", com texto verdadeiro nos dois cenários que o produzem
- [x] 5.7 Tooltip com o `macCode` na caixa do ícone — identifica o gabinete fisicamente
- [x] 5.8 Rodapé por estado: liberar + manutenção, encerrar, devolver à operação
- [x] 5.9 `mt-auto` no rodapé, para os cartões alinharem na grade
- [x] 5.10 Grade `sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4` e estado vazio em caixa tracejada
- [x] 5.11 `StatusSummary` na faixa da sala, lendo o mesmo modelo da grade

## 6. Ações (concluída)

- [x] 6.1 Mutação de liberação, convertendo `birth` para `DDMMYYYY`
- [x] 6.2 Toast de sucesso com nome do advogado e saldo do dia
- [x] 6.3 Toast de alerta separado quando `notified` é falso
- [x] 6.4 Mutação de encerramento, com o saldo restante no toast
- [x] 6.5 Mutações de manutenção, nas duas direções
- [x] 6.6 Diálogos deixam de fechar no confirmar — quem fecha é o container, e só no sucesso
- [x] 6.7 `isPending` nos diálogos: botões travados e rótulo em andamento
- [x] 6.8 Pendência de manutenção por cartão, via `variables` da mutação
- [x] 6.9 Sem ação de manutenção no cartão em uso — a API recusa com `400`
- [x] 6.10 Manutenção sem diálogo de confirmação: não é destrutiva e o caminho de volta é um clique
- [x] 6.11 `refreshBoard()` invalidando salas e liberações após cada ação
- [x] 6.12 Tratamento de `429` com o tempo de espera, reaproveitando `lib/http/api-error`

## 7. Estado da tela (concluída)

- [x] 7.1 Sala na URL (`?sala=`), com `useSearchParams` + `router.replace`
- [x] 7.2 Fronteira de `Suspense` em `page.tsx` — sem ela o build falha ao pré-renderizar
- [x] 7.3 Polling de 30s nas liberações
- [x] 7.4 Esqueleto da grade junto com o da faixa
- [x] 7.5 Aviso de carregamento das sessões, distinto do estado final
- [x] 7.6 Faixa âmbar quando a leitura das sessões falha, explicando o que degradou

## 8. Verificação

- [x] 8.1 `pnpm exec tsc --noEmit` sem erros
- [x] 8.2 `pnpm biome check --write` sem issues
- [x] 8.3 `pnpm build` — as quatro rotas e o proxy registrados
- [x] 8.4 Conferir que `AlertDialogAction` é `Button`, não `Close` — não fecha sozinho
- [ ] 8.5 Conferir contra a `api-fr` local: liberar, encerrar, mandar para manutenção e devolver
- [ ] 8.6 Conferir a recusa de manutenção com máquina em uso
- [ ] 8.7 Conferir a liberação com CPF válido e dados que não conferem
- [ ] 8.8 Conferir `notified: false` com o Desktop desligado
- [ ] 8.9 Conferir a degradação derrubando só a rota de liberações
- [ ] 8.10 Conferir a grade em 320px, 768px e 1440px
- [ ] 8.11 Conferir o cartão por teclado: liberar, manutenção e encerrar

## 9. Próximos passos (fora desta change)

- [ ] 9.1 Histórico de sessões encerradas — a rota já traz tudo, falta a tela (roadmap 7)
- [ ] 9.2 Fila de impressão da sala (roadmap 6)
- [ ] 9.3 Inventário de computadores para ADMIN — aí sim `GET /computers/get-all`
- [ ] 9.4 `loading.tsx` da rota, aproveitando o esqueleto já desenhado
- [ ] 9.5 ⛔ Tempo real — bloqueado até a `api-fr` emitir eventos de negócio no WebSocket
- [ ] 9.6 ⛔ Paginação — bloqueada até a `api-fr` oferecer
