## ADDED Requirements

### Requirement: Edição de computador a partir da listagem

A listagem de computadores SHALL oferecer, em cada máquina, a edição de sala, número, descrição e endereço
físico da placa de rede. O envio MUST usar `PATCH /computers/update/:id`.

O formulário MUST abrir preenchido com os valores atuais da máquina e MUST ser recarregado deles a cada
abertura, para que um rascunho abandonado não seja apresentado como se fosse o valor gravado. A confirmação
MUST permanecer indisponível enquanto nada tiver mudado.

Salva a alteração, o sistema MUST informar o sucesso nomeando a máquina, o endereço gravado e a sala, e a
máquina MUST passar a constar com os novos dados tanto na listagem quanto na grade do painel, sem recarga da
página.

**Motivação:** sem edição, corrigir um dado errado exigia excluir e recadastrar — e a exclusão de computador
apaga o histórico de sessões e as impressões da máquina. Um dígito trocado custava o histórico.

#### Scenario: Alteração salva

- **WHEN** um administrador altera algum dado da máquina e confirma
- **THEN** a máquina é atualizada
- **AND** o sistema informa o sucesso nomeando a máquina, o endereço gravado e a sala
- **AND** os novos dados passam a constar na listagem e na grade do painel

#### Scenario: Formulário abre com os valores atuais

- **WHEN** o administrador abre a edição de uma máquina
- **THEN** os campos vêm preenchidos com os dados atuais dela

#### Scenario: Nada alterado não permite salvar

- **WHEN** o formulário está aberto e nenhum dado foi alterado
- **THEN** a confirmação permanece indisponível

#### Scenario: Rascunho abandonado não volta

- **WHEN** o administrador altera campos, fecha sem salvar e abre a edição de novo
- **THEN** os campos apresentam os dados gravados, não o que havia sido digitado antes

### Requirement: Endereço físico corrigível pela interface

A edição SHALL permitir corrigir o endereço físico da placa de rede, com a mesma apresentação agrupada e a
mesma tolerância a separadores do cadastro.

**Motivação:** o endereço errado é o defeito mais caro e mais silencioso do cadastro. A máquina aparece na
grade, mas nunca é reconhecida como conectada, e a liberação fica indisponível nela para sempre. Corrigir o
endereço é o que devolve a estação à operação — e, antes desta capacidade, isso só era possível apagando o
histórico da máquina.

#### Scenario: Endereço corrigido

- **WHEN** o administrador corrige o endereço físico de uma máquina e confirma
- **THEN** a máquina passa a constar com o endereço novo
- **AND** ela deixa de depender de exclusão e recadastro para ser corrigida

#### Scenario: Endereço já usado por outra máquina

- **WHEN** o endereço informado já pertence a outra máquina
- **THEN** a explicação da API é apresentada
- **AND** o foco volta ao campo do endereço físico
- **AND** os dados digitados permanecem na tela

### Requirement: Sala de destino restrita às ativas, com a sala atual preservada

O seletor de sala SHALL oferecer as salas ativas como destino. A sala atual da máquina MUST ser oferecida
mesmo quando estiver inativa, identificada como tal, para que o formulário não abra sem sala selecionada e
para que a máquina possa sair de uma sala desativada.

Quando a sala escolhida for diferente da atual, o sistema MUST informar que a máquina muda de sala.

**Motivação:** a API só verifica que a sala de destino existe, não que ela está ativa. E filtrar a lista sem
exceção deixaria sem valor o seletor da máquina que está justamente numa sala desativada — o formulário
pareceria corrompido antes de o usuário tocar em nada.

#### Scenario: Sala inativa não é oferecida como destino

- **WHEN** existe uma sala inativa que não é a da máquina editada
- **THEN** ela não aparece entre as salas oferecidas

#### Scenario: Sala atual inativa continua no seletor

