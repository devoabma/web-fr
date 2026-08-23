## ADDED Requirements

### Requirement: Listagem das salas cadastradas

A área administrativa de salas SHALL apresentar as salas cadastradas, com nome, tempo padrão, descrição,
situação e data de criação. A lista MUST refletir o cadastro recém-concluído sem exigir recarga da página, e
MUST incluir as salas inativas, marcadas como tal.

O tempo padrão MUST ser apresentado com o valor gravado e a leitura em horas, porque é o valor em minutos
que a API guarda e é a leitura em horas que o administrador confere.

**Motivação:** enquanto a tela só cadastrava, quem criava uma sala não tinha como conferir o resultado — a
única defesa contra o cadastro repetido era a recusa da API.

#### Scenario: Salas apresentadas

- **WHEN** um administrador abre a área de salas
- **THEN** as salas cadastradas são apresentadas com nome, tempo padrão, descrição, situação e data de
  criação
- **AND** as salas inativas constam da lista, identificadas como inativas

#### Scenario: Sala recém-cadastrada aparece na lista

- **WHEN** um cadastro é concluído com sucesso
- **THEN** a sala nova passa a constar da lista
- **AND** isso acontece sem recarga da página

#### Scenario: Carregamento em andamento

- **WHEN** a consulta das salas ainda está em andamento
- **THEN** a tela apresenta um placeholder no formato da própria lista
- **AND** MUST NOT anunciar um total de registros antes de conhecê-lo

#### Scenario: Falha ao carregar

- **WHEN** a consulta das salas falha
- **THEN** a tela apresenta um aviso de falha no lugar da lista, anunciado como alerta
- **AND** MUST NOT apresentar uma lista vazia como se não houvesse salas cadastradas

#### Scenario: Nenhuma sala corresponde

- **WHEN** não há sala a apresentar
- **THEN** a tela informa que nenhuma sala foi encontrada

### Requirement: Busca e navegação por páginas

A listagem SHALL permitir buscar salas pelo nome e navegar o resultado por páginas, com escolha da
quantidade de linhas por página.

A contagem apresentada MUST se referir ao resultado inteiro da busca, e não à página exibida. Alterada a
busca, a navegação MUST voltar à primeira página — permanecer numa página que deixou de existir
apresentaria um resultado vazio para uma busca que tem resultados.

**Motivação:** `GET /rooms/get-all` devolve tudo de uma vez, sem paginação nem filtro. A separação entre o
que se procura e o que cabe na tela precisa acontecer aqui.

#### Scenario: Busca por nome

- **WHEN** o administrador digita parte do nome de uma sala
- **THEN** a lista passa a apresentar apenas as salas cujo nome contém o trecho digitado
- **AND** a navegação volta à primeira página

#### Scenario: Contagem do resultado

- **WHEN** o resultado da busca ocupa mais de uma página
- **THEN** a tela informa o total de registros do resultado e o intervalo exibido na página atual

### Requirement: Alternância entre sala ativa e inativa

A listagem SHALL permitir inativar uma sala ativa e reativar uma sala inativa, usando
`PATCH /rooms/deactivate/:id` e `PATCH /rooms/activate/:id`. Concluída a alternância, a situação apresentada
MUST acompanhar a mudança sem recarga da página.

Inativar MUST exigir confirmação e a confirmação MUST informar o efeito sobre os computadores da sala e que
nada é apagado. Reativar MUST NOT exigir confirmação — é construtivo e desfeito pela ação vizinha.

Durante a chamada, a ação MUST ficar indisponível para novo acionamento, e a confirmação MUST NOT poder ser
fechada. Um segundo acionamento traria de volta a recusa da API para uma sala que acabou de mudar de
situação, e o aviso de erro chegaria a uma tela que já não mostra o que se tentava fazer.

**Motivação:** a `api-fr` não exclui sala; inativar é o mais próximo disso, e sem a listagem uma sala
inativa não tinha lugar onde pudesse voltar.

#### Scenario: Sala inativada

- **WHEN** o administrador confirma a inativação de uma sala
- **THEN** a sala passa a constar como inativa
- **AND** o sistema informa que ela sai do quadro de liberação e pode ser reativada

#### Scenario: Confirmação informa o alcance

- **WHEN** a confirmação de inativação é apresentada para uma sala com computadores
- **THEN** ela informa quantos computadores deixam de aparecer para os funcionários
- **AND** informa que nada é apagado

#### Scenario: Sala reativada

- **WHEN** o administrador aciona a reativação de uma sala inativa
- **THEN** a sala volta a constar como ativa, sem etapa de confirmação
- **AND** o sistema informa que ela volta ao quadro de liberação dos funcionários

#### Scenario: Acionamento repetido durante a chamada

- **WHEN** o administrador aciona a alternância e torna a acionar antes da resposta
- **THEN** apenas uma alternância é enviada

#### Scenario: Recusa da API

- **WHEN** a alternância é recusada pela API
- **THEN** a mensagem da API é apresentada ao administrador
- **AND** quando a recusa for por excesso de tentativas, o tempo de espera é informado
