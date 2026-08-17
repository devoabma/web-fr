## ADDED Requirements

### Requirement: Moldura única do painel autenticado

Toda tela do painel SHALL ser exibida dentro de uma moldura comum, composta por barra superior, navegação
lateral e área de conteúdo com rolagem própria. A barra superior SHALL atravessar toda a largura da tela,
com a navegação lateral começando abaixo dela — de modo que a identidade do produto e o bloco de usuário
ocupem uma faixa única, e não se dividam entre duas colunas. A moldura MUST ser definida uma única vez, no
layout do grupo de rotas privadas, e MUST NOT redeclarar o documento HTML, a fonte, a folha de estilos
global ou os provedores de cliente já declarados pelo layout raiz.

#### Scenario: Documento único

- **WHEN** qualquer rota do painel é renderizada
- **THEN** existe um único documento HTML na página
- **AND** existe um único container de notificações montado, de modo que cada notificação apareça uma vez

#### Scenario: Conteúdo rola sem levar a moldura junto

- **WHEN** o conteúdo de uma tela do painel excede a altura da viewport
- **THEN** apenas a área de conteúdo rola
- **AND** a navegação lateral e a barra superior permanecem visíveis

#### Scenario: Título da aba

- **WHEN** uma tela do painel é aberta
- **THEN** o título da aba combina o nome da área com o nome do produto, seguindo o template do layout raiz

#### Scenario: A marca não é o título da página

- **WHEN** uma tela do painel é renderizada
- **THEN** a marca do produto na barra superior não concorre com o cabeçalho principal da tela
- **AND** o cabeçalho de nível mais alto do documento pertence ao conteúdo da rota

### Requirement: Navegação entre as áreas do painel

A navegação lateral SHALL listar as áreas do painel agrupadas por natureza, separando a operação diária da
administração do inventário. Cada área MUST ser alcançável por link, preservando o comportamento nativo do
navegador. A área correspondente ao endereço atual MUST ser destacada visualmente e MUST ser identificada
como página atual para tecnologias assistivas.

#### Scenario: Área atual destacada

- **WHEN** o usuário está em uma área do painel
- **THEN** o item correspondente aparece destacado na navegação
- **AND** o item é anunciado como página atual

#### Scenario: Rota de detalhe dentro de uma área

- **WHEN** o usuário navega para um endereço descendente de uma área — o detalhe de um registro, por exemplo
- **THEN** o item da área continua destacado

#### Scenario: Abertura em nova aba

- **WHEN** o usuário aciona um item da navegação com o modificador de nova aba, ou copia seu endereço
- **THEN** o comportamento é o de um link comum do navegador

### Requirement: Recolhimento da navegação preservado entre sessões

A navegação lateral SHALL poder ser recolhida a uma faixa de ícones, e a escolha do usuário SHALL ser
preservada entre recargas e visitas seguintes. O estado inicial MUST ser resolvido no servidor, de modo que
a navegação seja pintada já na posição correta, sem saltar após a hidratação. Na ausência de escolha
registrada, a navegação MUST ser exibida expandida.

#### Scenario: Recolher e recarregar

- **WHEN** o usuário recolhe a navegação e recarrega a página
- **THEN** a navegação é exibida recolhida desde a primeira pintura, sem alternar de estado durante o
  carregamento

#### Scenario: Primeiro acesso

- **WHEN** um usuário sem escolha registrada abre o painel
- **THEN** a navegação é exibida expandida

#### Scenario: Rótulos no modo recolhido

- **WHEN** a navegação está recolhida à faixa de ícones
- **THEN** cada item revela seu rótulo ao receber o ponteiro ou o foco, sem espera perceptível — nesse modo
  o rótulo revelado é a única identificação do item
- **AND** o controle de recolher anuncia a ação que executa, e não o estado atual

### Requirement: Navegação adaptada a telas estreitas

Em viewports estreitas a navegação lateral SHALL ser apresentada como painel sobreposto, acionado sob
demanda, em vez de ocupar largura permanente. O modo de faixa de ícones MUST NOT ser aplicado nessas
viewports, onde o espaço horizontal não é o recurso escasso. Sempre que a navegação estiver oculta por
largura de tela, a barra superior MUST oferecer um controle visível para abri-la — uma navegação que só
responde a atalho de teclado é inalcançável no toque.

#### Scenario: Celular

- **WHEN** o painel é exibido em viewport menor que 768px
- **THEN** a navegação fica oculta até ser acionada
- **AND** ao ser acionada aparece sobreposta ao conteúdo, com os rótulos das áreas visíveis

#### Scenario: Gatilho de abertura no mobile

- **WHEN** o painel é exibido em viewport menor que 768px, com a navegação oculta
- **THEN** a barra superior exibe um controle de abertura da navegação, com rótulo acessível próprio
- **AND** o controle desaparece nas viewports em que a navegação já ocupa largura permanente

#### Scenario: Marca sempre visível

- **WHEN** o painel é exibido em qualquer largura de tela, inclusive com a navegação recolhida à faixa de
  ícones
- **THEN** a marca do produto permanece visível na barra superior, com o nome do produto legível
