## MODIFIED Requirements

### Requirement: Edição de uma sala cadastrada

A área administrativa de salas SHALL permitir alterar o nome, o **estado**, o tempo padrão e a descrição de
uma sala já cadastrada, a partir da própria listagem, usando `PATCH /rooms/update/:id`. Concluída a
alteração, a lista MUST refletir os dados novos sem exigir recarga da página.

A edição MUST partir dos dados atuais da sala, apresentados nos campos, e MUST aplicar as mesmas regras do
cadastro — nome entre 3 e 60 caracteres, estado entre as 27 unidades federativas, tempo padrão inteiro entre
15 e 480 minutos, descrição de até 200 caracteres. Editar uma sala não pode aceitar o que criar uma recusa.

O estado MUST ser enviado **apenas quando tiver sido alterado**. O sistema MUST NOT enviar o campo vazio nem
nulo para mantê-lo: na API, o campo ausente é o que significa "não alterar", e um valor vazio é recusado.

O identificador da sala MUST NOT ser editável: ele é derivado do nome pela API. A tela MUST apresentá-lo
como prévia enquanto o nome é digitado.

**Motivação:** sem edição, corrigir um nome errado ou um tempo padrão errado exigia inativar a sala e
cadastrar outra — e a sala antiga permanece na lista, porque a `api-fr` não exclui sala. O tempo padrão é a
cota diária de cada advogado naquela sala. O estado entrou na edição porque uma sala marcada no estado errado
não dá sintoma nenhum além das máquinas dela pararem de receber atualizações.

#### Scenario: Sala alterada

- **WHEN** o administrador altera os dados de uma sala e confirma
- **THEN** a sala passa a constar na lista com os dados novos
- **AND** isso acontece sem recarga da página
- **AND** o sistema informa o estado e o tempo padrão que passaram a valer

#### Scenario: Estado preservado quando não é alterado

- **WHEN** o administrador altera outro dado da sala sem tocar no estado e confirma
- **THEN** o estado MUST NOT ser incluído no envio
- **AND** a sala permanece no estado em que já estava

#### Scenario: Dados atuais apresentados

- **WHEN** o administrador aciona a edição de uma sala
- **THEN** os campos são apresentados preenchidos com os dados atuais dessa sala
- **AND** o campo de estado vem com o estado atual da sala selecionado

#### Scenario: Prévia do identificador

- **WHEN** o administrador altera o nome da sala
- **THEN** a tela apresenta o identificador que passará a valer
- **AND** o identificador MUST NOT ser editável diretamente

#### Scenario: Nome já usado por outra sala

- **WHEN** o nome informado corresponde ao identificador de outra sala
- **THEN** a recusa da API é apresentada ao administrador
- **AND** os dados digitados permanecem na tela para correção

#### Scenario: Recusa da API

- **WHEN** a alteração é recusada pela API
- **THEN** a mensagem da API é apresentada ao administrador
- **AND** quando a recusa for por excesso de tentativas, o tempo de espera é informado

## ADDED Requirements

### Requirement: Troca de estado advertida quanto ao prazo do efeito

Quando o estado escolhido for diferente do estado atual da sala, o sistema MUST informar que as estações
daquela sala passarão a receber as atualizações do estado novo **na próxima vez que se conectarem**.

O sistema MUST NOT impedir a troca nem tratá-la como operação perigosa: trocar o estado é, na maior parte dos
casos, a correção de um cadastro errado.

**Motivação:** o programa da máquina recebe o estado no momento em que se registra no canal e o guarda
localmente. Alterar o cadastro não alcança as estações já conectadas. Sem esse aviso, a mudança pareceria
valer imediatamente para as máquinas ligadas naquele momento — e o administrador concluiria, erradamente, que
a publicação seguinte já chegaria a elas.

#### Scenario: Aviso ao escolher outro estado

- **WHEN** o administrador escolhe um estado diferente do atual da sala
- **THEN** o sistema informa que as estações passarão a receber as atualizações do estado escolhido na
  próxima vez que se conectarem

#### Scenario: Sem aviso quando o estado não muda

- **WHEN** o estado selecionado é o mesmo que a sala já tinha
- **THEN** o aviso não é apresentado

#### Scenario: Troca não é bloqueada

- **WHEN** o administrador confirma a alteração com o estado trocado
- **THEN** a alteração é enviada sem exigir confirmação adicional
