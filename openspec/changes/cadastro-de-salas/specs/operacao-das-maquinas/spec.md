## MODIFIED Requirements

### Requirement: Grade de computadores da sala selecionada

O quadro SHALL apresentar, abaixo da faixa da sala, um cartão por computador da sala selecionada. A fonte
dos computadores MUST ser a sala devolvida por `GET /rooms/get-all`. O painel MUST NOT ler
`GET /computers/get-all` nesta tela, por ser restrita a `ADMIN`.

Cada cartão SHALL identificar a máquina pelo número que ela tem na sala, apresentado com o mesmo termo que o
balcão usa ao falar dela com o advogado — "estação" —, e MUST NOT usar abreviação técnica de inventário. O
número apresentado MUST ser o mesmo devolvido pela API, sem renumeração de tela.

**Motivação:** o rótulo do cartão é lido em voz alta no atendimento. Quem orienta o advogado diz "vá para a
estação 3"; a tela precisa falar a mesma língua.

#### Scenario: Cada máquina da sala tem um cartão

- **WHEN** uma sala com computadores está selecionada
- **THEN** a grade apresenta um cartão por computador daquela sala

#### Scenario: Máquina identificada pelo vocabulário do balcão

- **WHEN** um cartão de máquina é apresentado
- **THEN** ele identifica a máquina como estação seguida do número que ela tem na sala

#### Scenario: Ordem estável entre leituras

- **WHEN** a mesma sala é lida novamente
- **THEN** os cartões aparecem na mesma ordem, crescente pelo número do computador
- **AND** a grade não se reorganiza sozinha entre uma revalidação e outra

#### Scenario: Sala sem computador cadastrado

- **WHEN** a sala selecionada não tem nenhum computador
- **THEN** a grade dá lugar a um estado vazio que informa a ausência
- **AND** orienta que o cadastro de máquinas é feito por um administrador

#### Scenario: Troca de sala troca a grade

- **WHEN** o funcionário escolhe outra sala
- **THEN** a grade passa a apresentar os computadores da sala escolhida
