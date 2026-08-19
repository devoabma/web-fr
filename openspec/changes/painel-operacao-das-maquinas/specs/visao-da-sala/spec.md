## MODIFIED Requirements

### Requirement: Seleção entre as salas do escopo do funcionário

O quadro SHALL permitir escolher uma sala entre as devolvidas por `GET /rooms/get-all`. O painel MUST NOT
aplicar filtro por papel — o escopo já chega resolvido pela API. Salas inativas SHALL ser removidas da
lista, e não exibidas em estado desabilitado. A sala escolhida SHALL ser registrada na URL da tela, para
que a página possa ser recarregada e compartilhada sem perder o contexto de trabalho.

#### Scenario: Primeira sala ativa já vem selecionada

- **WHEN** a resposta da API chega com uma ou mais salas ativas e a URL não indica sala
- **THEN** a primeira sala ativa aparece selecionada, sem exigir ação do funcionário

#### Scenario: Escolha do funcionário prevalece

- **WHEN** o funcionário escolhe uma sala diferente da primeira
- **THEN** o quadro passa a exibir a sala escolhida
- **AND** a escolha permanece enquanto a sala continuar na lista

#### Scenario: Sala escolhida sobrevive ao recarregamento

- **WHEN** o funcionário recarrega a página com uma sala escolhida
- **THEN** a mesma sala volta selecionada

#### Scenario: Sala indicada na URL não existe para o funcionário

- **WHEN** a URL indica uma sala inexistente, inativa ou fora do escopo do funcionário
- **THEN** o quadro exibe a primeira sala ativa
- **AND** a tela não fica sem sala nem apresenta erro

#### Scenario: Sala escolhida deixa de existir na lista

- **WHEN** uma nova leitura da API não traz mais a sala escolhida, por ter sido inativada
- **THEN** o quadro volta a exibir a primeira sala ativa
- **AND** a tela não fica sem sala nem apresenta erro

#### Scenario: Sala inativa fora da escolha

- **WHEN** a resposta inclui salas com `inactive` preenchido
- **THEN** essas salas não aparecem na lista de seleção

#### Scenario: Cada sala se identifica na lista

- **WHEN** a lista de salas é aberta
- **THEN** cada item exibe o nome da sala
- **AND** exibe a descrição da sala quando ela existe

#### Scenario: Descrição longa não deforma a lista

- **WHEN** uma sala tem descrição mais longa que a largura da lista
- **THEN** a descrição quebra dentro da largura disponível e é limitada a duas linhas com reticências
- **AND** a lista não rola horizontalmente nem excede a largura do campo de seleção

### Requirement: Cota e tamanho da sala visíveis antes de qualquer ação

O quadro SHALL exibir a cota diária da sala (`standardTime`), a quantidade de computadores cadastrados nela
e a contagem de máquinas em cada estado. O texto MUST deixar claro que a cota é da sala e vale por dia, e
não um crédito por máquina.

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

### Requirement: Estados de carregamento, erro e vazio distinguíveis

O quadro SHALL apresentar estado próprio para carregamento, falha de leitura e ausência de sala, sem
confundir os três. O estado de carregamento MUST reproduzir a estrutura do resultado, para que a faixa não
mude de altura quando os dados chegarem, e SHALL cobrir também a grade de computadores.

#### Scenario: Carregamento preserva a altura da faixa

- **WHEN** a requisição das salas ainda não respondeu
- **THEN** o quadro exibe marcadores de carregamento na mesma disposição do resultado final
- **AND** a grade exibe marcadores de carregamento no lugar dos cartões

#### Scenario: Falha na leitura convida a nova tentativa

- **WHEN** a requisição das salas falha
- **THEN** o quadro informa que não foi possível carregar as salas agora
- **AND** orienta a atualizar a página em instantes

#### Scenario: Nenhuma sala ativa

- **WHEN** a requisição responde sem nenhuma sala ativa para o funcionário
- **THEN** o quadro informa que não há sala ativa cadastrada para a Seccional
- **AND** não apresenta o campo de seleção vazio
