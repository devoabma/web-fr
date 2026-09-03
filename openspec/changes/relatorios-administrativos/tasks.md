## 1. Dependências

- [x] 1.1 Instalar `write-excel-file`, `jspdf` e `jspdf-autotable`
- [x] 1.2 Conferir que nenhuma delas é importada no topo de módulo — só por `import()` dentro do
      handler de exportação, senão quem apenas abre a tela paga o download

## 2. Recorte de período

- [x] 2.1 Extrair o formatador de chave de dia de `_components/shared/filters/match-period.ts` para
      reuso, sem cravar o fuso da Seccional num segundo lugar do código
- [x] 2.2 Criar `_data/report-period.ts` com os quatro modos (dia, mês, ano, intervalo): resolução do
      recorte a partir da URL, limites do período e rótulo por extenso para o cabeçalho dos arquivos
- [x] 2.3 Atribuir a liberação ao período pela **data de início** — uma sessão que vira o mês conta no
      mês em que começou
- [x] 2.4 Tratar intervalo com data final anterior à inicial como inválido e sinalizado, e não como
      período vazio: relatório em branco seria lido como "não houve movimento"
- [x] 2.5 Cair no padrão (mês corrente / todas as salas / advogados por sala) quando a URL trouxer
      valor fora de faixa, em vez de deixar a tela em branco

## 3. Agregações

- [x] 3.1 Criar `_data/reports-view.ts` sem JSX, recebendo `ReleaseProps[]` e devolvendo as três
      tabelas — é o ponto único a trocar quando a `api-fr` ganhar recorte de data
- [x] 3.2 Advogados por sala: uma linha por advogado, com acessos, primeiro acesso, último acesso,
      tempo consumido e salas distintas quando não há sala filtrada
- [x] 3.3 Movimento por sala: partir de `getAllRooms`, **não** do histórico, para que a sala sem
      movimento entre com zero em vez de sumir do agrupamento
- [x] 3.4 Manter na lista a sala inativa que teve movimento no período, identificada como inativa
- [x] 3.5 Ranking de advogados: ordenado por acessos, sempre sobre todas as salas, ignorando o filtro
      de sala de propósito
- [x] 3.6 Somar tempo só de sessões encerradas e contar quantas estavam abertas, para o resumo
      explicar por que o total é menor do que pareceria
- [x] 3.7 Espelhar o teto de 24 h da `api-fr` (`MAX_PLAUSIBLE_SESSION_HOURS`) no cálculo de tempo,
      com o comentário dizendo de onde o valor vem — uma sessão fechada tardiamente após queda do
      serviço desloca sozinha a média do mês
- [x] 3.8 Escrever a mensagem de vazio a partir da causa (sala sem movimento, período sem movimento,
      intervalo inválido, base sem histórico), como `buildEmptyMessage` de `/metrics` faz

## 4. Exportação

- [x] 4.1 Criar `src/lib/export/` com um modelo de documento comum aos três relatórios: título,
      período por extenso, sala, data de emissão, colunas e linhas
- [x] 4.2 Gerador `.xlsx` com `write-excel-file`, tipando célula a célula
- [x] 4.3 Gravar data como data, duração como número e **inscrição da OAB como texto** — o Excel come
      o zero à esquerda ao adivinhar que a inscrição é número, e data como texto ordena
      alfabeticamente, quebrando o filtro que a planilha existe para permitir
- [x] 4.4 Gerador PDF com `jspdf` + `jspdf-autotable`, alimentado pelo modelo e **não pelo DOM**:
      a tabela na tela é paginada e sairia com uma página de linhas
- [x] 4.5 Repetir o cabeçalho das colunas a cada quebra de página e numerar as páginas no rodapé
- [x] 4.6 Exportar **todas** as linhas do recorte, não a página visível da tabela
- [x] 4.7 Nomear o arquivo pelo relatório e pelo período (ex.: `advogados-por-sala-2025-03.xlsx`)
- [x] 4.8 Não oferecer exportação quando o recorte está vazio — documento oficial sem linhas é pior
      que documento ausente
