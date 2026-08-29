## ADDED Requirements

### Requirement: Selo de saúde baseado em consulta

O painel SHALL apresentar, no cabeçalho de todas as telas privadas, um selo indicando se a API consegue
atender às requisições do painel.

O selo MUST refletir uma consulta efetiva à API. Ele MUST NOT apresentar um estado fixo em código.

A consulta MUST ser repetida periodicamente enquanto o painel estiver aberto, e MUST ser refeita quando
a aba volta ao foco.

**Motivação:** o selo anterior era um valor fixo escrito "All OK" — continuaria verde com a API fora do
ar. Um indicador que só sabe afirmar que está tudo bem treina quem opera a confiar nele, e falha
exatamente quando é necessário.

#### Scenario: API atendendo

- **WHEN** a API responde que está pronta para atender
- **THEN** o selo indica que está tudo certo

#### Scenario: API fora do ar

- **WHEN** a consulta falha por qualquer motivo
- **THEN** o selo indica ausência de conexão
- **AND** volta a indicar normalidade na primeira consulta bem-sucedida seguinte

### Requirement: Estado indeterminado distinto

Enquanto a primeira consulta não tiver retornado, o selo SHALL apresentar um estado próprio de
verificação, distinto tanto do estado de normalidade quanto do de falha.

**Motivação:** é na carga inicial que um selo verde mentiria com mais confiança — antes de qualquer
resposta, não há informação que sustente a afirmação.

#### Scenario: Primeira carga do painel

- **WHEN** o painel é aberto e a primeira consulta ainda não retornou
- **THEN** o selo indica que está verificando
- **AND** não indica normalidade nem falha

### Requirement: Consulta com teto de espera

A consulta de saúde SHALL ter um teto de espera próprio, independente das demais chamadas do painel.

**Motivação:** o cliente HTTP do painel não define teto global, e está correto assim — em rotas de dado,
esperar é melhor do que abortar uma leitura que chegaria. Numa sonda, o oposto: uma requisição
pendurada não é carregamento, é o próprio sintoma que o selo existe para mostrar.

#### Scenario: API aceita a conexão e não responde

- **WHEN** a consulta excede o teto de espera
- **THEN** o selo indica ausência de conexão
- **AND** não permanece indefinidamente no estado de verificação

### Requirement: Falha sinalizada sem retentativa imediata

A consulta de saúde MUST NOT repetir automaticamente uma tentativa que falhou antes de sinalizar a
falha no selo.

**Motivação:** a política geral do painel tenta novamente em falhas de servidor e de rede, o que é
adequado para leituras de dado. Aqui, retentar apenas atrasa a má notícia: a próxima consulta periódica
já cumpre o papel de nova tentativa.

#### Scenario: Falha isolada

- **WHEN** uma consulta falha
- **THEN** o selo passa imediatamente a indicar ausência de conexão

## MODIFIED Requirements

### Requirement: Data de registro no padrão do painel

As datas apresentadas nas tabelas do painel SHALL seguir um único desenho — dia, mês abreviado e ano —
inclusive nas tabelas que também apresentam horário.

Nos registros em que o momento do evento importa, a data MUST ser apresentada no fuso da Seccional, e
MUST NOT depender do fuso configurado no navegador de quem consulta.

**Motivação:** a coluna de impressões usava numeração por barras enquanto as demais usavam mês
abreviado. Unificar o desenho não pode custar a correção do fuso: uma impressão registrada às 22h
apareceria no dia seguinte para quem estivesse com o relógio em outro fuso, e a marcação de "hoje"
desapareceria junto.

#### Scenario: Consulta de outro fuso horário

- **WHEN** o histórico de impressões é consultado de um navegador em fuso diferente do da Seccional
- **THEN** cada impressão é apresentada na data e hora em que ocorreu no balcão

#### Scenario: Desenho uniforme

- **WHEN** o usuário passa de uma tabela do painel para outra
- **THEN** as datas aparecem no mesmo formato
