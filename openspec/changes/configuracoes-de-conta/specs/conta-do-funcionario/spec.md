## ADDED Requirements

### Requirement: O funcionário enxerga os próprios dados de cadastro

O painel SHALL oferecer uma área de conta, restrita ao funcionário autenticado, apresentando nome, imagem,
papel, CPF e endereço de e-mail da sessão corrente. O papel MUST ser apresentado por rótulo em português. O
CPF MUST ser apresentado formatado, e não como sequência crua de dígitos.

A área MUST declarar que esses dados não são editáveis pelo próprio funcionário e MUST indicar a quem
recorrer para corrigi-los.

**Motivação:** o CPF é a credencial de acesso ao painel e não aparecia em tela nenhuma. Mostrar os dados sem
dizer que são de leitura levaria o funcionário a procurar um botão de edição que não existe.

#### Scenario: Abertura da área de conta

- **WHEN** um funcionário autenticado abre a área de conta
- **THEN** são apresentados seu nome, sua imagem, seu papel em português, seu CPF formatado e seu e-mail

#### Scenario: Funcionário sem imagem cadastrada

- **WHEN** o funcionário não possui imagem cadastrada
- **THEN** a área apresenta as iniciais do nome no lugar da foto, no mesmo espaço

#### Scenario: Dados não editáveis

- **WHEN** a área de conta apresenta os dados de cadastro
- **THEN** o sistema informa que a correção depende de um administrador
- **AND** não oferece nenhum controle de edição para esses dados

#### Scenario: Carregamento dos dados

- **WHEN** os dados da conta ainda estão sendo obtidos
- **THEN** a área apresenta indicação de carregamento no lugar do conteúdo

#### Scenario: Falha ao obter os dados

- **WHEN** a obtenção dos dados da conta falha
- **THEN** a área apresenta um aviso explicando a falha e o que fazer
- **AND** a rota permanece acessível, sem tela em branco nem erro não tratado

### Requirement: O funcionário troca a própria senha

O painel SHALL permitir que o funcionário autenticado altere a própria senha, exigindo a senha atual, a nova
senha e a confirmação da nova senha. O sistema MUST NOT depender de administrador nem de fluxo de
recuperação por e-mail para essa troca.

O sistema MUST recusar, antes de qualquer requisição, senha com menos que o mínimo exigido pela API,
confirmação divergente da nova senha e nova senha idêntica à senha atual — cada recusa indicada no campo que
a originou.

**Motivação:** a senha é entregue pelo administrador no cadastro. Sem esta ação, a senha inicial permanecia
para sempre e quem desconfiasse de exposição não tinha nada a fazer.

#### Scenario: Troca bem-sucedida

- **WHEN** o funcionário informa a senha atual correta e uma nova senha válida, confirmada
- **THEN** a senha é alterada
- **AND** o sistema confirma a troca
- **AND** o formulário é encerrado

#### Scenario: Senha atual incorreta

- **WHEN** a senha atual informada não confere
- **THEN** o sistema apresenta a recusa devolvida pela API
- **AND** descarta apenas o campo de senha atual, posicionando o foco nele
- **AND** preserva a nova senha e a confirmação já digitadas

#### Scenario: Confirmação divergente

- **WHEN** a confirmação não é igual à nova senha
- **THEN** o sistema indica a divergência no campo de confirmação
- **AND** nenhuma requisição é enviada

#### Scenario: Nova senha igual à atual

- **WHEN** a nova senha informada é igual à senha atual
- **THEN** o sistema indica a recusa no campo da nova senha
- **AND** nenhuma requisição é enviada

#### Scenario: Excesso de tentativas

- **WHEN** a API recusa a troca por excesso de tentativas
- **THEN** o sistema informa quanto tempo falta para tentar de novo
- **AND** não repete a requisição automaticamente

#### Scenario: Falha de comunicação

- **WHEN** a requisição de troca não obtém resposta da API
- **THEN** o sistema informa a falha em termos de conexão
- **AND** não afirma que a senha foi alterada

#### Scenario: Fechamento durante o envio

- **WHEN** o funcionário tenta encerrar o formulário enquanto a troca está em andamento
- **THEN** o formulário permanece aberto com os dados digitados até a conclusão da chamada

#### Scenario: Reabertura do formulário

- **WHEN** o funcionário encerra o formulário e o abre novamente
- **THEN** os campos estão vazios
- **AND** as senhas voltam a ser exibidas ocultas

### Requirement: A conferência das senhas digitadas é opcional e conjunta

O formulário de troca de senha SHALL oferecer um controle único que alterna a exibição em texto claro dos
três campos de senha ao mesmo tempo. O estado inicial MUST ser oculto.

**Motivação:** quem pede para ver a senha quer conferir se a nova e a confirmação batem — o interesse é nos
campos em conjunto, e um controle por campo multiplicaria alvos de clique e estados a lembrar.

#### Scenario: Exibição das senhas

- **WHEN** o funcionário aciona o controle de exibição
- **THEN** os três campos de senha passam a ser exibidos em texto claro

#### Scenario: Estado inicial

- **WHEN** o formulário de troca de senha é apresentado
- **THEN** os três campos de senha estão ocultos
