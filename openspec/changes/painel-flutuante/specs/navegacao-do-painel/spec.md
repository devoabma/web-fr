## MODIFIED Requirements

### Requirement: Navegação adaptada a telas estreitas

Em viewports estreitas a navegação lateral SHALL ser apresentada como painel sobreposto, acionado sob
demanda, em vez de ocupar largura permanente. O modo de faixa de ícones MUST NOT ser aplicado nessas
viewports, onde o espaço horizontal não é o recurso escasso. Sempre que a navegação estiver oculta por
largura de tela, a barra superior MUST oferecer um controle visível para abri-la — uma navegação que só
responde a atalho de teclado é inalcançável no toque.

O painel sobreposto SHALL se apresentar com o mesmo vocabulário dos painéis de formulário do produto:
flutuando com respiro em relação às bordas da tela, com cantos arredondados, e podendo ser fechado por
arrasto na direção em que ele encosta. Um menu que se comporta diferente de tudo o que o painel abre pede
que o usuário aprenda duas gramáticas para a mesma coisa.

Escolhida uma área, a navegação sobreposta MUST se fechar. Ela cobre o conteúdo: manter-se aberta deixaria a
página escolhida atrás do próprio menu, e o toque pareceria não ter funcionado. Onde a navegação ocupa
largura permanente, ela MUST permanecer aberta após a escolha.

#### Scenario: Celular

- **WHEN** o painel é exibido em viewport menor que 768px
- **THEN** a navegação fica oculta até ser acionada
- **AND** ao ser acionada aparece sobreposta ao conteúdo, com os rótulos das áreas visíveis
- **AND** o painel flutua com respiro em relação às bordas da tela

#### Scenario: Gatilho de abertura no mobile

- **WHEN** o painel é exibido em viewport menor que 768px, com a navegação oculta
- **THEN** a barra superior exibe um controle de abertura da navegação, com rótulo acessível próprio
- **AND** o controle desaparece nas viewports em que a navegação já ocupa largura permanente

#### Scenario: Área escolhida no mobile

- **WHEN** o usuário escolhe uma área com a navegação sobreposta aberta
- **THEN** a navegação se fecha
- **AND** a tela da área escolhida fica visível

#### Scenario: Área escolhida no desktop

- **WHEN** o usuário escolhe uma área com a navegação ocupando largura permanente
- **THEN** a navegação permanece aberta

#### Scenario: Fechamento por arrasto

- **WHEN** o usuário arrasta a navegação sobreposta na direção da borda em que ela encosta
- **THEN** a navegação se fecha acompanhando o gesto

#### Scenario: Marca sempre visível

- **WHEN** o painel é exibido em qualquer largura de tela, inclusive com a navegação recolhida à faixa de
  ícones
- **THEN** a marca do produto permanece visível na barra superior, com o nome do produto legível

## ADDED Requirements

### Requirement: Conteúdo apresentado como ilha

A área de conteúdo do painel SHALL ser apresentada destacada do fundo, com cantos arredondados e respiro em
relação às bordas da tela e à navegação. O fundo do painel MUST assumir o tom da navegação, para que o
destaque exista.

A barra superior MUST NOT ser separada do conteúdo por borda: com o fundo do painel na mesma cor dela, a
linha se lê como um risco atravessando a tela. A separação MUST ser feita pelo respiro.

O contêiner da ilha MUST recortar o que transborda, ou o conteúdo em rolagem passa por cima do canto
arredondado.

**Motivação:** os formulários da área administrativa passaram a abrir como painéis flutuantes, e a moldura
seguia com bordas coladas. A ilha alinha a moldura ao vocabulário que o resto do produto adotou.

#### Scenario: Conteúdo destacado do fundo

- **WHEN** qualquer tela do painel é apresentada
- **THEN** a área de conteúdo aparece com cantos arredondados e respiro em relação às bordas
- **AND** o fundo em volta tem o tom da navegação

#### Scenario: Rolagem respeita o recorte

- **WHEN** o conteúdo de uma tela excede a altura disponível e é rolado
- **THEN** ele permanece recortado pelos cantos arredondados da ilha

#### Scenario: Barra superior sem borda

- **WHEN** qualquer tela do painel é apresentada
- **THEN** não há linha divisória entre a barra superior e o conteúdo

### Requirement: Marca ancorada à coluna de navegação

Nas viewports em que a navegação ocupa largura permanente, a marca do produto SHALL ocupar exatamente a
largura da coluna de navegação, com o símbolo alinhado à mesma vertical dos ícones das áreas.

Recolhida a navegação à faixa de ícones, a marca MUST acompanhar a nova largura e MUST manter o símbolo na
mesma posição horizontal, apresentando apenas ele. Nas viewports estreitas, onde a navegação é sobreposta,
a marca MUST seguir apresentada junto ao controle de abertura, sem largura reservada.

**Motivação:** a marca ficava recuada 8px da borda enquanto os ícones do menu começavam a 16px, logo abaixo.
A diferença fazia a barra superior e a navegação lerem como duas peças desalinhadas em vez de uma moldura só.

#### Scenario: Navegação expandida

- **WHEN** o painel é exibido com a navegação em largura permanente e expandida
- **THEN** a marca ocupa a largura da coluna de navegação
- **AND** o símbolo dela fica na mesma vertical dos ícones das áreas

#### Scenario: Navegação recolhida

- **WHEN** a navegação é recolhida à faixa de ícones
- **THEN** a marca encolhe para a largura da faixa
- **AND** o símbolo permanece na mesma posição horizontal
- **AND** o nome do produto deixa de ser apresentado

#### Scenario: Telas estreitas

- **WHEN** o painel é exibido em viewport menor que 768px
- **THEN** a marca é apresentada ao lado do controle de abertura da navegação, com o nome do produto legível
