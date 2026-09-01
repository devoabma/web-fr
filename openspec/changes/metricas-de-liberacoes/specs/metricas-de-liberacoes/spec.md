## ADDED Requirements

### Requirement: Tela de métricas das liberações

O painel SHALL oferecer `/metrics` com quatro indicadores do ano e quatro recortes de contagem: por
ano, por mês, por sala e por advogado. A tela MUST consumir a rota agregada
`GET /lawyers/releases-metrics/:roomId?` e MUST NOT somar o histórico bruto no cliente.

**Motivação:** o recorte por ano exige todo o histórico, e a rota de listagem não pagina. Contar no
navegador faria o custo da tela crescer junto com o passado da Seccional, até ela não abrir mais no
celular do balcão.

A tela MUST ser somente leitura: nenhum indicador MAY levar a uma ação sobre sessões.

#### Scenario: Funcionário abre a tela

- **WHEN** um funcionário autenticado acessa `/metrics`
- **THEN** vê os indicadores do ano corrente e os quatro recortes, no escopo de salas que lhe cabe

#### Scenario: Recorte por papel

- **WHEN** quem acessa é um MEMBER
- **THEN** os números consideram apenas as salas em que ele está vinculado

### Requirement: Ano e sala como estado de endereço

Os filtros de ano e de sala MUST viver na URL, em `?ano=` e `?sala=`. Um `?ano=` fora de faixa MUST
cair no ano corrente, e um `?sala=` que o funcionário não enxerga MUST cair em "todas as salas".

O seletor de ano MUST oferecer sempre o ano selecionado e o ano corrente, além dos anos com registro.

**Motivação:** os dois filtros decidem o que a API agrega, então a tela precisa ser recarregável e
compartilhável. E um ano selecionado ausente da própria lista deixaria o funcionário sem caminho de
volta ao trocar de ano.

#### Scenario: Link compartilhado de um ano sem movimento

- **WHEN** alguém abre `/metrics?ano=2025` e 2025 não teve nenhuma liberação
- **THEN** a tela explica que não houve movimento naquele ano, e 2025 continua listado no seletor

### Requirement: Ranking de salas independente do filtro de sala

O card "Liberações por sala" MUST exibir todas as salas visíveis ao funcionário, inclusive as sem
liberação, mesmo quando há uma sala filtrada. O card MUST declarar esse comportamento ao leitor.

**Motivação:** é um ranking *entre* salas. Aplicar o filtro reduziria o card a uma única barra em
100%, e esconder as salas paradas ocultaria justamente a sala ociosa que o gestor precisa ver.

#### Scenario: Uma sala filtrada

- **WHEN** o funcionário escolhe uma sala específica
- **THEN** os indicadores e os gráficos por ano e por mês passam a considerar só aquela sala, mas o
  ranking de salas continua comparando todas

### Requirement: Leitura honesta de ausência de dado

Um mês que ainda não aconteceu MUST ser exibido como `—`, e não como `0`. A variação percentual MUST
ser omitida quando o período anterior não teve liberações. O tempo médio de sessão MUST ser
apresentado com a sala que serve de referência para o limite de tempo.

**Motivação:** zero afirma que ninguém usou a sala; o traço diz que o mês não chegou. E uma variação
calculada sobre base zero imprimiria um crescimento infinito no primeiro ano de operação.

#### Scenario: Meses futuros do ano corrente

- **WHEN** a tela mostra o ano em curso
- **THEN** os meses que ainda não chegaram aparecem com `—` e barra vazia

#### Scenario: Primeiro ano de operação

- **WHEN** o ano anterior não tem nenhuma liberação registrada
- **THEN** os indicadores aparecem sem a variação percentual

### Requirement: Ranking completo de advogados em painel lateral

O card de advogados MUST mostrar os dez maiores utilizadores e, havendo mais, MUST oferecer "Ver
todos" abrindo um Drawer com o ranking inteiro, sem nova requisição. A largura das barras MUST ser
calculada sobre a lista completa, antes do corte dos dez.

Cada linha MUST identificar o advogado pelo nome e pela inscrição. A sigla da seccional MUST ser
derivada da UF das salas visíveis, e omitida quando houver mais de uma UF.

**Motivação:** homônimos são comuns e o nome sozinho não identifica quem usou a máquina. Cravar a
sigla no código quebraria a marca branca — o model de advogados não guarda UF, quem guarda é a sala.
E calcular a largura depois do corte mediria o décimo colocado contra ele mesmo, deixando todas as
barras cheias.

#### Scenario: Mais de dez advogados no período

- **WHEN** o período tem mais de dez advogados atendidos
- **THEN** o card mostra os dez primeiros e o "Ver todos" abre o ranking completo

#### Scenario: Salas de seccionais diferentes

- **WHEN** as salas visíveis ao funcionário têm UFs diferentes
- **THEN** a inscrição é rotulada apenas como "OAB", sem sigla
