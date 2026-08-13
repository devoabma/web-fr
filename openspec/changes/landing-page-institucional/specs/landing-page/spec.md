## ADDED Requirements

### Requirement: Página institucional pública

O sistema SHALL servir, na rota raiz `/`, uma página institucional pública que apresenta o Sala Livre e conduz o funcionário ao painel administrativo. A página MUST ser composta por cinco seções, nesta ordem: cabeçalho, hero, prévia do painel, diferenciais e rodapé. A página MUST ser renderizada como Server Component, sem exigir JavaScript de cliente para exibir seu conteúdo.

#### Scenario: Visitante acessa a raiz

- **WHEN** um visitante não autenticado acessa `/`
- **THEN** a página é entregue como conteúdo estático pré-renderizado
- **AND** as cinco seções são exibidas na ordem definida

#### Scenario: Chamada para o painel

- **WHEN** o visitante aciona a chamada principal do hero
- **THEN** ele é levado para a rota do painel administrativo por meio de navegação de link, preservando o comportamento nativo do navegador (abrir em nova aba, copiar endereço)

### Requirement: Identidade visual da OAB Maranhão

O cabeçalho SHALL exibir a marca do produto — símbolo, nome "Sala Livre" e o descritor "Gestão de Salas" — à esquerda, e a logo da OAB Maranhão à direita. A logo da OAB MUST ocupar a posição que o design de origem reservava a um botão de acesso.

#### Scenario: Cabeçalho em desktop

- **WHEN** a página é exibida em viewport de 1024px ou mais
- **THEN** a marca do produto aparece à esquerda e a logo da OAB à direita, em linha

#### Scenario: Cabeçalho em telas estreitas

- **WHEN** a página é exibida em viewport estreita
- **THEN** ambas as marcas permanecem visíveis e legíveis, com dimensões reduzidas, sem quebrar o layout nem provocar rolagem horizontal

### Requirement: Prévia do painel com os três estados do computador

A seção de prévia SHALL representar o painel administrativo exibindo computadores em três estados mutuamente exclusivos: **disponível**, **em uso** e **manutenção**. Cada estado MUST ter tratamento visual próprio — cor de fundo, borda, indicador e rótulo. Os totais por estado e a contagem de computadores exibidos no cabeçalho da sala MUST ser derivados da fonte de dados da seção, nunca escritos como literais.

#### Scenario: Estados representados

- **WHEN** a prévia do painel é exibida
- **THEN** cada computador aparece com o tratamento visual correspondente ao seu estado
- **AND** os três estados possuem indicadores visualmente distintos entre si

#### Scenario: Contadores coerentes com os dados

- **WHEN** a lista de computadores da prévia é alterada
- **THEN** os totais por estado e a contagem total acompanham a alteração automaticamente, sem edição manual

### Requirement: Layout responsivo mobile-first

Todas as seções SHALL ser legíveis e funcionais de 320px de largura até desktop. Nenhuma seção MUST provocar rolagem horizontal do documento. As grades MUST reduzir o número de colunas conforme a largura diminui, e a barra lateral da prévia do painel MUST permanecer acessível em telas estreitas por meio de rolagem horizontal contida na própria faixa.

#### Scenario: Grade de computadores em telas estreitas

- **WHEN** a viewport é menor que 640px
- **THEN** a grade de computadores é exibida em duas colunas
- **AND** aumenta para três e depois quatro colunas conforme a largura cresce

#### Scenario: Barra lateral em telas estreitas

- **WHEN** a viewport é menor que 768px
- **THEN** a barra lateral da prévia é posicionada acima da área principal
- **AND** a lista de salas rola horizontalmente dentro da própria faixa, sem deslocar o restante da página

#### Scenario: Ausência de rolagem horizontal

- **WHEN** a página é exibida em qualquer largura a partir de 320px
- **THEN** o documento não apresenta rolagem horizontal

### Requirement: Sistema de design compartilhado

O projeto SHALL definir um sistema de design reutilizável pelas telas seguintes. As cores MUST ser declaradas como tokens de tema em `oklch`, com variantes clara e escura, e os componentes MUST referenciar os tokens em vez de valores literais de cor. As primitivas de interface MUST vir de uma camada compartilhada, separada dos componentes de seção.

#### Scenario: Troca de cor da marca

- **WHEN** o valor do token de cor primária é alterado na folha de estilos do tema
- **THEN** todas as seções que usam a cor primária refletem a mudança, sem edição individual de componentes

#### Scenario: Separação entre primitivas e seções

- **WHEN** um componente de seção precisa de um botão ou etiqueta
- **THEN** ele consome a primitiva compartilhada da camada de interface, em vez de recriar o elemento
