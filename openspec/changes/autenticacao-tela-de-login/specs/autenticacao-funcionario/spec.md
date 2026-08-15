## ADDED Requirements

### Requirement: Tela de entrada do funcionário

O sistema SHALL servir, na rota `/auth/sign-in`, uma tela pública de identificação do funcionário composta
por campo de CPF, campo de senha, opção de manter a sessão, link de recuperação de senha e ação de entrada.
A tela MUST estar em grupo de rota público, separado do grupo que abrigará o painel autenticado.

#### Scenario: Funcionário acessa a tela de login

- **WHEN** um visitante acessa `/auth/sign-in`
- **THEN** o formulário é exibido com os campos de CPF e senha vazios
- **AND** a opção de manter-se conectado já vem marcada

#### Scenario: Chegada a partir da landing

- **WHEN** o visitante aciona a chamada principal da landing
- **THEN** ele é levado para `/auth/sign-in`

### Requirement: Validação local antes de consumir tentativa de login

O formulário SHALL validar CPF e senha no cliente antes de qualquer envio. O CPF MUST ser considerado
inválido quando não tiver 11 dígitos, quando for uma sequência de dígitos repetidos ou quando os dois
dígitos verificadores não conferirem. A senha MUST ter no mínimo 8 caracteres. Enquanto houver campo
inválido, o sistema MUST NOT emitir requisição de autenticação.

**Motivação:** o endpoint de autenticação da API aceita 5 tentativas por 10 minutos por IP + CPF; dado
malformado não pode consumir tentativa do usuário.

#### Scenario: CPF com dígito verificador incorreto

- **WHEN** o funcionário informa um CPF com 11 dígitos cujos verificadores não conferem e envia o formulário
- **THEN** a mensagem "CPF inválido." é exibida junto ao campo
- **AND** nenhuma requisição de autenticação é emitida

#### Scenario: Senha curta

- **WHEN** o funcionário informa uma senha com menos de 8 caracteres e envia o formulário
- **THEN** a mensagem de tamanho mínimo é exibida junto ao campo de senha
- **AND** nenhuma requisição de autenticação é emitida

#### Scenario: Dados válidos

- **WHEN** CPF e senha passam na validação
- **THEN** o formulário segue para o envio com o CPF reduzido a dígitos, sem pontuação

### Requirement: Máscara progressiva de CPF

O campo de CPF SHALL formatar o valor durante a digitação no padrão `000.000.000-00`, descartando
caracteres não numéricos e limitando a entrada a 11 dígitos. A formatação MUST NOT impedir a validação nem
alterar o valor enviado ao servidor.

#### Scenario: Digitação com pontuação automática

- **WHEN** o funcionário digita apenas números no campo de CPF
- **THEN** os separadores aparecem nas posições corretas conforme os dígitos são inseridos

#### Scenario: Entrada com caracteres inválidos

- **WHEN** o funcionário cola um texto com letras e símbolos no campo de CPF
- **THEN** apenas os dígitos são mantidos, até o limite de 11

### Requirement: Estados de envio e de erro do formulário

O formulário SHALL indicar visualmente o envio em andamento e MUST desabilitar a ação de entrada enquanto
ele durar, impedindo envios duplicados. O sistema SHALL reservar uma área de erro geral, distinta dos erros
de campo, para mensagens originadas do servidor — incluindo credenciais inválidas e excesso de tentativas.

#### Scenario: Envio em andamento

- **WHEN** o formulário está sendo enviado
- **THEN** a ação de entrada fica desabilitada e exibe indicador de progresso

#### Scenario: Erro geral vindo do servidor

- **WHEN** um erro não atribuível a um campo específico é registrado no formulário
- **THEN** ele é exibido em destaque no topo do formulário, com papel de alerta acessível

### Requirement: Alternância de visibilidade da senha

O campo de senha SHALL permitir alternar entre texto oculto e visível, mantendo o valor digitado. O
controle MUST comunicar seu estado atual a tecnologias assistivas.

#### Scenario: Revelar e ocultar a senha

- **WHEN** o funcionário aciona o controle de visibilidade
- **THEN** o conteúdo do campo passa a ser exibido em texto legível
- **AND** acionar novamente volta a ocultar, sem perder o valor digitado

### Requirement: Layout responsivo da tela de autenticação

A tela SHALL ocupar a altura da viewport e ser dividida em painel de marca e área de formulário. Em
viewports a partir de `md` os dois MUST aparecer lado a lado, ocupando metade da largura cada. Abaixo de
`md` eles MUST empilhar, com a área de formulário **acima** do painel de marca. Nenhuma largura a partir de
320px MUST provocar rolagem horizontal.

#### Scenario: Desktop

- **WHEN** a tela é exibida em viewport de 768px ou mais
- **THEN** o painel de marca ocupa a metade esquerda e o formulário a metade direita

#### Scenario: Telas estreitas

- **WHEN** a tela é exibida em viewport menor que 768px
- **THEN** o formulário aparece primeiro e o painel de marca abaixo dele
- **AND** as duas marcas do painel permanecem legíveis, sem rolagem horizontal

### Requirement: Símbolo da marca recolorível

O símbolo do Sala Livre SHALL ser fornecido como componente que herda a cor do contexto, com o traço de
destaque configurável independentemente do traço principal. Telas MUST NOT recriar o desenho nem depender
de arquivo de imagem quando precisarem de outra cor ou opacidade.

#### Scenario: Símbolo em fundo escuro

- **WHEN** o símbolo é usado sobre o painel de marca escuro
- **THEN** ele é exibido em branco, sem alteração do arquivo de origem

#### Scenario: Símbolo como marca d'água

- **WHEN** o símbolo é usado como elemento decorativo de fundo
- **THEN** ele é exibido com opacidade reduzida e ocultado de tecnologias assistivas
