## ADDED Requirements

### Requirement: O bloco de usuário é o ponto de controle da conta

A imagem do funcionário na barra superior SHALL ser um gatilho que abre um menu com as ações de conta. O
gatilho MUST ser alcançável e operável por teclado, e MUST possuir um nome acessível que descreva a ação —
não apenas a identidade do funcionário. O menu MUST poder ser fechado sem que nenhuma ação seja executada.

**Motivação:** abaixo de 640px o nome ao lado do avatar não é exibido, e o conteúdo restante do gatilho são
as iniciais do funcionário. "HM, botão" não informa a ninguém que ali existe um menu de conta.

#### Scenario: Abertura do menu

- **WHEN** o funcionário aciona a imagem na barra superior
- **THEN** o menu de conta é apresentado ancorado ao gatilho

#### Scenario: Operação por teclado

- **WHEN** o funcionário alcança o gatilho pelo teclado e o aciona
- **THEN** o menu abre e seus itens podem ser percorridos pelo teclado
- **AND** o menu pode ser fechado sem executar nenhum item

#### Scenario: Nome acessível do gatilho

- **WHEN** uma tecnologia assistiva anuncia o gatilho
- **THEN** o anúncio descreve a abertura do menu do usuário, e não somente o nome ou as iniciais

#### Scenario: Barra estreita

- **WHEN** a barra superior é exibida em largura na qual o nome do funcionário não cabe ao lado da imagem
- **THEN** o gatilho continua disponível e o menu continua legível, com largura própria e independente do
  tamanho da imagem que o ancora

### Requirement: Identificação completa do funcionário dentro do menu

O menu de conta SHALL apresentar o nome, o endereço de e-mail e o papel do funcionário da sessão corrente.
O papel MUST ser apresentado por rótulo em português, e não pelo identificador técnico devolvido pela API.
Valores longos MUST ser truncados sem alargar o menu nem quebrar seu alinhamento.

**Motivação:** o painel já recebia o papel e o e-mail no perfil e os descartava. O papel decide o que o
funcionário enxerga na navegação; deixá-lo visível evita a dúvida de por que a área de administração não
aparece.

#### Scenario: Funcionário administrador

- **WHEN** um funcionário com papel `ADMIN` abre o menu de conta
- **THEN** o menu apresenta seu nome, seu e-mail e o rótulo correspondente ao papel de administrador

#### Scenario: Funcionário comum

- **WHEN** um funcionário com papel `MEMBER` abre o menu de conta
- **THEN** o menu apresenta seu nome, seu e-mail e o rótulo correspondente ao papel de membro

#### Scenario: Nome ou e-mail extensos

- **WHEN** o nome ou o e-mail do funcionário excedem a largura do menu
- **THEN** o texto é truncado
- **AND** a largura do menu permanece a mesma

## MODIFIED Requirements

### Requirement: Identificação do funcionário autenticado na barra superior

A barra superior SHALL identificar o funcionário da sessão corrente por nome e imagem, obtidos da API. O
sistema MUST NOT exibir identificação fixa no código. Quando o funcionário não tiver imagem cadastrada, a
barra MUST apresentar as iniciais do nome no lugar da foto, ocupando o mesmo espaço. As iniciais MUST
também substituir a foto quando houver imagem cadastrada mas ela não puder ser carregada.

O cálculo das iniciais SHALL ser compartilhado pelo sistema, para que a barra superior e as listagens de
funcionários apresentem o mesmo resultado para o mesmo nome.

**Motivação:** o contrato da API declara a imagem como anulável, e uma URL válida ainda pode falhar no
carregamento — endereço expirado, armazenamento fora do ar. Tratar apenas a ausência deixaria a barra com um
espaço vazio nesse segundo caso.

#### Scenario: Funcionário com foto

- **WHEN** o painel é aberto por um funcionário que tem imagem cadastrada
- **THEN** a barra superior exibe o nome e a foto desse funcionário

#### Scenario: Funcionário sem foto

- **WHEN** o painel é aberto por um funcionário sem imagem cadastrada
- **THEN** a barra superior exibe as iniciais do nome no lugar da foto
- **AND** a barra é renderizada sem erro

#### Scenario: Foto cadastrada mas indisponível

- **WHEN** o funcionário tem imagem cadastrada e o carregamento dessa imagem falha
- **THEN** a barra superior exibe as iniciais do nome no mesmo espaço

#### Scenario: Iniciais consistentes entre telas

- **WHEN** o mesmo funcionário sem foto aparece na barra superior e em uma listagem
- **THEN** as iniciais apresentadas são idênticas nos dois lugares
