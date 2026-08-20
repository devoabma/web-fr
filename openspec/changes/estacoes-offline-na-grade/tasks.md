## 1. Consulta das estações conectadas (concluída)

- [x] 1.1 `src/server/computers/get-online.ts` — `GET /computers/online/:roomId`
- [x] 1.2 Tipos `OnlineComputerProps` e `GetOnlineComputersResponse` espelhando a resposta da `api-fr`
- [x] 1.3 `connectedAt` documentado como a conexão atual, não o uptime da máquina
- [x] 1.4 Chave `getOnlineComputers(roomId)` em `src/constants/query-keys.ts`

## 2. Terceira consulta da tela (concluída)

- [x] 2.1 `useQuery` das conectadas, habilitada só com sala selecionada
- [x] 2.2 `refetchInterval` de 20s — estação recém-ligada não avisa o painel
- [x] 2.3 `LIVE_QUERY_OPTIONS` aplicado depois do intervalo, mantendo o padrão das outras duas
- [x] 2.4 Ids conectados montados em `Set`, ou `null` enquanto não houver resposta
- [x] 2.5 `refreshBoard()` invalidando também a lista de conectadas
- [x] 2.6 Aviso de degradação quando a consulta falha, no mesmo padrão do erro das liberações

## 3. `isOnline` na tradução da grade (concluída)

- [x] 3.1 `ComputerView.isOnline` como `boolean | null`, documentado
- [x] 3.2 `buildComputerViews` recebe `onlineComputerIds`, com `null` por padrão
- [x] 3.3 Ausência no conjunto vira `false`; conjunto ausente vira `null`

## 4. Cartão da máquina muda (concluída)

- [x] 4.1 `isOffline` derivado só de `isOnline === false` — `null` não bloqueia nada
- [x] 4.2 `isFree` e `isAvailableOffline` separando as duas leituras do estado disponível
- [x] 4.3 Tom âmbar na borda, na faixa, no ícone e na pílula, com variante para o tema escuro
- [x] 4.4 Pílula rotulada "Offline" em vez de "Disponível"
- [x] 4.5 Corpo do cartão explicando o motivo provável e o que fazer
- [x] 4.6 Botão de liberar desabilitado, com o rótulo trocado para "Offline"
- [x] 4.7 Manutenção mantida disponível na máquina offline
- [x] 4.8 Máquina em uso e offline: encerramento mantido, com a ressalva de que a tela não será limpa

## 5. Desfazer a liberação não entregue (concluída)

- [x] 5.1 `undoOfflineRelease` encerrando a sessão recém-criada
- [x] 5.2 Condição por `expiresAt && !notified`, para não encerrar o 200 sem sessão nova
- [x] 5.3 Mensagem própria para o caminho em que o encerramento também falha
- [x] 5.4 Diálogo de liberação ocupado durante o desfazer (`isReleasing || isClosing`)
- [x] 5.5 Aviso antigo de `notified: false` removido — deixou de ser só informativo

## 6. Contagem por estado (concluída)

- [x] 6.1 Livres e mudas descontadas de `available`
- [x] 6.2 Pílula âmbar de offline, exibida só quando houver alguma

## 7. Verificação

- [x] 7.1 `pnpm exec tsc --noEmit` sem erros
- [x] 7.2 `pnpm biome check --write` sem apontamentos
- [x] 7.3 `pnpm build` — as quatro rotas e o proxy registrados
- [x] 7.4 Rota conferida na `api-fr`: `GET /computers/online/:roomId` registrada sob o prefixo `/computers`
      e devolvendo `{ computers: [{ id, macCode, roomId, connectedAt }] }`
- [ ] 7.5 Conferir com o Desktop fechado: cartão em âmbar, botão travado, pílula de offline no topo
- [ ] 7.6 Conferir a estação caindo entre o refetch e o clique: sessão desfeita e mensagem de "use outro"
- [ ] 7.7 Conferir a estação sendo ligada com o painel aberto: cartão volta ao verde em até 20s
- [ ] 7.8 Conferir a API fora do ar nesta rota: aviso de degradação e liberação seguindo pelo desfazer
- [ ] 7.9 Conferir o encerramento de sessão numa máquina offline: cota volta e o cartão fica disponível

## 8. Próximos passos (fora desta change)

- [ ] 8.1 Rever o intervalo de 20s depois de a sala rodar um dia — pode folgar se a operação não sentir
- [ ] 8.2 Avaliar mostrar há quanto tempo a estação está conectada (`connectedAt`), hoje descartado
- [ ] 8.3 ⛔ Tempo real — segue bloqueado até a `api-fr` emitir eventos de negócio no WebSocket
