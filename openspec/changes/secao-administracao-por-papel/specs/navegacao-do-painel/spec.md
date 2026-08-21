## MODIFIED Requirements

### Requirement: Navegação entre as áreas do painel

A navegação lateral SHALL listar as áreas do painel agrupadas por natureza, separando a operação diária da
administração do inventário. Cada área MUST ser alcançável por link, preservando o comportamento nativo do
navegador. A área correspondente ao endereço atual MUST ser destacada visualmente e MUST ser identificada
como página atual para tecnologias assistivas.

A navegação SHALL apresentar apenas os grupos alcançáveis pelo papel da sessão corrente. Um grupo restrito
MUST ser omitido por completo — rótulo do grupo inclusive — e MUST NOT ser apresentado como item
desabilitado, porque item desabilitado ainda anuncia a existência de uma área que aquele papel nunca vai
alcançar.

O papel SHALL ser resolvido no servidor, a partir da sessão, de modo que o primeiro HTML já saia com a
navegação correta e nenhum grupo restrito apareça e depois desapareça. Não havendo sessão legível, o
sistema MUST assumir o papel de menor privilégio.

Esta omissão é de apresentação e MUST NOT ser tratada como autorização: o alcance real das rotas restritas
continua sendo decidido pela guarda de navegação e, definitivamente, pela API.

**Motivação:** oferecer no menu o que o usuário não pode fazer ensina que o menu não é confiável. O corte
de acesso a `/admin/*` já existia na guarda de rotas; faltava o corte de visibilidade.

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

#### Scenario: Funcionário sem direito ao inventário

- **WHEN** o painel é aberto por um funcionário de papel `MEMBER`
- **THEN** o grupo de administração não é apresentado na navegação
- **AND** o rótulo do grupo também não é apresentado
- **AND** nenhum item aparece desabilitado no lugar dele

#### Scenario: Funcionário com direito ao inventário

- **WHEN** o painel é aberto por um funcionário de papel `ADMIN`
- **THEN** o grupo de administração é apresentado com todas as suas áreas

#### Scenario: Grupo restrito não pisca na tela

- **WHEN** o painel é aberto por um funcionário de papel `MEMBER`
- **THEN** o grupo de administração está ausente desde a primeira pintura
- **AND** não aparece em momento algum do carregamento

#### Scenario: Sessão ilegível

- **WHEN** o painel é renderizado sem sessão utilizável — cookie ausente, malformado ou vencido
- **THEN** a navegação é montada com o papel de menor privilégio
- **AND** o grupo de administração não é apresentado

#### Scenario: Esconder não é autorizar

- **WHEN** um funcionário de papel `MEMBER` digita diretamente um endereço do grupo restrito
- **THEN** a guarda de navegação o impede de alcançar a área
- **AND** a ausência do grupo na navegação não é o que o impediu

### Requirement: Moldura única do painel autenticado

Toda tela do painel SHALL ser exibida dentro de uma moldura comum, composta por barra superior, navegação
lateral e área de conteúdo com rolagem própria. A barra superior SHALL atravessar toda a largura da tela,
com a navegação lateral começando abaixo dela — de modo que a identidade do produto e o bloco de usuário
ocupem uma faixa única, e não se dividam entre duas colunas. A moldura MUST ser definida uma única vez, no
layout do grupo de rotas privadas, e MUST NOT redeclarar o documento HTML, a fonte, a folha de estilos
global ou os provedores de cliente já declarados pelo layout raiz.

A moldura MUST NOT declarar título de aba em nome das rotas que abriga. O nome da área SHALL ser declarado
pela própria rota, sob o template do layout raiz — assim uma rota nova do painel não herda o título de
outra.

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

#### Scenario: Cada rota nomeia a própria aba

- **WHEN** duas telas diferentes do painel são abertas
- **THEN** cada uma apresenta o próprio nome no título da aba
- **AND** nenhuma delas depende de sobrescrever um título declarado pela moldura

#### Scenario: A marca não é o título da página

- **WHEN** uma tela do painel é renderizada
- **THEN** a marca do produto na barra superior não concorre com o cabeçalho principal da tela
- **AND** o cabeçalho de nível mais alto do documento pertence ao conteúdo da rota
