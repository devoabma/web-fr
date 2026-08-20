## MODIFIED Requirements

### Requirement: Cota e tamanho da sala visíveis antes de qualquer ação

O quadro SHALL exibir a cota diária da sala (`standardTime`), a quantidade de computadores cadastrados nela
e a contagem de máquinas em cada estado. O texto MUST deixar claro que a cota é da sala e vale por dia, e
não um crédito por máquina.

A contagem de máquinas disponíveis MUST NOT incluir as que estão livres com a estação desconectada, porque
elas não aceitam liberação. Essas SHALL ser contadas à parte, e a contagem própria MUST ser omitida quando
não houver nenhuma.

#### Scenario: Cota apresentada como da sala e por dia

- **WHEN** uma sala está selecionada
- **THEN** a cota é apresentada em minutos, qualificada como diária e referente àquela sala

#### Scenario: Contagem de computadores com plural correto

- **WHEN** a sala tem exatamente um computador
- **THEN** o texto usa a forma singular
- **WHEN** a sala tem zero ou mais de um computador
- **THEN** o texto usa a forma plural

#### Scenario: Contagem por estado responde à pergunta do balcão

- **WHEN** uma sala com computadores está selecionada
- **THEN** o quadro apresenta quantas máquinas estão disponíveis, em uso e em manutenção
- **AND** as contagens acompanham as mudanças da grade

#### Scenario: Máquina livre e desconectada não conta como disponível

- **WHEN** há computadores livres com a estação desconectada
- **THEN** eles são apresentados numa contagem própria de offline
- **AND** não são somados à contagem de disponíveis

#### Scenario: Sala inteira conectada não mostra contagem de offline

- **WHEN** nenhum computador livre da sala está desconectado
- **THEN** a contagem de offline não é apresentada
