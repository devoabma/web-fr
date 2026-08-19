## 1. Contagem do tempo decorrido (concluída)

- [x] 1.1 `src/hooks/use-elapsed-minutes.ts` — minutos inteiros desde um instante em epoch
- [x] 1.2 Tique de 30s, para o atraso visível nunca passar de meio minuto
- [x] 1.3 Primeira contagem dentro do `useEffect`, para não gravar relógio no HTML do servidor
- [x] 1.4 `Math.max(0, …)` no decorrido — relógio local atrasado faria o saldo crescer
- [x] 1.5 Origem `0` (resposta que ainda não chegou) desliga a contagem e zera o estado
- [x] 1.6 `clearInterval` no retorno do efeito

## 2. Saldo envelhecido na tradução (concluída)

- [x] 2.1 `buildComputerViews` recebe `elapsedMinutes`, com `0` por padrão
- [x] 2.2 `buildSessionView` extraída — a montagem da sessão passou a ter aritmética e decisões
- [x] 2.3 `remainingMinutes` travado em zero pelo piso
- [x] 2.4 `usedMinutes` somado com o decorrido, para os dois números continuarem coerentes
- [x] 2.5 `usedAllTime` verdadeiro também com saldo zerado na tela

## 3. Consultas da tela (concluída)

- [x] 3.1 `LIVE_QUERY_OPTIONS` (`staleTime: 0`, `refetchOnWindowFocus`) nas salas e nas liberações
- [x] 3.2 `refetchInterval` de 30s removido — o relógio não depende mais dele
- [x] 3.3 `dataUpdatedAt` das liberações como âncora da contagem
- [x] 3.4 `elapsedMinutes` repassado à montagem da grade

## 4. Ajustes de leitura (concluída)

- [x] 4.1 Relógio em `01h:12min` — sem unidade, `01:12` era lido como hora do dia
- [x] 4.2 `animate-pulse` no ponto da pílula de estado
- [x] 4.3 Aviso da tela: espaço faltando entre a frase da inscrição e a da cota, e ponto final duplicado
- [x] 4.4 Comentários redundantes removidos das mutações de manutenção e do `page.tsx`

## 5. Verificação

- [x] 5.1 `pnpm exec tsc --noEmit` sem erros
- [x] 5.2 `rtk proxy pnpm biome check --write` — formatação aplicada
- [x] 5.3 `pnpm build` — as quatro rotas e o proxy registrados
- [ ] 5.4 Conferir na `api-fr` local que o relógio anda com a aba parada e bate com o servidor no refetch
- [ ] 5.5 Conferir o cartão ao chegar em `00h:00min`: aviso de cota esgotada antes da API encerrar
- [ ] 5.6 Conferir a volta de foco trazendo sessão aberta por fora do painel
- [ ] 5.7 Conferir que não há aviso de hidratação no console ao abrir a tela

## 6. Próximos passos (fora desta change)

- [ ] 6.1 Reavaliar um `refetchInterval` folgado (60s+) se a defasagem com o Desktop incomodar a operação
- [ ] 6.2 ⛔ Tempo real — segue bloqueado até a `api-fr` emitir eventos de negócio no WebSocket
