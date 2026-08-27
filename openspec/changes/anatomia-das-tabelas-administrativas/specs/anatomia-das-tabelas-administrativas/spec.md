## ADDED Requirements

### Requirement: Respiro uniforme nas tabelas do painel

As tabelas do painel SHALL usar o mesmo espaçamento interno, com calha suficiente para que o conteúdo de
colunas vizinhas não se toque e a primeira coluna não encoste na borda.

O esqueleto de carregamento MUST ocupar a mesma altura de linha do conteúdo definitivo. Esqueleto mais
baixo faz a tabela encolher no instante em que os dados chegam, e o salto se lê como defeito de
renderização.

**Motivação:** o espaçamento anterior deixava 16px entre colunas e 8px até a borda, e o esqueleto era 4px
mais baixo que a linha real — com dez linhas, 40px de salto ao carregar.

#### Scenario: Colunas vizinhas legíveis

- **WHEN** uma tabela do painel é apresentada
- **THEN** há calha suficiente entre colunas para distinguir onde termina uma e começa a outra
- **AND** a primeira coluna não encosta na borda do quadro

#### Scenario: Carregamento sem salto

- **WHEN** os dados chegam e substituem o esqueleto de carregamento
- **THEN** a altura das linhas permanece a mesma
- **AND** a tabela não encolhe nem cresce no instante da troca

### Requirement: Célula de identidade nas listagens administrativas

Cada listagem administrativa SHALL abrir a linha com uma célula de identidade composta por âncora visual,
identificador principal e informação secundária apagada logo abaixo.

Colaborador MUST usar avatar com foto ou iniciais; sala e estação MUST usar ladrilho com ícone. A âncora da
sala e da estação MUST ser neutra: o estado da máquina e a situação da sala têm coluna própria, e colorir a
âncora diria a mesma coisa duas vezes.

**Motivação:** ninguém procura a descrição de uma estação sem antes achar a estação. Separá-las em duas
colunas fazia o olho pular de uma ponta à outra da linha.

#### Scenario: Identidade do colaborador

- **WHEN** a listagem de colaboradores é apresentada
- **THEN** cada linha abre com o avatar, o nome e o e-mail logo abaixo

#### Scenario: Identidade da estação

- **WHEN** a listagem de computadores é apresentada
- **THEN** cada linha abre com o ladrilho, o rótulo da estação e a descrição logo abaixo

#### Scenario: Identidade da sala

- **WHEN** a listagem de salas é apresentada
- **THEN** cada linha abre com o ladrilho, o nome acompanhado da UF e a descrição logo abaixo
- **AND** a UF permanece junto ao nome, por ser esta a única tela onde o cadastro errado pode ser flagrado

### Requirement: Cor estável no avatar sem foto

O avatar sem foto SHALL receber uma cor derivada de identificador estável, de modo que a mesma pessoa
apareça sempre na mesma cor, inclusive entre telas diferentes.

A cor MUST NOT derivar do nome: corrigir um nome trocaria a cor da pessoa, e a cor existe para reencontrá-la
correndo o olho pela lista.

Repetição de cor entre pessoas diferentes é aceitável. A cor é pista, nunca identidade — quem identifica é o
nome escrito ao lado.

#### Scenario: Mesma pessoa, mesma cor entre telas

- **WHEN** um colaborador aparece na listagem de colaboradores e na equipe de uma sala
- **THEN** o avatar tem a mesma cor nos dois lugares

#### Scenario: Nome corrigido não troca a cor

- **WHEN** o nome de um colaborador é alterado
- **THEN** a cor do avatar permanece a mesma

### Requirement: Código MAC apresentado como chave de pareamento

O código MAC SHALL ser apresentado com destaque próprio, em fonte monoespaçada e em recipiente que o
distinga do texto corrido da linha.

O valor MUST ser exibido exatamente como está gravado, sem transformação de caixa ou de formato. A API o
guarda como texto opaco e o pareamento no servidor é byte a byte; mostrar algo diferente do gravado
enganaria justamente quem compara com a configuração da estação.

A fonte MUST ser monoespaçada, e não apenas de dígitos alinhados: o código contém letras, e só a
monoespaçada alinha a coluna inteira para conferência caractere a caractere.

A listagem MUST permitir buscar pelo código MAC, porque quem diagnostica uma estação muda chega com ele
copiado da configuração do Desktop.

#### Scenario: MAC legível para conferência

- **WHEN** a listagem de computadores é apresentada
- **THEN** os códigos MAC ficam alinhados em coluna, caractere a caractere
- **AND** cada um aparece exatamente como gravado

#### Scenario: Busca pelo MAC

- **WHEN** o administrador digita parte de um código MAC no campo de busca
- **THEN** a lista mostra a estação correspondente

### Requirement: Versão do Desktop ao lado do código MAC

A listagem de computadores SHALL apresentar a última versão do Desktop informada por cada estação, ao lado
do código MAC.

A ausência de versão MUST ser apresentada como ausência de informação, e não como erro: ou a estação não
conectou desde que a API passou a guardar o dado, ou o envio está desligado na configuração local dela.

A data associada MUST ser identificada como o momento em que a estação **informou** a versão, e não como
"vista por último": a versão só trafega na conexão, então uma máquina que não cai há semanas mantém carimbo
antigo estando no ar.

**Motivação:** o código MAC diz com qual máquina o Desktop deveria falar; a versão diz se ele chegou a
falar. Estação cadastrada e sem versão é o sintoma de instalação que nunca subiu.

#### Scenario: Estação que informou a versão

- **WHEN** uma estação já informou sua versão
- **THEN** a listagem apresenta a versão
- **AND** a data em que foi informada fica disponível na dica

#### Scenario: Estação que nunca informou

- **WHEN** uma estação nunca informou versão alguma
- **THEN** a listagem indica a ausência sem tratá-la como erro
- **AND** a dica explica os dois motivos possíveis

### Requirement: Equipe e parque de máquinas na listagem de salas

A listagem de salas SHALL apresentar, em cada linha, os colaboradores responsáveis pela sala e a quantidade
de estações cadastradas nela.

A equipe MUST usar os mesmos rostos e as mesmas cores da listagem de colaboradores, para que a cor ligue a
mesma pessoa entre as duas telas. Excedente ao limite exibido MUST virar contador, com os nomes disponíveis
na dica.

A quantidade de estações MUST sinalizar quantas estão em manutenção, quando houver. Ocupação de máquina
MUST NOT ser apresentada aqui: manutenção é condição de inventário, que é o assunto desta tela, enquanto
ocupação é estado do momento e pertence ao painel de operação.

Sala sem estação alguma MUST dizê-lo explicitamente. O painel de operação não desenha cartão para sala
vazia, e a ausência de cartão se lê como "está tudo certo aqui".

#### Scenario: Sala com equipe e estações

- **WHEN** a listagem de salas é apresentada
- **THEN** cada sala mostra os avatares de sua equipe e a quantidade de estações cadastradas

#### Scenario: Sala com estação em manutenção

- **WHEN** uma sala tem ao menos uma estação em manutenção
- **THEN** a listagem sinaliza quantas estão nessa condição, além da contagem total

#### Scenario: Sala sem estação alguma

- **WHEN** uma sala não tem estação cadastrada
- **THEN** a listagem diz isso explicitamente, em vez de deixar a célula vazia

#### Scenario: Colaborador desligado sai da equipe

- **WHEN** um colaborador vinculado à sala é desativado
- **THEN** ele deixa de aparecer na equipe da sala
- **AND** a coluna passa a refletir apenas a equipe em exercício
