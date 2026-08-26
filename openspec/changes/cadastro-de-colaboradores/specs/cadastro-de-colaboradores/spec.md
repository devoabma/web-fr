## ADDED Requirements

### Requirement: Cadastro de colaborador pela área administrativa

A área administrativa SHALL permitir cadastrar um colaborador informando nome, CPF, e-mail e uma senha
inicial. O envio MUST usar `POST /employees/create-account`.

Concluído o cadastro, o sistema MUST informar o sucesso nomeando a pessoa e o endereço de e-mail para onde
os dados de acesso foram enviados, e MUST encerrar o formulário deixando-o limpo para o próximo cadastro.

**Motivação:** até esta capacidade, criar uma conta do painel só era possível direto no banco. A única conta
existente era a que alguém inseriu à mão, e o painel não podia ser operado por mais de uma pessoa.

#### Scenario: Colaborador cadastrado

- **WHEN** um administrador informa nome, CPF, e-mail e senha válidos e confirma
- **THEN** o colaborador é criado
- **AND** o sistema informa o sucesso nomeando a pessoa e o e-mail de destino dos dados de acesso
- **AND** o formulário é encerrado e limpo

#### Scenario: Colaborador criado consegue entrar

- **WHEN** o colaborador recém-criado acessa o login com o CPF cadastrado e a senha informada
- **THEN** o acesso é concedido

#### Scenario: Formulário não guarda rascunho

- **WHEN** o administrador preenche campos, fecha sem confirmar e abre o cadastro de novo
- **THEN** os campos estão vazios
- **AND** a senha volta a ser apresentada oculta

### Requirement: CPF como credencial, validado e normalizado

O campo de CPF SHALL ser apresentado com pontuação progressiva durante a digitação e MUST ser enviado à API
somente com os dígitos. O sistema MUST recusar localmente, sem requisição, o CPF cujos dígitos verificadores
não conferem.

**Motivação:** o CPF é o login do colaborador e é único no banco. Gravá-lo com pontuação onde o restante do
sistema grava só dígitos criaria uma conta que o próprio login não encontra. A validação é a mesma da tela
de acesso, deliberadamente: duas regras diferentes para a mesma credencial divergiriam com o tempo.

#### Scenario: CPF apresentado com pontuação e enviado sem ela

- **WHEN** o administrador digita o CPF
- **THEN** ele é apresentado pontuado enquanto se digita
- **AND** o valor enviado à API contém apenas os dígitos

#### Scenario: CPF inválido barrado antes do envio

- **WHEN** o CPF informado tem dígitos verificadores inválidos
- **THEN** o sistema recusa o envio e explica no campo
- **AND** nenhuma requisição é feita

### Requirement: Senha inicial digitada pelo administrador

O formulário SHALL oferecer um campo de senha inicial com no mínimo oito caracteres e MUST permitir alternar
entre ocultá-la e exibi-la. O campo MUST NOT ser oferecido ao preenchimento automático de credenciais do
navegador.

O sistema MUST informar, junto ao campo, que essa senha é entregue ao colaborador por e-mail e que ele pode
trocá-la depois.

**Motivação:** quem digita a senha não é o dono dela, e a `api-fr` a envia em texto no e-mail de boas-vindas.
Como o valor não fica visível em lugar nenhum depois do cadastro, quem digitou precisa poder conferir o que
escreveu. E, sem a restrição ao preenchimento automático, o navegador ofereceria a credencial do próprio
administrador logado num campo cujo conteúdo será enviado a outra pessoa.

#### Scenario: Senha exibida sob demanda

- **WHEN** o administrador aciona a exibição da senha
- **THEN** o valor digitado passa a ser legível
- **AND** pode ser ocultado de novo

#### Scenario: Senha curta barrada antes do envio

- **WHEN** a senha informada tem menos de oito caracteres
- **THEN** o sistema recusa o envio e explica no campo

#### Scenario: Sem confirmação de senha

- **WHEN** o administrador preenche o formulário
- **THEN** não lhe é pedida uma segunda digitação da senha

### Requirement: Duplicidade apontada no campo em conflito

Quando a API recusar o cadastro por CPF ou e-mail já existente, o sistema MUST apresentar a explicação vinda
dela **sob o campo correspondente** e MUST levar o foco até ele. A explicação MUST NOT ser repetida como
aviso geral no mesmo momento.

Não sendo possível identificar o campo, o sistema MUST apresentar a explicação como aviso geral.

**Motivação:** há dois campos únicos neste cadastro. Um aviso geral obrigaria o usuário a traduzir a frase
para descobrir onde mexer, com o formulário inteiro preenchido à sua frente.

#### Scenario: CPF já cadastrado

- **WHEN** o CPF informado já pertence a outro colaborador
- **THEN** a explicação da API é apresentada sob o campo de CPF
- **AND** o foco vai para esse campo
- **AND** os dados digitados permanecem na tela

#### Scenario: E-mail já cadastrado

- **WHEN** o e-mail informado já pertence a outro colaborador
- **THEN** a explicação da API é apresentada sob o campo de e-mail
- **AND** o foco vai para esse campo

#### Scenario: Recusa não atribuível a um campo

- **WHEN** a API recusa o cadastro sem que a explicação identifique CPF ou e-mail
- **THEN** a explicação é apresentada como aviso geral

### Requirement: Falha explicada e recuperável

Quando a requisição falhar sem resposta interpretável da API, o sistema MUST apresentar um aviso próprio que
não afirme mais do que sabe, preservando o que foi digitado. Excedido o limite de tentativas, o sistema MUST
informar quanto tempo falta para tentar de novo.

O formulário MUST NOT ser fechado enquanto a requisição estiver em curso, e o sistema MUST impedir que uma
mesma confirmação dispare mais de uma requisição.

#### Scenario: Falha sem resposta utilizável

- **WHEN** a requisição falha sem resposta interpretável da API
- **THEN** o sistema apresenta um aviso próprio, sem atribuir uma causa que não conhece
- **AND** os dados digitados permanecem na tela

#### Scenario: Limite de tentativas atingido

- **WHEN** a API responde que o limite de tentativas foi excedido
- **THEN** o sistema informa quanto tempo falta para tentar novamente

#### Scenario: Fechamento durante a requisição

- **WHEN** o administrador tenta fechar o formulário com a requisição em curso
- **THEN** ele permanece aberto com os dados preservados

#### Scenario: Confirmação repetida

- **WHEN** o administrador aciona a confirmação mais de uma vez seguidas
- **THEN** apenas uma requisição é enviada

### Requirement: Papel e vínculo com salas fora do cadastro

O formulário MUST NOT oferecer escolha de papel nem vínculo com salas.

**Motivação:** a rota de cadastro não aceita papel — todo colaborador é criado como membro, e não existe rota
que promova alguém a administrador. O vínculo com salas é outra rota, e a resposta do cadastro não devolve o
identificador do colaborador criado, de modo que as duas chamadas não podem ser encadeadas.

#### Scenario: Sem escolha de papel

- **WHEN** o administrador abre o cadastro
- **THEN** não lhe é oferecida escolha de papel
- **AND** o colaborador criado é um membro

#### Scenario: Colaborador nasce sem sala

- **WHEN** o cadastro é concluído
- **THEN** o colaborador não fica vinculado a nenhuma sala
