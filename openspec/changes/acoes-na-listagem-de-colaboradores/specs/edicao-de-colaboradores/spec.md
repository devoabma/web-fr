## ADDED Requirements

### Requirement: Edição de colaborador a partir da listagem

A listagem de colaboradores SHALL oferecer, em cada pessoa, a edição de nome, e-mail e papel. O envio MUST
usar `PATCH /employees/update/:id` e MUST conter apenas os campos alterados.

O formulário MUST abrir preenchido com os valores atuais e MUST ser recarregado deles a cada abertura, para
que um rascunho abandonado não seja apresentado como se fosse o valor gravado. A confirmação MUST permanecer
indisponível enquanto nada tiver mudado e durante a chamada.

Salva a alteração, os novos dados MUST passar a constar na listagem sem recarga da página.

**Motivação:** a coluna de ações da listagem existia com os botões desabilitados. Sem edição, corrigir um
nome digitado errado exigia o banco de dados.

#### Scenario: Alteração salva

- **WHEN** um administrador altera algum dado do colaborador e confirma
- **THEN** o colaborador é atualizado
- **AND** os novos dados passam a constar na listagem sem recarga da página

#### Scenario: Apenas o que mudou é enviado

- **WHEN** o administrador altera somente o nome
- **THEN** o corpo da requisição contém somente o nome

#### Scenario: Formulário abre com os valores atuais

- **WHEN** o administrador abre a edição de um colaborador
- **THEN** os campos vêm preenchidos com os dados atuais dele

#### Scenario: Rascunho abandonado não reaparece

- **WHEN** o administrador altera campos, fecha o painel sem salvar e o abre de novo
- **THEN** os campos apresentam os valores gravados, e não o rascunho anterior

#### Scenario: E-mail já cadastrado

- **WHEN** o e-mail informado pertence a outro colaborador
- **THEN** a recusa da API é apresentada no próprio campo de e-mail
- **AND** o foco vai para esse campo

### Requirement: CPF fora do alcance da edição

O painel de edição SHALL apresentar o CPF do colaborador como leitura, sempre acompanhado da informação de
que ele não pode ser alterado ali. O CPF MUST NOT ser incluído no corpo da requisição.

**Motivação:** `PATCH /employees/update/:id` aceita apenas `name`, `email` e `role`. Omitir o CPF do painel
faria a ausência parecer esquecimento; apresentá-lo bloqueado responde a dúvida no lugar em que ela nasce —
e o CPF é a credencial de acesso do colaborador ao painel.

#### Scenario: CPF apresentado sem edição

- **WHEN** o administrador abre a edição de um colaborador
- **THEN** o CPF é apresentado com a máscara de leitura, indisponível para digitação
- **AND** o painel informa que ele não pode ser alterado por ali

### Requirement: Papel do próprio administrador protegido

Quando o colaborador editado for o administrador que está usando o painel, a alteração de papel SHALL ficar
indisponível, com a explicação apresentada junto do campo.

**Motivação:** a API aceita a mudança. Rebaixar a si mesmo retira o acesso à área administrativa
imediatamente — inclusive a este painel, que seria o único caminho para desfazer. A trava é da interface;
qualquer outro cliente da API continua podendo.

#### Scenario: Administrador editando a si mesmo

- **WHEN** o administrador abre a edição do próprio cadastro
- **THEN** o campo de papel fica indisponível
- **AND** o painel explica que ele perderia o acesso à área administrativa

#### Scenario: Administrador editando outra pessoa

- **WHEN** o administrador abre a edição de outro colaborador
- **THEN** o campo de papel fica disponível, com as duas opções

### Requirement: Cabeçalho acompanha a edição do próprio cadastro

Quando o administrador editar o próprio cadastro, a identificação apresentada no cabeçalho do painel MUST
acompanhar os novos dados sem recarga da página.

**Motivação:** nome e e-mail do usuário logado aparecem no canto da tela. Salvar a correção e continuar
vendo o dado antigo faria duvidar de que a alteração foi gravada.

#### Scenario: Nome alterado pelo próprio administrador

- **WHEN** o administrador salva uma alteração no próprio nome
- **THEN** o cabeçalho do painel passa a apresentar o nome novo
