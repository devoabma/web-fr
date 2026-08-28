## 1. Acesso à rota (concluída)

- [x] 1.1 `getAllReleases(roomId?)` com sala opcional, montando o caminho com ou sem ela
- [x] 1.2 Documentação da função reescrita: escopo por papel e os dois consumidores
- [x] 1.3 Painel de operação seguindo com a sala obrigatória, sem alteração de comportamento

## 2. Modelo da situação (concluída)

- [x] 2.1 `ReleaseStatus` com `in-progress`, `exhausted` e `closed`
- [x] 2.2 `buildReleaseViews` derivando o status de `endDate` + `usedAllTime`
- [x] 2.3 Desconto dos minutos decorridos nas sessões abertas
- [x] 2.4 Cota zerada na tela virando `usedAllTime` sem mudar o status para fechada
- [x] 2.5 Rótulos curtos (`RELEASE_STATUS_LABELS`) e em frase corrida (`RELEASE_STATUS_SENTENCES`)

## 3. Filtros compartilhados (concluída)

- [x] 3.1 `RoomFilter` extraído para `_components/shared/filters/`
- [x] 3.2 `PeriodFilter` extraído, com lista de períodos configurável
- [x] 3.3 `createPeriodMatcher` extraído para `match-period.ts`
- [x] 3.4 Limites do período calculados uma vez, fora da varredura das linhas
- [x] 3.5 `last-30-days` disponível, fora da lista padrão
- [x] 3.6 `allRoomsDescription` e `allPeriodDescription` por tela
- [x] 3.7 `printers-board.tsx` reescrito como `printers-table.tsx` sobre os filtros compartilhados
- [x] 3.8 `printers/page.tsx` apontando para o componente novo
- [x] 3.9 Arquivos antigos de filtro removidos de `printers/_components/`

## 4. Estrutura da tela (concluída)

- [x] 4.1 `/releases/page.tsx` com título da aba próprio ("Liberações")
- [x] 4.2 Cabeçalho com título e resumo do que a tela responde
- [x] 4.3 Aviso de que a tela é registro, não operação, com o escopo por papel
- [x] 4.4 Aviso oculto abaixo de 640px
- [x] 4.5 `Suspense` em volta da tabela, com esqueleto

## 5. Toolbar (concluída)

- [x] 5.1 Quatro controles em grade responsiva (1 / 2 / 4 colunas)
- [x] 5.2 Sala refletida em `?sala=`, com `router.replace` e sem rolar a página
- [x] 5.3 `?sala=` inválido ou fora do escopo caindo em "todas as salas"
- [x] 5.4 Sala inativa mantida na lista do filtro
- [x] 5.5 Período com os cinco recortes, incluindo 30 dias
- [x] 5.6 Filtro de situação com descrição por opção
- [x] 5.7 Busca por advogado, computador ou sala
- [x] 5.8 Altura e recuo dos quatro controles alinhados

## 6. Contagem e ladrilhos (concluída)

- [x] 6.1 Ladrilhos por situação, nas cores dos três estados
- [x] 6.2 Contagem dos ladrilhos sobre o recorte de período e busca, sem a situação
- [x] 6.3 Contagem do resultado com o período por extenso
- [x] 6.4 Total ao lado apenas quando algum filtro esconde linhas
- [x] 6.5 Contagem em esqueleto enquanto a consulta corre

## 7. Tabela (concluída)

- [x] 7.1 Advogado como identidade da linha
- [x] 7.2 Colunas de sala e computador
- [x] 7.3 Coluna "Liberado em" com data e hora no fuso da Seccional
- [x] 7.4 Coluna de duração, andando nas sessões abertas
- [x] 7.5 Coluna de situação com os três estados
- [x] 7.6 Esqueleto por coluna, com larguras declaradas no `meta`

## 8. Estados (concluída)

- [x] 8.1 Esqueleto da toolbar enquanto as salas carregam
- [x] 8.2 Consulta de liberações esperando as salas (`enabled`)
- [x] 8.3 Erro das liberações substituindo a tabela por mensagem
- [x] 8.4 Erro das salas mantendo a lista e avisando que o filtro caiu
- [x] 8.5 Quatro mensagens de lista vazia, com a situação falando por último

## 9. Verificação

- [x] 9.1 `pnpm exec tsc --noEmit` sem erros
- [x] 9.2 `pnpm biome check` sem issues
- [x] 9.3 `pnpm build` sem erros, com `/releases` na lista de rotas
- [ ] 9.4 Entrar como `MEMBER` e conferir que só as salas vinculadas aparecem
- [ ] 9.5 Entrar como `ADMIN` e conferir que "Todas as salas" traz mais de uma sala
- [ ] 9.6 Abrir uma sessão no painel e conferir que ela aparece como "em andamento"
- [ ] 9.7 Deixar a tela aberta e conferir que a duração da sessão aberta anda sozinha
- [ ] 9.8 Encerrar a sessão pelo balcão e conferir que ela vira "encerrada"
- [ ] 9.9 Deixar uma sessão esgotar a cota e conferir que ela vira "tempo esgotado"
- [ ] 9.10 Escolher uma situação e conferir que os ladrilhos não zeram
- [ ] 9.11 Provocar as quatro mensagens de lista vazia
- [ ] 9.12 Colar `?sala=` inexistente e conferir a queda em "todas"
- [ ] 9.13 Conferir que período, situação e busca não mexem na URL
- [ ] 9.14 Derrubar `/rooms/get-all` e conferir que a lista continua e o aviso aparece
- [ ] 9.15 Conferir que a tela de impressões continua idêntica após a troca dos filtros
- [ ] 9.16 Conferir a tela abaixo de 640px

## 10. Próximos passos (fora desta change)

- [ ] 10.1 Paginação no servidor quando o histórico crescer — é aqui que o volume aperta primeiro
- [ ] 10.2 Filtros por advogado e data no servidor, se a `api-fr` passar a aceitá-los
- [ ] 10.3 Recalcular o corte de período quando a tela atravessa a meia-noite aberta
- [ ] 10.4 Relatórios da seção 7 do roadmap, todos bloqueados na `api-fr`
