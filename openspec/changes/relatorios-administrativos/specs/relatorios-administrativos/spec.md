## ADDED Requirements

### Requirement: Tela de relatórios da administração

O painel SHALL oferecer `/admin/reports` com três relatórios sobre as liberações: **advogados por
sala**, **movimento por sala** e **ranking de advogados**. A tela MUST ser exclusiva de ADMIN e MUST
considerar todas as salas, inclusive aquelas em que quem acessa não está vinculado.

A tela MUST ser somente leitura: nenhum número MAY levar a uma ação sobre sessões.

Um relatório MUST ser exibido por vez, escolhido na barra de filtros junto de sala e período.

**Motivação:** o relatório é documento, não painel de operação. Recortar por papel faria dois
diretores lerem números diferentes do mesmo período, e o documento deixaria de servir como registro.

#### Scenario: Administrador abre a tela

- **WHEN** um ADMIN acessa `/admin/reports`
- **THEN** vê o relatório de advogados por sala do mês corrente, considerando todas as salas

#### Scenario: A tela não é oferecida a quem não é administrador

- **WHEN** quem está autenticado tem papel MEMBER
- **THEN** a seção Administração não aparece no menu e a rota não é oferecida

### Requirement: Recorte por dia, mês, ano ou intervalo

Os relatórios MUST oferecer quatro modos de período: **Dia**, **Mês**, **Ano** e **Intervalo** com
data inicial e final. O corte do dia MUST usar o fuso da Seccional, o mesmo aplicado pelo restante do
painel, e não o fuso do navegador de quem consulta.

Uma liberação MUST ser atribuída ao período pela sua **data de início**.

**Motivação:** a diretoria pergunta por mês e por ano fechado, e o filtro de período compartilhado
(hoje / ontem / últimos 7 dias) não sabe expressar "março de 2025". E um relatório cortado pelo fuso
do navegador jogaria as liberações da noite do dia 31 para o mês seguinte quando consultado de outro
estado.

#### Scenario: Relatório de um mês fechado

- **WHEN** o administrador escolhe o modo Mês e seleciona março de 2025
- **THEN** o relatório considera apenas as liberações iniciadas entre 1º e 31 de março de 2025, no
  fuso da Seccional

#### Scenario: Intervalo com data final anterior à inicial

- **WHEN** o administrador informa um intervalo cuja data final é anterior à inicial
- **THEN** a tela avisa que o intervalo é inválido e não apresenta números, em vez de exibir um
  relatório vazio que pareceria ausência de movimento

#### Scenario: Sessão iniciada num período e encerrada no seguinte

- **WHEN** uma liberação começa em 31 de março e termina em 1º de abril
- **THEN** ela conta no relatório de março

### Requirement: Relatório de advogados por sala

O relatório SHALL apresentar **uma linha por advogado** atendido no recorte, com nome, inscrição da
OAB, número de acessos, data do primeiro acesso, data do último acesso e tempo consumido.

O relatório MUST declarar, no resumo, quantos advogados distintos e quantas liberações o recorte
contém.

Quando houver uma sala filtrada, o relatório MUST considerar apenas ela; sem filtro, MUST considerar
todas as salas e MUST indicar em quantas salas distintas cada advogado esteve.

**Motivação:** é o relatório que a diretoria pede — "quantos e quais advogados acessaram esta sala
neste mês". A contagem sozinha não serve: é a lista nominal que se anexa a um processo, e homônimos
tornam a inscrição obrigatória para identificar quem usou a máquina.

#### Scenario: Advogados de uma sala em um mês

- **WHEN** o administrador filtra a Sala 2 no modo Mês, em março de 2025
- **THEN** vê a lista nominal dos advogados que usaram aquela sala em março, com quantas vezes cada
  um esteve, e o resumo com o total de advogados distintos e de liberações

#### Scenario: Advogado com mais de um acesso no período

- **WHEN** o mesmo advogado foi liberado quatro vezes no recorte
- **THEN** ele ocupa **uma** linha, com quatro acessos, a data da primeira e a da última visita

#### Scenario: Período sem movimento

- **WHEN** o recorte escolhido não tem nenhuma liberação
- **THEN** a tela explica que não houve movimento naquele período e naquela sala, em vez de exibir
  uma tabela vazia sem explicação

### Requirement: Relatório de movimento por sala

O relatório SHALL apresentar **uma linha por sala**, com liberações, advogados distintos, tempo total
ocupado, tempo médio por sessão e a fatia do movimento do período.

O relatório MUST incluir as salas **sem nenhuma liberação** no recorte, com zero. Salas inativas MUST
permanecer na lista quando tiveram movimento no período.

O relatório MUST considerar todas as salas, independentemente do filtro de sala, e MUST declarar esse
comportamento ao leitor.

**Motivação:** é o comparativo entre salas, e a sala parada é justamente a que o gestor precisa ver —
ela desaparece de qualquer agrupamento feito sobre o histórico. Uma sala desativada saiu de operação,
mas o que aconteceu nela continua tendo acontecido.

