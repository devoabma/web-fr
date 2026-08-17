## ADDED Requirements

### Requirement: Identificação do funcionário autenticado na barra superior

A barra superior SHALL identificar o funcionário da sessão corrente por nome e imagem, obtidos da API. O
sistema MUST NOT exibir identificação fixa no código. Quando o funcionário não tiver imagem cadastrada, a
barra MUST apresentar as iniciais do nome no lugar da foto, ocupando o mesmo espaço.

**Motivação:** o contrato da API declara a imagem como anulável; entregá-la diretamente ao componente de
imagem quando ausente interrompe a renderização da barra.

#### Scenario: Funcionário com foto

- **WHEN** o painel é aberto por um funcionário que tem imagem cadastrada
- **THEN** a barra superior exibe o nome e a foto desse funcionário

#### Scenario: Funcionário sem foto

- **WHEN** o painel é aberto por um funcionário sem imagem cadastrada
- **THEN** a barra superior exibe as iniciais do nome no lugar da foto
- **AND** a barra é renderizada sem erro

### Requirement: A barra superior permanece utilizável durante o carregamento do perfil

Enquanto os dados do funcionário não chegarem, a barra superior SHALL permanecer montada e MUST manter
disponíveis a marca do produto e o gatilho de navegação. O espaço do bloco de usuário MUST ser reservado
com indicador de carregamento do mesmo tamanho do conteúdo final.

**Motivação:** abaixo de 768px o gatilho da barra é o único caminho para abrir a navegação. Ocultar a barra
inteira até o perfil chegar deixa o usuário sem menu e faz o conteúdo saltar quando ela reaparece.

#### Scenario: Perfil ainda carregando

- **WHEN** o painel é aberto e o perfil do funcionário ainda não chegou
- **THEN** a marca do produto e o gatilho de navegação já estão disponíveis
- **AND** o bloco de usuário exibe indicador de carregamento no lugar do nome e da imagem

#### Scenario: Chegada do perfil não desloca o layout

- **WHEN** os dados do funcionário chegam
- **THEN** o nome e a imagem ocupam o espaço já reservado, sem deslocar os demais elementos da barra

#### Scenario: Falha ao obter o perfil

- **WHEN** a consulta ao perfil falha
- **THEN** a barra superior continua montada com a marca e o gatilho de navegação
- **AND** nenhuma identificação provisória ou fictícia é apresentada
