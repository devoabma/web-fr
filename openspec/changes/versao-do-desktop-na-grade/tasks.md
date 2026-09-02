## 1. Campos da versão no contrato da sala (concluída)

- [x] 1.1 `ComputerProps.appVersion` como `string | null` em `src/server/rooms/get-all.ts`
- [x] 1.2 `ComputerProps.appVersionReportedAt` como `string | null`
- [x] 1.3 `appVersion` tipado como `string`, e não como união fechada — quem decide as versões é o parque
- [x] 1.4 `appVersionReportedAt` documentado como carimbo do informe, nunca como "vista por último"

## 2. Tradução da versão para a grade (concluída)

- [x] 2.1 `ComputerVersionView` com `number`, `reportedAt` e `isOutdated`
- [x] 2.2 `ComputerView.version` como `ComputerVersionView | null`, documentado
- [x] 2.3 `compareVersions` comparando segmento a segmento, com segmento ausente ou não numérico valendo zero
- [x] 2.4 Régua da defasagem = maior versão informada na própria sala
- [x] 2.5 `isOutdated` só quando a versão da máquina é menor que o topo da sala
- [x] 2.6 Estação sem versão informada vira `version: null`, sem entrar no cálculo da régua

## 3. Versão no cartão (concluída)

- [x] 3.1 Coluna à direita do cabeçalho abrigando a pílula de estado e a versão
- [x] 3.2 Número exibido na grade, em `tabular-nums`, sem exigir hover
- [x] 3.3 Âmbar quando `isOutdated`, com variante para o tema escuro
- [x] 3.4 `v—` em tom apagado quando não há versão informada
- [x] 3.5 Tooltip distinguindo os três casos: atrasada, normal e nunca informada
- [x] 3.6 Carimbo no tooltip qualificado como "informada em", com `formatDateTime`
- [x] 3.7 Nenhuma ação do cartão condicionada à versão

## 4. Verificação

- [x] 4.1 `npx tsc --noEmit` sem erros
- [x] 4.2 `npx biome check` sem apontamentos
- [x] 4.3 Campos conferidos na `api-fr`: `appVersion` e `appVersionReportedAt` no schema de resposta e no
      `select` de `GET /rooms/get-all` (commit `b01add1`)
- [x] 4.4 Conferido que a escrita acontece no `register` do WebSocket e é ignorada quando o Desktop não
      manda o campo — o que sustenta o `v—` como ausência, e não como erro
- [ ] 4.5 Conferir numa sala real com versões diferentes: só a atrasada em âmbar
- [ ] 4.6 Conferir numa sala inteira na mesma versão: nenhum destaque
- [ ] 4.7 Conferir com estação que nunca conectou: `v—` e tooltip correspondente
- [ ] 4.8 Conferir a grade com dez cartões: os números alinhados o bastante para a leitura de coluna

## 5. Próximos passos (fora desta change)

- [x] 5.1 Avaliar a mesma informação na listagem de `/admin/computers` — feita na change
      `anatomia-das-tabelas-administrativas` (coluna Desktop)
- [ ] 5.2 Avaliar um resumo por sala ("2 estações atrás da mais nova") se o destaque por cartão não bastar
- [ ] 5.3 Comparar com a versão publicada — **destravado**: a `api-fr` passou a expor `updateStatus` e
      `latestVersion`, consumidos na change `atualizacao-remota-do-desktop`. Segue pendente **aqui**, porque
      a grade lê `GET /rooms/get-all`, que ainda não devolve esses campos