Aplicar o filtro de sala aqui tornaria impossíveis os dois requisitos acima: não há como "incluir as
salas sem liberação" numa folha recortada por uma sala, e a "fatia do movimento" de uma linha única
valeria sempre 100%, que não é fatia de nada. É o mesmo comportamento do ranking de salas de
`/metrics` e do `byRoom` da `api-fr`, que documenta ignorar o `roomId` de propósito.

#### Scenario: Sala filtrada no comparativo

- **WHEN** o administrador tem uma sala filtrada e abre o movimento por sala
- **THEN** o comparativo continua listando todas as salas, e o relatório declara isso

#### Scenario: Sala sem movimento no período

- **WHEN** uma sala ativa não teve nenhuma liberação no recorte
- **THEN** ela aparece na lista com zero liberações, e não é omitida

#### Scenario: Sala desativada com movimento no período

- **WHEN** uma sala foi desativada depois de ter recebido liberações no recorte
- **THEN** ela aparece com seus números e é identificada como inativa

### Requirement: Relatório de ranking de advogados

O relatório SHALL ordenar os advogados por número de acessos no recorte, em ordem decrescente,
apresentando posição, nome, inscrição, acessos, quantidade de salas distintas usadas, tempo total e
data do último acesso.

O relatório MUST considerar todas as salas, independentemente do filtro de sala, e MUST declarar esse
comportamento ao leitor.

**Motivação:** é a leitura transversal que o relatório por sala não dá — quem recorre mais ao
serviço, e quem circula entre salas. Aplicar o filtro de sala o reduziria a uma versão ordenada do
primeiro relatório, e esconderia justamente o padrão de circulação que ele existe para revelar.

#### Scenario: Filtro de sala aplicado

- **WHEN** o administrador tem uma sala filtrada e abre o ranking de advogados
- **THEN** o ranking continua considerando todas as salas, e o card declara isso

#### Scenario: Advogado que circula entre salas

- **WHEN** um advogado foi liberado em três salas diferentes no recorte
- **THEN** sua linha registra três salas distintas

### Requirement: Contagem honesta de tempo

O tempo consumido MUST ser somado apenas sobre sessões **encerradas**. Sessões em andamento MUST
contar como acesso e MUST ser declaradas em número no resumo do relatório.

Sessões cuja duração exceda o teto de sessão plausível adotado pela `api-fr` MUST ser excluídas do
cálculo de tempo, permanecendo na contagem de acessos.

**Motivação:** somar o tempo de uma sessão aberta congela um relógio que ainda corre — o mesmo
relatório, gerado dez minutos depois, traria outro número. E uma sessão gravada com duração
implausível, resultado de encerramento tardio após queda do serviço, desloca sozinha a média de um
mês inteiro.

#### Scenario: Sessão ainda aberta no momento da geração

- **WHEN** o recorte inclui uma liberação em andamento
- **THEN** ela conta como acesso, não soma tempo, e o resumo informa quantas sessões estavam abertas

#### Scenario: Registro com duração implausível

- **WHEN** uma sessão encerrada registra duração acima do teto de sessão plausível
- **THEN** ela conta como acesso e é ignorada no tempo total e no tempo médio

### Requirement: Exportação em Excel e PDF

Cada relatório MUST oferecer exportação em `.xlsx` e em PDF, e a exportação MUST conter **todas** as
linhas do recorte, não apenas a página visível na tela.

Os dois arquivos MUST identificar, no próprio documento, o relatório, o período por extenso, a sala
considerada e a data de emissão. O PDF MUST trazer a marca do Sala Livre no cabeçalho.

No `.xlsx`, datas MUST ser gravadas como data e durações como número; a inscrição da OAB MUST ser
gravada como texto.

O PDF MUST repetir o cabeçalho das colunas a cada quebra de página.

**Motivação:** o relatório existe para sair da tela — sem período e sala impressos no documento, uma
folha entregue à diretoria não diz do que trata. Inscrição gravada como número perderia o zero à
esquerda no Excel, e data gravada como texto ordenaria alfabeticamente, quebrando o filtro que a
planilha existe para permitir.

#### Scenario: Exportação com mais linhas do que a página da tabela

- **WHEN** o recorte tem 300 advogados e a tabela mostra 20 por página
- **THEN** o arquivo exportado contém as 300 linhas

#### Scenario: Reordenação da planilha pela diretoria

- **WHEN** a planilha é aberta e ordenada pela coluna de último acesso
- **THEN** a ordenação é cronológica, e não alfabética

#### Scenario: Exportação de um recorte vazio

- **WHEN** o recorte não tem nenhuma liberação
- **THEN** a exportação não é oferecida, em vez de gerar um documento oficial sem linhas

### Requirement: A tela não promete relatório por colaborador

A tela MUST NOT anunciar recorte por colaborador enquanto a `api-fr` não registrar qual funcionário
autorizou cada liberação.

**Motivação:** `computer_sessions` grava apenas o computador e o advogado — a rota de liberação cria
a sessão sem vínculo com quem a autorizou. Anunciar o recorte levaria um administrador a procurar na
tela um filtro que nenhum dado sustenta.

#### Scenario: Leitura do cabeçalho da tela

- **WHEN** o administrador lê a descrição de `/admin/reports`
- **THEN** ela anuncia recorte por período e por sala, e não menciona colaborador
