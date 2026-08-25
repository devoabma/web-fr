## MODIFIED Requirements

### Requirement: Listagem das salas cadastradas

A área administrativa de salas SHALL apresentar as salas cadastradas, com nome, **estado**, tempo padrão,
descrição, situação e data de criação. A lista MUST refletir o cadastro recém-concluído sem exigir recarga da
página, e MUST incluir as salas inativas, marcadas como tal.

O estado MUST ser apresentado junto do nome da sala, e não como coluna separada, para ser lido no mesmo
movimento em que se lê a sala.

O tempo padrão MUST ser apresentado com o valor gravado e a leitura em horas, porque é o valor em minutos
que a API guarda e é a leitura em horas que o administrador confere.

**Motivação:** enquanto a tela só cadastrava, quem criava uma sala não tinha como conferir o resultado — a
única defesa contra o cadastro repetido era a recusa da API. O estado entrou na lista porque esta é a única
tela em que uma sala marcada no estado errado pode ser flagrada: do outro lado o sintoma é mudo, a estação
apenas deixa de receber a atualização que deveria.

#### Scenario: Salas apresentadas

- **WHEN** um administrador abre a área de salas
- **THEN** as salas cadastradas são apresentadas com nome, estado, tempo padrão, descrição, situação e data
  de criação
- **AND** as salas inativas constam da lista, identificadas como inativas

#### Scenario: Estado apresentado junto do nome

- **WHEN** uma sala é apresentada na lista
- **THEN** a sigla do estado dela acompanha o nome, distinguível dele
- **AND** MUST NOT ocupar uma coluna própria

#### Scenario: Sala recém-cadastrada aparece na lista

- **WHEN** um cadastro é concluído com sucesso
- **THEN** a sala nova passa a constar da lista
- **AND** isso acontece sem recarga da página

#### Scenario: Carregamento em andamento

- **WHEN** a consulta das salas ainda está em andamento
- **THEN** a tela apresenta um placeholder no formato da própria lista
- **AND** MUST NOT anunciar um total de registros antes de conhecê-lo

#### Scenario: Falha ao carregar

- **WHEN** a consulta das salas falha
- **THEN** a tela apresenta um aviso de falha no lugar da lista, anunciado como alerta
- **AND** MUST NOT apresentar uma lista vazia como se não houvesse salas cadastradas

#### Scenario: Nenhuma sala corresponde

- **WHEN** não há sala a apresentar
- **THEN** a tela informa que nenhuma sala foi encontrada
