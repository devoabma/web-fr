## ADDED Requirements

### Requirement: Versão do Desktop visível em cada cartão da grade

Cada cartão SHALL apresentar, sem exigir interação, a última versão do Desktop informada pela estação. A
fonte MUST ser `appVersion` do computador devolvido por `GET /rooms/get-all` — a mesma resposta que
alimenta a grade, sem requisição adicional.

Quando a estação nunca tiver informado uma versão, o cartão MUST apresentar uma marca de ausência em vez de
omitir a linha, e MUST NOT tratar a ausência como erro.

A apresentação MUST usar numeração tabular, para que os números caiam alinhados entre cartões vizinhos.

#### Scenario: Estação com versão informada

- **WHEN** o computador chega com uma versão informada
- **THEN** o cartão apresenta esse número na grade, sem necessidade de hover ou clique

#### Scenario: Estação que nunca informou a versão

- **WHEN** o computador chega sem versão informada
- **THEN** o cartão apresenta uma marca de ausência de informação, em tom mais apagado
- **AND** a explicação disponível diz que a estação nunca informou, sem caracterizar um erro

#### Scenario: API antiga que não devolve o campo

- **WHEN** a resposta da sala não traz o campo de versão em nenhum computador
- **THEN** todos os cartões apresentam a marca de ausência
- **AND** a grade segue funcionando em todo o resto

### Requirement: Estação atrás das vizinhas destacada na grade

O cartão SHALL destacar visualmente a estação cuja versão for anterior à maior versão informada por algum
computador **da mesma sala**. A régua MUST ser a própria sala, e não uma versão de referência fixada no
painel.

A comparação entre versões MUST ser numérica, segmento a segmento, e MUST NOT ser alfabética. Segmento
ausente ou não numérico MUST ser tratado como zero, de modo que uma versão em formato inesperado deixe de
gerar destaque em vez de destacar a máquina errada.

O destaque MUST ser apenas informativo: ele MUST NOT bloquear liberação, encerramento de sessão ou
movimentação para manutenção.

#### Scenario: Uma máquina atrás das demais

- **WHEN** um computador da sala informa versão anterior à maior versão informada na mesma sala
- **THEN** o cartão dele destaca a versão em âmbar
- **AND** a explicação disponível diz que ele está atrás de outras estações daquela sala

#### Scenario: Sala inteira na mesma versão

- **WHEN** todos os computadores da sala informam a mesma versão
- **THEN** nenhum cartão é destacado

#### Scenario: Ordem numérica prevalece sobre a alfabética

- **WHEN** a sala tem uma estação em `1.0.10` e outra em `1.0.7`
- **THEN** a destacada é a de `1.0.7`

#### Scenario: Destaque não interfere na operação

- **WHEN** um computador está com a versão atrasada e disponível
- **THEN** a liberação continua oferecida normalmente
- **AND** as demais ações do cartão seguem inalteradas

### Requirement: Carimbo da versão apresentado como informe, não como presença

Quando houver data de informe da versão, o cartão SHALL apresentá-la qualificada como o momento em que a
estação **informou** o número. O painel MUST NOT apresentar esse carimbo como última vez em que a máquina
esteve online.

#### Scenario: Carimbo qualificado

- **WHEN** o computador chega com versão e data de informe
- **THEN** a explicação disponível apresenta a data e a hora qualificadas como quando a versão foi informada

#### Scenario: Máquina há semanas conectada

- **WHEN** uma estação permanece conectada sem reconectar desde o último informe
- **THEN** o carimbo apresentado permanece antigo
- **AND** isso não é apresentado como sinal de que a máquina esteja fora do ar
