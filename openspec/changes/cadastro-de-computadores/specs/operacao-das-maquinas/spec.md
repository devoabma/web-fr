## MODIFIED Requirements

### Requirement: Movimentação de máquina para dentro e para fora da manutenção

O cartão SHALL permitir colocar em manutenção um computador disponível e devolver à operação um computador
em manutenção, usando `PATCH /computers/maintenance/:id` e `PATCH /computers/maintenance/:id/remove`. A
ação MUST NOT ser oferecida no cartão em uso, porque a API a recusa enquanto houver sessão em andamento.

Concluída a movimentação, a nova situação da máquina MUST valer também para a listagem administrativa de
computadores, sem recarga da página — as duas telas apresentam o mesmo estado e MUST NOT divergir enquanto
ambas estiverem abertas.

**Motivação:** a manutenção é alternada no balcão, mas é lida também na área administrativa. Uma máquina
que aparece como disponível para o administrador enquanto está parada na grade faz o inventário mentir.

#### Scenario: Máquina disponível pode ir para manutenção

- **WHEN** o cartão está no estado disponível
- **THEN** a ação de colocar em manutenção está disponível ao lado da ação de liberar
- **AND** é identificada para leitores de tela com o nome da máquina

#### Scenario: Máquina em manutenção pode voltar

- **WHEN** o cartão está no estado de manutenção
- **THEN** a ação de devolver à operação está disponível

#### Scenario: Máquina em uso não oferece manutenção

- **WHEN** o cartão está no estado em uso
- **THEN** nenhuma ação de manutenção é apresentada

#### Scenario: Pendência trava apenas o cartão acionado

- **WHEN** uma movimentação de manutenção está em andamento
- **THEN** apenas as ações do cartão acionado ficam indisponíveis
- **AND** os demais cartões da grade continuam operáveis

#### Scenario: Recusa da API é repassada

- **WHEN** a API recusa a movimentação, inclusive por a máquina não pertencer a uma sala do funcionário
- **THEN** a mensagem devolvida pela API é apresentada sem reinterpretação

#### Scenario: Situação refletida na listagem administrativa

- **WHEN** uma máquina é colocada em manutenção ou devolvida à operação pela grade do painel
- **THEN** a listagem administrativa de computadores passa a apresentar a nova situação
- **AND** isso acontece sem recarga da página
