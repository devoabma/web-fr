## ADDED Requirements

### Requirement: Listagem dos colaboradores cadastrados

A área administrativa de colaboradores SHALL apresentar os colaboradores cadastrados, com nome, e-mail,
CPF, papel, situação e data de criação. A lista MUST refletir o cadastro recém-concluído sem exigir recarga
da página, e MUST incluir os colaboradores inativos, marcados como tais.

O CPF MUST ser apresentado pontuado. A `api-fr` guarda e devolve apenas os 11 dígitos; a pontuação é
acrescentada na exibição, para que o administrador confira o número como o lê em qualquer documento.

**Motivação:** enquanto a tela só cadastrava, quem criava um colaborador não tinha como conferir o
resultado nem saber quem já existia — a única defesa contra o cadastro repetido era a recusa da API por CPF
ou e-mail duplicado.

#### Scenario: Colaboradores apresentados

- **WHEN** um administrador abre `/admin/employees`
- **THEN** a lista mostra cada colaborador com nome, e-mail, CPF pontuado, papel, situação e data de criação
- **AND** os inativos aparecem marcados, sem serem omitidos

#### Scenario: Cadastro recém-concluído aparece na lista

- **WHEN** o cadastro de um colaborador conclui com sucesso
- **THEN** a lista passa a exibi-lo sem que a página precise ser recarregada

#### Scenario: Falha ao carregar a listagem

- **WHEN** a requisição da listagem falha
- **THEN** a tela mostra um aviso explicando que não foi possível carregar e orientando a recarregar
- **AND** nenhuma tabela vazia é apresentada como se não houvesse colaboradores

### Requirement: Busca por nome ou CPF na listagem

A listagem SHALL oferecer busca por nome **ou** CPF, aplicada no cliente sobre a lista já carregada.

A busca por CPF MUST desconsiderar a pontuação digitada. O usuário copia o número como o vê na tela, isto é,
pontuado, enquanto o dado guardado tem apenas dígitos — comparar os dois em bruto nunca encontraria
ninguém.

**Motivação:** `GET /employees/get-all` não pagina e não aceita filtro algum, então filtrar no cliente é
uma requisição só, sem ida ao servidor a cada tecla.

#### Scenario: Busca por nome

- **WHEN** o administrador digita parte de um nome
- **THEN** a lista mostra apenas os colaboradores cujo nome contém o texto, sem diferenciar maiúsculas

#### Scenario: Busca por CPF pontuado

- **WHEN** o administrador digita `123.456` no campo de busca
- **THEN** a lista encontra o colaborador cujo CPF guardado começa por `123456`
- **AND** o resultado é o mesmo que digitar `123456`

#### Scenario: Busca sem resultado

- **WHEN** nenhum colaborador atende ao texto buscado
- **THEN** a tabela apresenta a mensagem de lista vazia própria da tela

### Requirement: Ações da listagem desenhadas antes dos diálogos

A coluna de ações SHALL apresentar os gatilhos de atualizar e de gerenciar salas, e nesta etapa eles MUST
estar inertes, sinalizados como indisponíveis e explicados por dica ao passar o cursor.

Os gatilhos MUST usar `aria-disabled`, e não `disabled`: elemento desabilitado não dispara os eventos de
cursor, e é justamente a dica que explica por que a ação ainda não responde.

**Motivação:** fechar a anatomia da linha antes dos diálogos evita que a coluna mude de largura e de ordem
quando eles chegarem.

#### Scenario: Gatilho inerte com explicação

- **WHEN** o administrador passa o cursor sobre um dos gatilhos de ação
- **THEN** aparece a dica nomeando a ação e indicando que ainda não está disponível
- **AND** o clique não dispara efeito algum
