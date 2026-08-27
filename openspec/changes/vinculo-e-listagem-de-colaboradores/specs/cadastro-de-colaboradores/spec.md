## MODIFIED Requirements

### Requirement: Papel e vínculo com salas no cadastro

O formulário de cadastro MUST NOT oferecer escolha de papel, e SHALL oferecer o vínculo com salas como
etapa opcional.

O papel continua fora porque `POST /employees/create-account` não aceita `role` no corpo: o banco aplica
`@default(MEMBER)` e não existe rota que promova alguém a administrador.

O vínculo com salas entra porque a `api-fr` passou a devolver `employeeId` no `201`, o que permite encadear
`POST /employees/link-with-rooms` logo após a criação, sem reconsultar a listagem para descobrir o
identificador. Antes disso a resposta era apenas `{ message }`, e vincular exigiria varrer a lista inteira
procurando pelo CPF recém-cadastrado.

A escolha de salas MUST ser opcional: nenhuma sala selecionada significa cadastrar sem vínculo, e nesse
caso a segunda requisição MUST NOT ser disparada. O vínculo é conveniência do cadastro, não requisito dele.

Apenas salas **ativas** MUST ser oferecidas, porque `link-with-rooms` recusa com `400` o vínculo com sala
inativa.

#### Scenario: Cadastro sem vínculo

- **WHEN** o administrador conclui o cadastro sem escolher sala alguma
- **THEN** o colaborador é criado
- **AND** nenhuma requisição de vínculo é enviada

#### Scenario: Cadastro com vínculo

- **WHEN** o administrador escolhe uma ou mais salas e conclui o cadastro
- **THEN** o colaborador é criado
- **AND** o `employeeId` devolvido pela criação é usado para vincular as salas escolhidas na sequência

#### Scenario: Vínculo falha depois da criação

- **WHEN** a criação conclui e o vínculo falha
- **THEN** o erro do vínculo é comunicado sem sugerir que o cadastro não aconteceu
- **AND** o colaborador permanece criado, podendo ser vinculado depois pela listagem

#### Scenario: Papel do colaborador criado

- **WHEN** um colaborador é criado pelo formulário
- **THEN** ele nasce com papel de membro
- **AND** o formulário não apresenta escolha de papel
