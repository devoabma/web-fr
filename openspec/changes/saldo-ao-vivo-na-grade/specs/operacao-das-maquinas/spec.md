## MODIFIED Requirements

### Requirement: Sessões em andamento distinguidas do histórico

O painel SHALL obter as sessões da sala em `GET /lawyers/get-all-releases/:roomId`. Como a rota devolve o
histórico completo da sala, o painel MUST considerar em andamento apenas as sessões sem data de
encerramento. Havendo mais de uma sessão aberta para o mesmo computador, a mais recente SHALL prevalecer.

O saldo apresentado SHALL descontar os minutos decorridos desde a resposta que o produziu, sem depender de
uma nova requisição para mudar de valor. O painel MUST NOT apresentar saldo negativo nem crescente. O
painel MUST NOT recalcular cota, bloqueio ou encerramento — a subtração do tempo decorrido é a única
aritmética permitida no cliente.

#### Scenario: Sessão encerrada não ocupa cartão

- **WHEN** a resposta traz sessões já encerradas para um computador livre
- **THEN** o cartão daquele computador continua apresentando o estado disponível

#### Scenario: Sessões são consultadas por sala

- **WHEN** uma sala está selecionada
- **THEN** a consulta de sessões é feita para aquela sala
- **AND** trocar de sala consulta as sessões da nova sala

#### Scenario: Saldo acompanha o tempo decorrido

- **WHEN** um cartão em uso permanece na tela sem nenhuma ação do funcionário
- **THEN** o saldo apresentado diminui à medida que o tempo passa
- **AND** a diminuição não depende de uma nova requisição à API

#### Scenario: Revalidação reancora o saldo

- **WHEN** uma nova resposta de liberações chega, por ação do balcão ou volta de foco
- **THEN** o saldo volta a partir do valor calculado no servidor
- **AND** a contagem do tempo decorrido recomeça daquele instante

#### Scenario: Relógio local atrasado não infla o saldo

- **WHEN** o relógio da estação está atrás do relógio do servidor
- **THEN** o saldo apresentado permanece parado no valor recebido
- **AND** em nenhuma hipótese aumenta na tela

#### Scenario: Cota do dia esgotada é sinalizada

- **WHEN** a sessão em andamento já consumiu toda a cota do dia
- **THEN** o cartão sinaliza o esgotamento

#### Scenario: Saldo zerado na tela sinaliza esgotamento

- **WHEN** o saldo descontado chega a zero antes da próxima revalidação
- **THEN** o cartão sinaliza a cota esgotada
- **AND** não apresenta o cartão como se a sessão seguisse com tempo disponível
