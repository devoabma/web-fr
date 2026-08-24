## ADDED Requirements

### Requirement: Edição de uma sala cadastrada

A área administrativa de salas SHALL permitir alterar o nome, o tempo padrão e a descrição de uma sala já
cadastrada, a partir da própria listagem, usando `PATCH /rooms/update/:id`. Concluída a alteração, a lista
MUST refletir os dados novos sem exigir recarga da página.

A edição MUST partir dos dados atuais da sala, apresentados nos campos, e MUST aplicar as mesmas regras do
cadastro — nome entre 3 e 60 caracteres, tempo padrão inteiro entre 15 e 480 minutos, descrição de até 200
caracteres. Editar uma sala não pode aceitar o que criar uma recusa.

O identificador da sala MUST NOT ser editável: ele é derivado do nome pela API. A tela MUST apresentá-lo
como prévia enquanto o nome é digitado.

**Motivação:** sem edição, corrigir um nome errado ou um tempo padrão errado exigia inativar a sala e
cadastrar outra — e a sala antiga permanece na lista, porque a `api-fr` não exclui sala. O tempo padrão é a
cota diária de cada advogado naquela sala.

#### Scenario: Sala alterada

- **WHEN** o administrador altera os dados de uma sala e confirma
- **THEN** a sala passa a constar na lista com os dados novos
- **AND** isso acontece sem recarga da página
- **AND** o sistema informa o tempo padrão que passou a valer

#### Scenario: Dados atuais apresentados

- **WHEN** o administrador aciona a edição de uma sala
- **THEN** os campos são apresentados preenchidos com os dados atuais dessa sala

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

### Requirement: Descrição apagada limpa a sala

Quando o administrador apaga a descrição de uma sala, o sistema SHALL registrar a sala como **sem
descrição**, e MUST NOT gravar uma descrição em branco.

**Motivação:** a rota distingue três estados — campo omitido mantém o que está gravado, `null` limpa e uma
string vazia é gravada como tal. O campo de texto devolve string vazia quando esvaziado, então a conversão
precisa acontecer antes do envio.

#### Scenario: Descrição esvaziada

- **WHEN** o administrador apaga a descrição de uma sala e confirma
- **THEN** a sala passa a constar sem descrição

#### Scenario: Descrição não tocada

- **WHEN** o administrador altera apenas outros campos
- **THEN** a descrição gravada permanece como estava

### Requirement: Proteção do formulário de edição em andamento

O formulário de edição SHALL resistir ao fechamento por clique fora, e MUST continuar podendo ser fechado
por tecla de escape e pela ação de cancelar.

Enquanto a alteração está sendo enviada, o formulário MUST NOT poder ser fechado e a confirmação MUST NOT
poder ser acionada de novo.

A cada abertura, os campos MUST ser recarregados a partir da sala. A confirmação MUST ficar indisponível
enquanto nenhum dado tiver sido alterado.

**Motivação:** o formulário de edição abre preenchido e é disparado de dentro de uma tabela que ocupa a
tela. Um clique fora descartaria o trabalho sem aviso e sem desfazer. Já travar a tecla de escape deixaria
quem navega por teclado sem saída do diálogo.

#### Scenario: Clique fora do formulário

- **WHEN** o administrador clica fora do formulário de edição
- **THEN** o formulário permanece aberto, com o que foi digitado

#### Scenario: Fechamento deliberado

- **WHEN** o administrador aciona a tecla de escape ou a ação de cancelar
- **THEN** o formulário é fechado

#### Scenario: Rascunho abandonado

- **WHEN** o administrador digita, fecha o formulário sem confirmar e o abre de novo
- **THEN** os campos são apresentados com os dados gravados da sala, e não com o que foi digitado antes

#### Scenario: Nada a salvar

- **WHEN** o formulário está aberto e nenhum campo foi alterado
- **THEN** a confirmação está indisponível

#### Scenario: Alteração desfeita

- **WHEN** o administrador altera um campo e o devolve ao valor original
- **THEN** a confirmação volta a ficar indisponível

#### Scenario: Acionamento repetido durante a chamada

- **WHEN** o administrador confirma a alteração e torna a confirmar antes da resposta
- **THEN** apenas uma alteração é enviada

#### Scenario: Fechamento durante a chamada

- **WHEN** o administrador tenta fechar o formulário enquanto a alteração está sendo enviada
- **THEN** o formulário permanece aberto até a resposta