- [x] 4.9 Botão em estado de espera enquanto o `import()` da biblioteca chega, e erro tratado sem
      derrubar a tela

## 5. Tela

- [x] 5.1 `reports-board.tsx` com a consulta única de `getAllReleases()` em cache servindo os três
      relatórios e todas as trocas de filtro, sem nova requisição ao trocar sala, período ou relatório
- [x] 5.2 Barra de filtros com `Select` de relatório, `RoomFilter` reusado e o seletor de período
      novo, com `<input type="date">` nativo — sem biblioteca de calendário
- [x] 5.3 Levar relatório, sala e período para a URL (`?relatorio=`, `?sala=`, `?periodo=`, `?de=`,
      `?ate=`): o relatório é documento e precisa ser um link que abre a mesma coisa noutra máquina
- [x] 5.4 Resumo acima da tabela com advogados distintos, liberações, tempo total e sessões abertas
- [x] 5.5 As três tabelas com `DataTable`, seguindo a anatomia das tabelas administrativas
- [x] 5.6 Estados de carregamento, erro e vazio, com esqueleto que não faça o layout saltar
- [x] 5.7 `shrink-0` em todo bloco de primeiro nível — o layout privado comprime os blocos em vez de
      rolar, como aconteceu em `/metrics`
- [x] 5.8 Reescrever o subtítulo de `page.tsx` removendo a promessa de recorte "por colaborador", que
      nenhum dado sustenta
- [x] 5.9 Acrescentar ao `reports-notice` que o tempo é contado só sobre sessões encerradas e que os
      números podem divergir de `/metrics`, que recorta por ano e por papel

## 6. Verificação

- [x] 6.1 `tsc --noEmit` sem erros
- [x] 6.2 `biome check src` sem issues
- [x] 6.3 `next build` sem erros
- [ ] 6.4 Conferir na `api-fr` real: relatório de um dia, de um mês, de um ano e de um intervalo
- [ ] 6.5 Conferir o total de liberações do relatório de um ano contra o KPI de `/metrics` do mesmo
      ano como ADMIN — os dois devem bater, e uma divergência aqui denuncia erro de fuso no recorte
- [ ] 6.6 Abrir os quatro arquivos gerados (`.xlsx` e PDF de dois relatórios) e conferir cabeçalho,
      tipos das colunas, zero à esquerda da inscrição e quebra de página
- [x] 6.7 Conferir que o bundle da tela não cresce com as três bibliotecas — elas só devem aparecer
      no chunk carregado ao exportar
- [ ] 6.8 Conferir em viewport de 390 px

## 7. Ajustes de interface

- [x] 7.1 Enxugar o `reports-notice`: sai a frase de escopo administrativo e tudo o que o próprio
      relatório já imprime no resumo; ficam só as duas explicações que a tela não dá sozinha
- [x] 7.2 Trocar o `<input type="date">` pelo `Calendar` + `Popover` do shadcn, em pt-BR
      (`locale={ptBR}`), com `captionLayout="dropdown"` para alcançar anos anteriores sem
      vinte e quatro cliques na seta
- [x] 7.3 Montar e ler o `Date` do calendário pelas **partes locais**: `new Date('2025-03-12')` é
      meia-noite UTC e retrocede um dia em fuso a oeste — o calendário abriria marcando 11 para quem
      escolheu 12
- [x] 7.4 Manter mês e ano em `Select`, não em calendário: numa grade de dias, "março de 2025"
      obrigaria a clicar num dia arbitrário para significar o mês inteiro
- [x] 7.5 Desenhar a marca do Sala Livre no cabeçalho do PDF, em vetor, traduzindo os arcos do
      `public/logo.svg` para curvas de Bézier — sem PNG embutido para manter sincronizado
- [x] 7.6 Verificado no stream do PDF: oito curvas, sete retas e as duas cores da marca
