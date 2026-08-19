## ADDED Requirements

### Requirement: Grade de computadores da sala selecionada

O quadro SHALL apresentar, abaixo da faixa da sala, um cartão por computador da sala selecionada. A fonte
dos computadores MUST ser a sala devolvida por `GET /rooms/get-all`. O painel MUST NOT ler
`GET /computers/get-all` nesta tela, por ser restrita a `ADMIN`.

#### Scenario: Cada máquina da sala tem um cartão

- **WHEN** uma sala com computadores está selecionada
- **THEN** a grade apresenta um cartão por computador daquela sala

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

### Requirement: Estado do computador derivado da API

Cada cartão SHALL apresentar exatamente um entre três estados: disponível, em uso e manutenção. Quando um
computador estiver simultaneamente em manutenção e marcado como em uso, o estado apresentado MUST ser
manutenção.

#### Scenario: Máquina em manutenção prevalece sobre ocupação

- **WHEN** um computador chega com data de manutenção e com a marca de uso ativa
- **THEN** o cartão apresenta o estado de manutenção
- **AND** não oferece a ação de encerrar sessão

#### Scenario: Máquina com sessão aberta aparece em uso

- **WHEN** existe uma sessão sem data de encerramento para aquele computador
- **THEN** o cartão apresenta o estado em uso, com o nome do advogado e o saldo da sessão

#### Scenario: Máquina livre aparece disponível

- **WHEN** o computador não está em manutenção e não tem sessão aberta nem marca de uso
- **THEN** o cartão apresenta o estado disponível e a cota diária da sala

#### Scenario: Manutenção informa desde quando

- **WHEN** o computador está em manutenção
- **THEN** o cartão apresenta a data e a hora em que a máquina saiu de operação

### Requirement: Sessões em andamento distinguidas do histórico

O painel SHALL obter as sessões da sala em `GET /lawyers/get-all-releases/:roomId`. Como a rota devolve o
histórico completo da sala, o painel MUST considerar em andamento apenas as sessões sem data de
encerramento. Havendo mais de uma sessão aberta para o mesmo computador, a mais recente SHALL prevalecer.

#### Scenario: Sessão encerrada não ocupa cartão

- **WHEN** a resposta traz sessões já encerradas para um computador livre
- **THEN** o cartão daquele computador continua apresentando o estado disponível

#### Scenario: Sessões são consultadas por sala

- **WHEN** uma sala está selecionada
- **THEN** a consulta de sessões é feita para aquela sala
- **AND** trocar de sala consulta as sessões da nova sala

#### Scenario: Saldo acompanha o tempo decorrido

- **WHEN** um cartão em uso permanece na tela
- **THEN** o saldo apresentado é revalidado periodicamente, sem exigir ação do funcionário

#### Scenario: Cota do dia esgotada é sinalizada

- **WHEN** a sessão em andamento já consumiu toda a cota do dia
- **THEN** o cartão sinaliza o esgotamento

### Requirement: Liberação manual de um computador

O cartão de um computador disponível SHALL oferecer a liberação manual, confirmada por formulário com CPF,
número da OAB e data de nascimento do advogado. O envio SHALL usar `POST /lawyers/release-computer`,
identificando a máquina pelo seu endereço físico. A data de nascimento MUST ser enviada como sequência de
oito dígitos, sem separadores, no formato exigido pela API.

#### Scenario: Liberação bem-sucedida

- **WHEN** os dados conferem com o cadastro da Seccional
- **THEN** o funcionário é informado do nome do advogado liberado e do saldo do dia
- **AND** o formulário é fechado
- **AND** a grade é revalidada

#### Scenario: Dados recusados mantêm o formulário aberto

- **WHEN** a API recusa a liberação por dados que não conferem, situação irregular ou pendência financeira
- **THEN** a mensagem devolvida pela API é apresentada ao funcionário
- **AND** o formulário permanece aberto com os dados já digitados

#### Scenario: Estação offline é avisada

- **WHEN** a liberação é gravada mas a estação não confirma o recebimento do aviso
- **THEN** o funcionário é alertado de que a máquina não vai destravar sozinha

#### Scenario: Formulário não reaproveita o advogado anterior

- **WHEN** o formulário é aberto para uma máquina depois de ter sido usado em outra
- **THEN** os campos aparecem vazios

#### Scenario: Envio em andamento não aceita repetição

- **WHEN** uma liberação está sendo enviada
- **THEN** os botões de confirmar e cancelar ficam indisponíveis até a resposta

### Requirement: Encerramento de sessão em andamento

O cartão de um computador em uso SHALL oferecer o encerramento da sessão, precedido de confirmação
explícita por se tratar de ação destrutiva. A confirmação SHALL informar quem perde o acesso e que o tempo
não utilizado permanece na cota do dia. O envio SHALL usar `POST /lawyers/close-computer/:sessionId`.

#### Scenario: Encerramento bem-sucedido

- **WHEN** o funcionário confirma o encerramento
- **THEN** o funcionário é informado do saldo que resta ao advogado no dia
- **AND** a confirmação é fechada e a grade revalidada

#### Scenario: Falha mantém a confirmação aberta

- **WHEN** a API recusa o encerramento
- **THEN** a mensagem devolvida pela API é apresentada
- **AND** a confirmação permanece aberta

#### Scenario: Máquina ocupada sem sessão localizável

- **WHEN** um computador aparece em uso mas nenhuma sessão aberta responde por ele
- **THEN** o cartão informa a situação
- **AND** a ação de encerrar não fica disponível

### Requirement: Movimentação de máquina para dentro e para fora da manutenção

O cartão SHALL permitir colocar em manutenção um computador disponível e devolver à operação um computador
em manutenção, usando `PATCH /computers/maintenance/:id` e `PATCH /computers/maintenance/:id/remove`. A
ação MUST NOT ser oferecida no cartão em uso, porque a API a recusa enquanto houver sessão em andamento.

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

### Requirement: Limite de tentativas comunicado com o tempo de espera

Quando qualquer ação for recusada por excesso de requisições, o painel SHALL informar quanto tempo falta
para nova tentativa, a partir do valor devolvido pela API. O painel MUST NOT repetir a requisição
automaticamente.

#### Scenario: Espera informada em linguagem corrente

- **WHEN** uma ação é recusada por limite de tentativas
- **THEN** o funcionário é informado do tempo restante em minutos e segundos
- **AND** nenhuma nova tentativa é disparada sem ação do funcionário

### Requirement: Falha na leitura das sessões degrada sem enganar

Quando a consulta de sessões falhar, a grade SHALL permanecer visível apoiada no estado de ocupação que
acompanha a sala, e o quadro SHALL informar que os detalhes das sessões não puderam ser carregados. O
painel MUST NOT apresentar como disponível um computador que a sala informa estar ocupado.

#### Scenario: Ocupação preservada sem os detalhes

- **WHEN** a consulta de sessões falha e a sala informa computadores ocupados
- **THEN** esses cartões continuam no estado em uso
- **AND** não apresentam nome de advogado, saldo nem ação de encerrar

#### Scenario: Degradação é explicada

- **WHEN** a consulta de sessões falha
- **THEN** o quadro apresenta um aviso explicando o que deixou de ser carregado
- **AND** orienta a atualizar a página em instantes

#### Scenario: Carregamento inicial é distinguido da falha

- **WHEN** a consulta de sessões ainda não respondeu
- **THEN** o quadro informa que as sessões estão sendo carregadas
- **AND** esse texto não permanece depois de a consulta falhar
