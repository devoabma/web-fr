## MODIFIED Requirements

### Requirement: Busca e navegação por páginas

A listagem SHALL permitir buscar salas pelo nome **ou pela descrição** e navegar o resultado por páginas,
com escolha da quantidade de linhas por página.

A sigla do estado MUST NOT ser critério de busca. Com duas letras ela casa com boa parte da tabela — "MA"
encontra "SALA DE REUNIÃO" —, de modo que digitar o estado esconde o resultado procurado em vez de
estreitá-lo.

A contagem apresentada MUST se referir ao resultado inteiro da busca, e não à página exibida. Alterada a
busca, a navegação MUST voltar à primeira página — permanecer numa página que deixou de existir
apresentaria um resultado vazio para uma busca que tem resultados.

**Motivação:** `GET /rooms/get-all` devolve tudo de uma vez, sem paginação nem filtro. A separação entre o
que se procura e o que cabe na tela precisa acontecer aqui. A descrição entrou na busca porque é o outro
campo que a célula da sala apresenta; o estado saiu porque alargava o resultado em vez de recortá-lo.

#### Scenario: Busca por nome

- **WHEN** o administrador digita parte do nome de uma sala
- **THEN** a lista passa a apresentar apenas as salas cujo nome contém o trecho digitado
- **AND** a navegação volta à primeira página

#### Scenario: Busca por descrição

- **WHEN** o administrador digita parte da descrição de uma sala
- **THEN** a lista passa a apresentar as salas cuja descrição contém o trecho digitado

#### Scenario: Estado fora da busca

- **WHEN** o administrador digita a sigla de um estado
- **THEN** apenas as salas cujo nome ou descrição contêm aquele trecho são apresentadas
- **AND** as demais salas daquele estado não entram no resultado por causa da sigla

#### Scenario: Contagem do resultado

- **WHEN** o resultado da busca ocupa mais de uma página
- **THEN** a tela informa o total de registros do resultado e o intervalo exibido na página atual
