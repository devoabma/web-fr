## ADDED Requirements

### Requirement: Sessão carregada pelo cookie da API

A sessão do funcionário SHALL ser sustentada pelo cookie `httpOnly` emitido pela API na autenticação. O
painel MUST NOT copiar o token para armazenamento acessível ao JavaScript do navegador. Toda requisição à
API MUST ser emitida com credenciais, para que o cookie acompanhe a chamada.

**Motivação:** o cookie é `httpOnly` justamente para que uma falha de XSS não valha sessão roubada; copiá-lo
para `localStorage` ou para um cookie legível anularia a proteção.

#### Scenario: Autenticação bem-sucedida

- **WHEN** o funcionário se autentica com credenciais válidas
- **THEN** a sessão passa a existir a partir do cookie devolvido pela API
- **AND** nenhum token é persistido em armazenamento local pelo painel

#### Scenario: Requisição autenticada

- **WHEN** o painel consulta um recurso protegido da API
- **THEN** a requisição é emitida com credenciais, de modo que o cookie de sessão seja enviado

### Requirement: Rotas protegidas por padrão

O sistema SHALL tratar como protegido todo endereço que não estiver declarado como público ou como parte do
fluxo de autenticação. Um endereço protegido MUST ser inalcançável sem sessão válida. O casamento de rota
MUST considerar o segmento inteiro, de modo que um endereço apenas prefixado pelo nome de outro não seja
confundido com ele.

**Motivação:** listar as rotas privadas exigiria que ninguém esquecesse de registrar uma tela nova, e esse
esquecimento não falha em desenvolvimento — falha em produção, expondo a tela.

#### Scenario: Visitante sem sessão em rota do painel

- **WHEN** um visitante sem sessão acessa um endereço do painel
- **THEN** ele é levado para a tela de login
- **AND** o conteúdo do painel não chega a ser renderizado

#### Scenario: Rota pública

- **WHEN** um visitante sem sessão acessa um endereço declarado como público
- **THEN** o conteúdo é servido normalmente

#### Scenario: Rota nova não declarada

- **WHEN** um endereço que não consta em nenhuma lista de rotas é acessado sem sessão
- **THEN** ele é tratado como protegido e leva ao login

#### Scenario: Nome apenas prefixado

- **WHEN** existe uma área restrita `/admin` e o usuário acessa um endereço como `/administrativo`
- **THEN** o endereço acessado não é tratado como pertencente a `/admin`

#### Scenario: Arquivos estáticos

- **WHEN** o navegador requisita um arquivo com extensão, como um ícone ou uma folha de estilos
- **THEN** a requisição não é submetida à guarda de rotas nem redirecionada para o login

### Requirement: Retorno ao destino pretendido após a autenticação

Quando um visitante sem sessão for barrado em um endereço protegido, o sistema SHALL preservar esse
endereço e, concluída a autenticação, levar o funcionário até ele. Na ausência de destino preservado, o
funcionário MUST ser levado à primeira tela do painel. O destino preservado MUST ser restrito a endereços
internos da própria aplicação.

**Motivação:** o parâmetro de retorno é escolhido por quem monta o link do login; aceitar endereço absoluto
transformaria a tela de autenticação em redirecionamento para fora do domínio.

#### Scenario: Barrado em endereço específico

- **WHEN** um visitante sem sessão tenta abrir um endereço protegido e em seguida se autentica
- **THEN** ele é levado ao endereço que tentou abrir originalmente

#### Scenario: Login acessado diretamente

- **WHEN** o funcionário abre a tela de login sem ter sido redirecionado e se autentica
- **THEN** ele é levado à primeira tela do painel

#### Scenario: Destino externo ou malformado

- **WHEN** o destino preservado aponta para fora da aplicação ou não é um caminho interno
- **THEN** ele é descartado e o funcionário é levado à primeira tela do painel

### Requirement: Sessão inválida é descartada

O sistema SHALL considerar sem sessão o funcionário cujo token esteja expirado, malformado, com papel
desconhecido ou sem prazo de validade declarado. Ao concluir que não há sessão utilizável, o sistema MUST
remover o cookie correspondente da resposta.

**Motivação:** um cookie inservível continua sendo reenviado pelo navegador a cada requisição; apenas
ignorá-lo prenderia o usuário em um laço entre o painel e o login.

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

### Requirement: Alcance das áreas restritas conforme o papel

O sistema SHALL restringir as áreas de administração do inventário a funcionários com papel `ADMIN`. Um
funcionário autenticado sem esse papel MUST ser devolvido à primeira tela do painel ao tentar alcançá-las,
em vez de receber uma tela de erro.

#### Scenario: MEMBER tenta abrir uma área de administração

- **WHEN** um funcionário com papel `MEMBER` acessa um endereço sob a área de administração
- **THEN** ele é levado à primeira tela do painel

#### Scenario: ADMIN abre uma área de administração

- **WHEN** um funcionário com papel `ADMIN` acessa um endereço sob a área de administração
- **THEN** o conteúdo é servido normalmente

### Requirement: Quem já tem sessão não retorna ao fluxo de autenticação

O sistema SHALL impedir que um funcionário autenticado permaneça nas telas do fluxo de autenticação,
levando-o à primeira tela do painel.

#### Scenario: Funcionário autenticado abre o login

- **WHEN** um funcionário com sessão válida acessa a tela de login
- **THEN** ele é levado à primeira tela do painel

### Requirement: A guarda de navegação não substitui a autorização da API

A verificação feita antes da renderização SHALL ser tratada como decisão de navegação, e não como controle
de acesso. O sistema MUST NOT depender dela para proteger dados: toda leitura e toda escrita MUST ser
autorizada pela API, que valida o token a cada requisição.

**Motivação:** a verificação lê o payload do token sem conferir a assinatura — conferi-la exigiria o
segredo do JWT dentro do front. Um cookie forjado atravessa a guarda sem esforço.

#### Scenario: Cookie forjado

- **WHEN** um cookie de sessão sintético, com formato válido e prazo futuro, é apresentado ao painel
- **THEN** a navegação pode ser liberada pela guarda
- **AND** nenhuma requisição à API é atendida com esse token, de modo que nenhum dado é exposto
