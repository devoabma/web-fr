## MODIFIED Requirements

### Requirement: Cadastro de sala de liberação

A área administrativa de salas SHALL oferecer o cadastro de uma sala, informando nome, **estado**, tempo
padrão e descrição. O envio MUST usar `POST /rooms/create` e MUST NOT enviar o identificador da sala — quem o
deriva do nome é a API. O acesso à área continua sendo decidido pela guarda de navegação e pela API; a tela
MUST NOT tratar a própria presença como autorização.

O estado MUST ser enviado sempre, mesmo quando for o presumido pela API, para que a sala não herde um estado
em silêncio.

Concluído o cadastro, o sistema MUST informar o sucesso nomeando a sala criada, o estado e o tempo padrão
adotado, e MUST descartar o formulário para que o próximo cadastro comece limpo.

A sala recém-criada MUST passar a estar disponível nas demais telas que listam salas, sem exigir recarga da
página.

**Motivação:** sem sala cadastrada não há computador, vínculo de funcionário nem liberação. Enquanto o
cadastro não existisse na interface, todo ambiente novo começava por uma escrita direta no banco. O estado
entrou no cadastro porque é ele que o programa da máquina recebe ao se registrar e que decide de qual
publicação de versão aquela estação participa.

#### Scenario: Sala cadastrada

- **WHEN** um administrador informa nome, estado, tempo padrão e descrição válidos e confirma
- **THEN** a sala é criada
- **AND** o sistema informa o sucesso nomeando a sala, o estado e o tempo padrão adotado
- **AND** o formulário é descartado

#### Scenario: Estado não alterado pelo administrador

- **WHEN** o administrador cadastra a sala sem mexer no estado apresentado
- **THEN** o estado apresentado é enviado explicitamente à API
- **AND** a sala MUST NOT depender de um padrão presumido pelo servidor

#### Scenario: Sala nova disponível nas outras telas

- **WHEN** uma sala acaba de ser cadastrada
- **THEN** ela passa a constar entre as salas oferecidas ao operador do painel
- **AND** isso acontece sem recarga da página

#### Scenario: Descrição não informada

- **WHEN** o administrador deixa a descrição em branco
- **THEN** a sala é criada sem descrição
- **AND** não é gravado um texto vazio no lugar da ausência

## ADDED Requirements

### Requirement: Estado da sala escolhido de lista fechada

O estado da sala SHALL ser escolhido de uma lista fechada com as 27 unidades federativas do Brasil. O sistema
MUST NOT oferecer campo de texto livre para a sigla, e MUST NOT permitir o envio sem estado escolhido.

Cada opção MUST apresentar a sigla e o nome do estado por extenso. O formulário de cadastro MUST abrir com um
estado já selecionado, para que o campo não seja um obstáculo no caso comum.

O sistema MUST explicar, junto do campo, que o estado define de onde as estações daquela sala recebem as
atualizações do programa da máquina.

**Motivação:** antes desta capacidade a sigla era digitada à mão no instalador do programa da máquina. O erro
de digitação é mudo — não recusa nada e não avisa nada; a estação apenas deixa de casar com a publicação de
versão dirigida ao estado dela, e ninguém percebe até uma sala inteira estar parada numa versão antiga.
Escolha em lista fechada elimina a classe de erro que sobra depois da validação do servidor.

#### Scenario: Escolha entre as unidades federativas

- **WHEN** o administrador abre o campo de estado
- **THEN** as 27 unidades federativas são oferecidas
- **AND** cada uma é apresentada com a sigla e o nome por extenso

#### Scenario: Sigla não é digitada

- **WHEN** o administrador preenche o cadastro de sala
- **THEN** não existe campo em que a sigla do estado possa ser digitada livremente

#### Scenario: Estado inicial no cadastro

- **WHEN** o administrador abre o cadastro de sala
- **THEN** o campo de estado já vem com um estado selecionado

#### Scenario: Efeito do estado explicado no formulário

- **WHEN** o campo de estado é apresentado
- **THEN** o sistema explica que ele define de onde as estações da sala recebem as atualizações
