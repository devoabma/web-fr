## ADDED Requirements

### Requirement: Encerramento explícito da sessão

O painel SHALL oferecer ao funcionário autenticado uma ação para encerrar a própria sessão, alcançável a
partir de qualquer tela do painel. O encerramento MUST ser executado pela API, que remove o cookie de
sessão do navegador. Concluído o encerramento, o funcionário MUST ser levado à tela de login e MUST NOT
conseguir retornar ao painel pelo histórico de navegação.

**Motivação:** o cookie de sessão é `httpOnly` — o painel não consegue apagá-lo por conta própria. Sem a
participação da API, qualquer "sair" seria apenas uma navegação com a sessão intacta por trás.

#### Scenario: Saída bem-sucedida

- **WHEN** o funcionário aciona a saída do sistema e a API confirma o encerramento
- **THEN** o cookie de sessão deixa de existir no navegador
- **AND** o funcionário é levado à tela de login

#### Scenario: Retorno pelo histórico após a saída

- **WHEN** o funcionário, já na tela de login, tenta voltar pelo histórico do navegador
- **THEN** ele não alcança o conteúdo do painel

#### Scenario: Nova tentativa de acesso ao painel

- **WHEN** o funcionário digita um endereço do painel depois de sair
- **THEN** ele é tratado como visitante sem sessão e levado ao login

### Requirement: Falha no encerramento preserva a sessão e é comunicada

Quando a solicitação de encerramento não for concluída, o sistema MUST NOT navegar para a tela de login e
MUST NOT dar a entender que a sessão terminou. O funcionário SHALL ser informado da falha e MUST permanecer
com a ação de saída disponível para nova tentativa.

**Motivação:** o cookie continua válido quando a requisição não chega. Exibir a tela de login nesse estado
convence o funcionário de que saiu, e a próxima pessoa na mesma máquina entra no painel com a sessão dele.

#### Scenario: Rede indisponível durante a saída

- **WHEN** o funcionário aciona a saída e a requisição falha por indisponibilidade da API ou da rede
- **THEN** ele permanece no painel, com a sessão intacta
- **AND** recebe um aviso de que não foi possível encerrar a sessão
- **AND** a ação de saída continua disponível

#### Scenario: Progresso da saída

- **WHEN** a solicitação de encerramento está em andamento
- **THEN** a ação de saída indica o progresso e não aceita novo acionamento
- **AND** o menu que a contém permanece aberto até que o resultado seja conhecido

### Requirement: Dados da sessão anterior não sobrevivem à saída

Ao encerrar a sessão, o sistema SHALL descartar os dados do funcionário mantidos em memória pelo painel,
incluindo o perfil consultado com validade indefinida. Nenhuma informação do funcionário que saiu MUST
permanecer visível ou recuperável na mesma aba após o encerramento.

**Motivação:** o perfil é consultado uma vez por sessão e mantido sem revalidação. Sem descarte explícito,
o nome de quem saiu reapareceria na barra superior para quem entrasse em seguida na mesma máquina.

#### Scenario: Novo acesso na mesma aba

- **WHEN** um funcionário encerra a sessão e outro se autentica na mesma aba
- **THEN** a barra superior identifica o funcionário que acabou de entrar
- **AND** nenhum dado do funcionário anterior é apresentado

## MODIFIED Requirements

### Requirement: Sessão carregada pelo cookie da API

A sessão do funcionário SHALL ser sustentada pelo cookie `httpOnly` emitido pela API na autenticação. O
painel MUST NOT copiar o token para armazenamento acessível ao JavaScript do navegador. Toda requisição à
API MUST ser emitida com credenciais, para que o cookie acompanhe a chamada — **inclusive a requisição de
encerramento**, cuja resposta depende de credenciais para que a remoção do cookie seja aceita pelo
navegador.

**Motivação:** o cookie é `httpOnly` justamente para que uma falha de XSS não valha sessão roubada; copiá-lo
para `localStorage` ou para um cookie legível anularia a proteção. Na saída, a mesma exigência se inverte:
sem credenciais na requisição, a instrução de remoção é descartada e o funcionário continua autenticado.

#### Scenario: Autenticação bem-sucedida

- **WHEN** o funcionário se autentica com credenciais válidas
- **THEN** a sessão passa a existir a partir do cookie devolvido pela API
- **AND** nenhum token é persistido em armazenamento local pelo painel

#### Scenario: Requisição autenticada

- **WHEN** o painel consulta um recurso protegido da API
- **THEN** a requisição é emitida com credenciais, de modo que o cookie de sessão seja enviado

#### Scenario: Requisição de encerramento

- **WHEN** o painel solicita o encerramento da sessão
- **THEN** a requisição é emitida com credenciais
- **AND** a remoção do cookie determinada pela API é aplicada pelo navegador

### Requirement: Sessão inválida é descartada

O sistema SHALL considerar sem sessão o funcionário cujo token esteja expirado, malformado, com papel
desconhecido ou sem prazo de validade declarado. Ao concluir que não há sessão utilizável, o sistema MUST
remover o cookie correspondente da resposta.

O encerramento explícito SHALL ser entendido como remoção da credencial do navegador, e não como
invalidação do token: o painel MUST NOT supor que um token já emitido deixe de ser aceito pela API antes de
seu prazo de validade.

**Motivação:** um cookie inservível continua sendo reenviado pelo navegador a cada requisição; apenas
ignorá-lo prenderia o usuário em um laço entre o painel e o login. Quanto ao token, a API não mantém
registro de credenciais revogadas — declarar o contrário no painel criaria uma garantia que não existe.

#### Scenario: Token expirado

- **WHEN** o funcionário acessa o painel com um token cuja validade já passou
- **THEN** ele é levado ao login
- **AND** o cookie de sessão é removido

#### Scenario: Token corrompido

- **WHEN** o cookie de sessão contém um valor que não pode ser decodificado
- **THEN** o acesso é tratado como sem sessão e o cookie é removido

#### Scenario: Token sem prazo de validade

- **WHEN** o token não declara prazo de validade
- **THEN** ele é tratado como expirado

#### Scenario: Cookie inservível em rota pública

- **WHEN** um visitante com cookie inservível acessa uma rota pública
- **THEN** o conteúdo é servido normalmente
- **AND** o cookie é removido, para que a próxima navegação não repita a avaliação

#### Scenario: Token apresentado após o encerramento

- **WHEN** o mesmo token, obtido antes do encerramento, é apresentado diretamente à API dentro do prazo de
  validade
- **THEN** a API pode aceitá-lo, porque o encerramento removeu o cookie e não revogou a credencial
