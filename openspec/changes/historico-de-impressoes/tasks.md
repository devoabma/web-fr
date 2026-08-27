## 1. Acesso à rota (concluída)

- [x] 1.1 `getAllPrinters(roomId?)` em `src/server/printers/get-all.ts`, com `roomId` opcional no caminho
- [x] 1.2 Tipos da resposta (`PrinterProps` e os aninhados) espelhando o schema da `api-fr`
- [x] 1.3 Chave `getPrinters(roomId?)` em `query-keys.ts`, parametrizada pela sala

## 2. Estrutura da tela (concluída)

- [x] 2.1 `/printers/page.tsx` com título da aba próprio ("Impressões")
- [x] 2.2 Cabeçalho com título e resumo do que a tela faz
- [x] 2.3 Aviso do expurgo semanal e do escopo por papel, oculto abaixo de 640px
- [x] 2.4 `Suspense` em volta do quadro, com esqueleto

## 3. Filtros (concluída)

- [x] 3.1 Seletor de sala com "Todas as salas" à frente, só salas ativas na lista
- [x] 3.2 Sala refletida em `?sala=`, com `router.replace` e sem rolar a página
- [x] 3.3 `?sala=` inválido ou fora do escopo cai em "todas as salas"
- [x] 3.4 Seletor de período: todo o período, hoje, ontem, últimos 7 dias
- [x] 3.5 Corte de período por chave de dia em `America/Fortaleza`, comparada como texto
- [x] 3.6 Janela de 7 dias contando o dia de hoje
- [x] 3.7 Busca por advogado, computador ou sala, com ícone dentro do campo
- [x] 3.8 Altura e recuo dos três controles alinhados na mesma linha

## 4. Tabela (concluída)

- [x] 4.1 Coluna do advogado como identidade da linha, com ladrilho neutro
- [x] 4.2 Colunas de sala e computador com ícone
- [x] 4.3 Data e hora na mesma célula, em `tabular-nums` e no fuso da Seccional
- [x] 4.4 Selo "Hoje" nas impressões do dia
- [x] 4.5 Ação "Abrir" como link real para o arquivo, em aba nova, com `aria-label` próprio
- [x] 4.6 Esqueleto por coluna, com larguras declaradas no `meta`

## 5. Estados (concluída)

- [x] 5.1 Esqueleto da toolbar enquanto as salas carregam
- [x] 5.2 Consulta de impressões esperando as salas (`enabled`)
- [x] 5.3 Erro das impressões substituindo o quadro por mensagem
- [x] 5.4 Erro das salas mantendo a lista e avisando que o filtro por sala caiu
- [x] 5.5 Três mensagens de lista vazia — nada guardado, busca sem resultado, período sem alcance
- [x] 5.6 Contagem do resultado em esqueleto enquanto a consulta corre
- [x] 5.7 Total ao lado da contagem apenas quando algum filtro esconde linhas

## 6. Verificação

- [x] 6.1 `pnpm exec tsc --noEmit` sem erros
- [x] 6.2 `pnpm biome check` sem issues
- [x] 6.3 `pnpm build` sem erros, com `/printers` na lista de rotas
- [ ] 6.4 Entrar como `MEMBER` e conferir que só as salas vinculadas aparecem no seletor e na lista
- [ ] 6.5 Entrar como `ADMIN` e conferir que "Todas as salas" traz mais de uma sala
- [ ] 6.6 Colar `?sala=` de uma sala inexistente e conferir que a tela cai em "todas"
- [ ] 6.7 Recarregar com `?sala=` válido e conferir que o seletor volta na sala certa
- [ ] 6.8 Conferir que trocar período ou busca não mexe na URL
- [ ] 6.9 Conferir uma impressão perto da meia-noite contra o horário do balcão
- [ ] 6.10 Clicar em "Abrir" e conferir que o arquivo abre em aba nova
- [ ] 6.11 Provocar as três mensagens de lista vazia
- [ ] 6.12 Derrubar `/rooms/get-all` e conferir que a lista continua e o aviso aparece
- [ ] 6.13 Conferir a tela abaixo de 640px, onde o aviso do topo não é exibido

## 7. Próximos passos (fora desta change)

- [ ] 7.1 Trocar os filtros do cliente por `?lawyer=`, `?startDate=` e `?endDate=` quando a rota paginar
- [ ] 7.2 Recalcular o corte de período quando a tela atravessa a meia-noite aberta
- [ ] 7.3 Rever o download de verdade se a `api-fr` passar a servir o arquivo pelo próprio domínio
