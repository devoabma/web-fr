## ADDED Requirements

### Requirement: Espaço de marca da instituição

O produto SHALL reservar um espaço de marca para a instituição que o utiliza, apresentado no cabeçalho
público e no painel da tela de login.

Esse espaço MUST ser preenchido por um único arquivo, identificado pelo papel que cumpre no produto e
não pela instituição atual. Trocar a instituição MUST ser substituir esse arquivo, sem alteração de
código.

A marca do próprio produto MUST permanecer distinta da marca da instituição: são coisas diferentes e
não mudam juntas.

**Motivação:** a logo estava codificada no produto — nome de arquivo, texto alternativo e largura
presumiam uma instituição específica. Uma seccional nova exigiria três edições em dois arquivos.

#### Scenario: Troca de instituição

- **WHEN** o arquivo de marca da instituição é substituído por outro
- **THEN** o cabeçalho público e a tela de login passam a apresentar a nova marca
- **AND** nenhuma alteração de código é necessária

#### Scenario: Marca do produto preservada

- **WHEN** a marca da instituição é trocada
- **THEN** a identidade do produto permanece inalterada

### Requirement: Texto alternativo independente da instituição

O texto alternativo da marca da instituição SHALL descrever o papel da imagem, e MUST NOT nomear uma
instituição específica.

**Motivação:** um texto alternativo que nomeia a instituição envelhece em silêncio na troca — quem usa
leitor de tela ouviria o nome errado, e nada na tela apresentaria a divergência.

#### Scenario: Leitura por leitor de tela após a troca

- **WHEN** a marca da instituição é trocada
- **THEN** o texto alternativo continua descrevendo corretamente a imagem

### Requirement: Dimensionamento por altura

A marca da instituição SHALL ser dimensionada pela altura, com a largura decorrendo da proporção da
imagem.

Uma imagem de proporção diferente da anterior MUST NOT alterar a altura do cabeçalho nem do painel de
login.

O cabeçalho público MUST preservar a legibilidade da marca do produto quando a marca da instituição for
larga: o texto do produto MUST poder encolher e ser truncado, e nenhuma das duas imagens MUST ser
comprimida.

#### Scenario: Logo de proporção diferente

- **WHEN** a marca da instituição é substituída por uma imagem de proporção diferente
- **THEN** a altura do cabeçalho permanece a mesma
- **AND** a imagem não é distorcida

#### Scenario: Espaço reduzido

- **WHEN** o cabeçalho é apresentado em largura reduzida
- **THEN** o subtítulo do produto é truncado
- **AND** as duas marcas permanecem em suas proporções originais