- **WHEN** a máquina editada está numa sala inativa
- **THEN** essa sala aparece selecionada no formulário
- **AND** é identificada como inativa

#### Scenario: Mudança de sala é anunciada

- **WHEN** o administrador escolhe uma sala diferente da atual
- **THEN** o sistema informa que a máquina passa a valer na sala escolhida

### Requirement: Número da própria máquina não conta como ocupado

Ao apresentar os números já em uso na sala escolhida, o sistema MUST desconsiderar a máquina que está sendo
editada.

**Motivação:** a API compara o número excluindo o próprio registro. Apresentar o número atual da máquina como
ocupado mandaria trocar um valor que já é válido.

#### Scenario: Números em uso desconsideram a máquina editada

- **WHEN** o administrador abre a edição de uma máquina
- **THEN** os números apresentados como em uso naquela sala não incluem o número dela

### Requirement: Máquina em uso é advertida, não impedida de ser editada

O sistema MUST permitir a edição de máquina em uso, porque a API a permite e nem toda correção afeta a sessão
em andamento. O sistema MUST advertir, quando a máquina estiver em uso, que trocar o endereço físico ou a
sala tira a estação da grade até o programa da máquina reconectar.

**Motivação:** a exclusão é recusada para máquina em uso; a edição não é. Bloquear tudo seria mais restritivo
que o contrato — corrigir uma descrição com a máquina ocupada é inofensivo. Já trocar o endereço com sessão
aberta é o efeito desejado quando ele estava errado e um estrago quando estava certo, e só quem opera sabe
qual é o caso.

#### Scenario: Advertência na máquina em uso

- **WHEN** o administrador abre a edição de uma máquina em uso
- **THEN** o sistema adverte sobre o efeito de trocar o endereço físico ou a sala

#### Scenario: Edição de máquina em uso é permitida

- **WHEN** o administrador altera dados de uma máquina em uso e confirma
- **THEN** a alteração é enviada

### Requirement: Recusa da API explicada e recuperável

Quando a API recusar a alteração, o sistema MUST apresentar a explicação vinda dela, MUST preservar o que foi
digitado e MUST devolver o foco ao campo do endereço físico. Não havendo explicação utilizável, o sistema
MUST apresentar um texto próprio que não afirme mais do que sabe. Excedido o limite de tentativas, o sistema
MUST informar quanto tempo falta para tentar de novo.

O diálogo MUST NOT ser fechado enquanto a requisição estiver em curso, nem por clique fora enquanto houver
dados no formulário — o fechamento MUST continuar disponível por tecla de escape e pela ação de cancelar. O
sistema MUST impedir que uma mesma confirmação dispare mais de uma requisição.

#### Scenario: Número já usado na sala de destino

- **WHEN** o número informado já pertence a outra máquina da sala escolhida
- **THEN** a explicação da API é apresentada
- **AND** os dados digitados permanecem na tela

#### Scenario: Descrição já usada na sala de destino

- **WHEN** a descrição informada já pertence a outra máquina da sala escolhida
- **THEN** a explicação da API é apresentada

#### Scenario: Falha sem resposta utilizável

- **WHEN** a requisição falha sem resposta interpretável da API
- **THEN** o sistema apresenta um aviso próprio, sem atribuir uma causa que não conhece

#### Scenario: Limite de tentativas atingido

- **WHEN** a API responde que o limite de tentativas foi excedido
- **THEN** o sistema informa quanto tempo falta para tentar novamente

#### Scenario: Clique fora não descarta a edição

- **WHEN** o administrador clica fora do diálogo de edição
- **THEN** ele permanece aberto com os dados preservados

#### Scenario: Fechamento durante a requisição

- **WHEN** o administrador tenta fechar o diálogo com a requisição em curso
- **THEN** ele permanece aberto com os dados preservados

#### Scenario: Confirmação repetida

- **WHEN** o administrador aciona a confirmação mais de uma vez seguidas
- **THEN** apenas uma requisição é enviada
