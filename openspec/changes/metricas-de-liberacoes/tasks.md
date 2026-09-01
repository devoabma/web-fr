## 1. Base de componentes (concluída)

- [x] 1.1 Corrigir `components.json`, que apontava o CSS para `src/app/globals.css` (inexistente)
- [x] 1.2 Instalar `chart`, `card` e `progress` do shadcn; conferir que o `chart` não arrasta Radix
- [x] 1.3 Alinhar os três arquivos ao formato do Biome do projeto

## 2. Acesso aos dados (concluída)

- [x] 2.1 Criar `src/server/lawyers/get-releases-metrics.ts` tipando a resposta agregada
- [x] 2.2 Registrar `getReleasesMetrics` em `src/constants/query-keys.ts`
- [x] 2.3 Acrescentar `lawyer.oab` a `ReleaseProps`, acompanhando a `api-fr`

## 3. View-model (concluída)

- [x] 3.1 Criar `_data/metrics-view.ts` com formatação pt-BR, delta, iniciais e rótulo da inscrição
- [x] 3.2 Derivar a sigla da seccional da UF das salas visíveis, sem cravar "MA" no código
- [x] 3.3 Medir a barra contra o líder e o percentual contra o total
- [x] 3.4 Escrever a mensagem de vazio a partir da causa
- [x] 3.5 Testar o filtro de sala **antes** da falta de histórico em `buildEmptyMessage`: `byYear`
      também é recortado pela sala, então uma sala nunca usada caía na mensagem geral e afirmava
      que o produto inteiro estava zerado
- [x] 3.6 Reusar `getInitials` e `formatMinutes` de `@/utils` em vez de reimplementá-los. O
      `getInitials` local pegava as **duas primeiras palavras** — "Maria da Silva" virava "MD" — e
      dava a mesma pessoa iniciais diferentes das do resto do painel, que usa primeiro + último

## 4. Tela (concluída)

- [x] 4.1 `metrics-board.tsx` com as consultas, os filtros de ano e sala na URL e os três estados
- [x] 4.2 Quatro `metric-kpi-card`, com o delta omitido quando não há base de comparação
- [x] 4.3 Gráficos por ano e por mês, com rótulos numa linha fixa no topo e traço nas barras zeradas
- [x] 4.4 Ranking de salas, sempre entre todas as salas visíveis
- [x] 4.5 Ranking de advogados com top 10 e "Ver todos" abrindo o Drawer
- [x] 4.6 Reescrever `page.tsx` mantendo o `metrics-notice` como estava
- [x] 4.7 `shrink-0` em todo bloco de primeiro nível — o layout privado comprimia os cards em vez de rolar
- [x] 4.8 Parear anual+mensal (3 colunas) e os dois rankings (2 colunas), em vez de empilhar os quatro

## 5. Verificação (concluída)

- [x] 5.1 `tsc --noEmit` sem erros
- [x] 5.2 `biome check src` sem issues
- [x] 5.3 `next build` sem erros
- [x] 5.4 Tela conferida no navegador contra a `api-fr` real: ADMIN, filtro de sala, ano sem
      registro e viewport de 390 px
- [x] 5.5 Medido em janela de 935 px de altura, sem `captureBeyondViewport`: nenhum bloco cortado e
      o container volta a rolar
- [x] 5.6 `tsc`, `biome` e `next build` refeitos depois da correção de 3.5
