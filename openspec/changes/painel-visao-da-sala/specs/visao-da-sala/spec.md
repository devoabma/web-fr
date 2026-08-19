## ADDED Requirements

### Requirement: Tela inicial do painel apresenta a sala em operação

A rota `/panel` SHALL apresentar a visão da sala como primeira tela de operação do painel autenticado,
composta por cabeçalho de identificação da área, aviso de uso e o quadro da sala selecionada. A tela MUST
ser renderizada dentro da moldura do grupo de rotas privadas, sem redeclarar barra superior ou navegação.

#### Scenario: Rota deixa de ser placeholder

- **WHEN** um funcionário autenticado abre `/panel`
- **THEN** a tela apresenta o título da área e uma descrição do que ela permite fazer
- **AND** apresenta o quadro da sala abaixo do cabeçalho

#### Scenario: Não autenticado não chega à tela

- **WHEN** alguém sem sessão tenta abrir `/panel`
- **THEN** a guarda de rotas devolve ao login antes de a tela ser renderizada

### Requirement: Aviso de que a liberação manual é exceção

A tela SHALL informar, antes do quadro da sala, que o próprio advogado realiza a liberação na máquina e
que o painel é o caminho de exceção. O aviso SHALL informar também que o acesso é restrito a advogados
inscritos regularmente na Seccional e que a cota de tempo é da sala e compartilhada por dia, não por
máquina.

#### Scenario: Aviso precede o quadro

- **WHEN** a tela é aberta em viewport de 640px ou mais
- **THEN** o aviso aparece acima do quadro da sala

#### Scenario: Aviso não empurra a sala para fora da dobra no celular

- **WHEN** a tela é aberta abaixo de 640px
- **THEN** o aviso não é exibido
- **AND** o quadro da sala continua sendo o primeiro bloco após o cabeçalho

### Requirement: Seleção entre as salas do escopo do funcionário

O quadro SHALL permitir escolher uma sala entre as devolvidas por `GET /rooms/get-all`. O painel MUST NOT
aplicar filtro por papel — o escopo já chega resolvido pela API. Salas inativas SHALL ser removidas da
lista, e não exibidas em estado desabilitado.

#### Scenario: Primeira sala ativa já vem selecionada

- **WHEN** a resposta da API chega com uma ou mais salas ativas
- **THEN** a primeira sala ativa aparece selecionada, sem exigir ação do funcionário

#### Scenario: Escolha do funcionário prevalece

- **WHEN** o funcionário escolhe uma sala diferente da primeira
- **THEN** o quadro passa a exibir a sala escolhida
- **AND** a escolha permanece enquanto a sala continuar na lista

#### Scenario: Sala escolhida deixa de existir na lista

- **WHEN** uma nova leitura da API não traz mais a sala escolhida, por ter sido inativada
- **THEN** o quadro volta a exibir a primeira sala ativa
- **AND** a tela não fica sem sala nem apresenta erro

#### Scenario: Sala inativa fora da escolha

- **WHEN** a resposta inclui salas com `inactive` verdadeiro
- **THEN** essas salas não aparecem na lista de seleção

#### Scenario: Cada sala se identifica na lista

- **WHEN** a lista de salas é aberta
- **THEN** cada item exibe o nome da sala
- **AND** exibe a descrição da sala quando ela existe

#### Scenario: Descrição longa não deforma a lista

- **WHEN** uma sala tem descrição mais longa que a largura da lista
- **THEN** a descrição quebra dentro da largura disponível e é limitada a duas linhas com reticências
- **AND** a lista não rola horizontalmente nem excede a largura do campo de seleção

### Requirement: Identificação dos colaboradores da sala

O quadro SHALL exibir os funcionários vinculados à sala selecionada como fileira de avatares, com o nome
disponível ao apontar. Como `employeesRooms` representa o vínculo e não o funcionário, o painel MUST
exibir cada funcionário uma única vez, ainda que existam vínculos repetidos.

#### Scenario: Funcionário com vínculo duplicado aparece uma vez

- **WHEN** a sala traz dois registros de vínculo para o mesmo funcionário
- **THEN** apenas um avatar desse funcionário é exibido

#### Scenario: Excedente vira contador

- **WHEN** a sala tem mais de quatro colaboradores
- **THEN** os quatro primeiros aparecem como avatares
- **AND** o restante aparece como contador, com os nomes disponíveis ao apontar

#### Scenario: Sala sem colaborador não exibe rótulo vazio

- **WHEN** a sala não tem nenhum funcionário vinculado
- **THEN** nem os avatares nem o rótulo "Colaboradores" são exibidos

#### Scenario: Funcionário sem foto

- **WHEN** o funcionário não tem imagem de perfil
- **THEN** o avatar exibe as iniciais do nome
- **AND** o nome completo continua acessível a leitor de tela

### Requirement: Cota e tamanho da sala visíveis antes de qualquer ação

O quadro SHALL exibir a cota diária da sala (`standardTime`) e a quantidade de computadores cadastrados
nela. O texto MUST deixar claro que a cota é da sala e vale por dia, e não um crédito por máquina.

#### Scenario: Cota apresentada como da sala e por dia

- **WHEN** uma sala está selecionada
- **THEN** a cota é apresentada em minutos, qualificada como diária e referente àquela sala

#### Scenario: Contagem de computadores com plural correto

- **WHEN** a sala tem exatamente um computador
- **THEN** o texto usa a forma singular
- **WHEN** a sala tem zero ou mais de um computador
- **THEN** o texto usa a forma plural

### Requirement: Estados de carregamento, erro e vazio distinguíveis

O quadro SHALL apresentar estado próprio para carregamento, falha de leitura e ausência de sala, sem
confundir os três. O estado de carregamento MUST reproduzir a estrutura do resultado, para que a faixa não
mude de altura quando os dados chegarem.

#### Scenario: Carregamento preserva a altura da faixa

- **WHEN** a requisição das salas ainda não respondeu
- **THEN** o quadro exibe marcadores de carregamento na mesma disposição do resultado final

#### Scenario: Falha na leitura convida a nova tentativa

- **WHEN** a requisição das salas falha
- **THEN** o quadro informa que não foi possível carregar as salas agora
- **AND** orienta a atualizar a página em instantes

#### Scenario: Nenhuma sala ativa

- **WHEN** a requisição responde sem nenhuma sala ativa para o funcionário
- **THEN** o quadro informa que não há sala ativa cadastrada para a Seccional
- **AND** não apresenta o campo de seleção vazio
