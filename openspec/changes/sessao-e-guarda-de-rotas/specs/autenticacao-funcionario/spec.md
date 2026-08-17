## MODIFIED Requirements

### Requirement: Estados de envio e de erro do formulário

O formulário SHALL indicar visualmente o envio em andamento e MUST desabilitar a ação de entrada enquanto
ele durar, impedindo envios duplicados. O sistema SHALL reservar uma área de erro geral, distinta dos erros
de campo, para mensagens originadas do servidor — incluindo credenciais inválidas e excesso de tentativas.

Concluída a validação local, o formulário SHALL submeter CPF e senha ao endpoint de autenticação da API. A
mensagem exibida na área de erro geral MUST vir do servidor quando houver uma; na ausência de resposta
interpretável — queda de rede ou erro de gateway, por exemplo — o sistema MUST exibir uma mensagem própria,
e MUST NOT exibir uma área de erro vazia.

Após uma tentativa malsucedida, o sistema SHALL descartar apenas a senha, preservando o CPF já digitado, e
MUST devolver o foco ao campo de senha.

**Motivação:** são cinco tentativas por 10 minutos; obrigar a redigitar o CPF a cada erro gasta o tempo do
usuário sem reduzir erro algum.

#### Scenario: Envio em andamento

- **WHEN** o formulário está sendo enviado
- **THEN** a ação de entrada fica desabilitada e exibe indicador de progresso

#### Scenario: Erro geral vindo do servidor

- **WHEN** um erro não atribuível a um campo específico é registrado no formulário
- **THEN** ele é exibido em destaque no topo do formulário, com papel de alerta acessível

#### Scenario: Credenciais inválidas

- **WHEN** a API recusa as credenciais informadas
- **THEN** a mensagem devolvida pela API é exibida na área de erro geral
- **AND** o CPF permanece preenchido, a senha é limpa e o foco volta para o campo de senha

#### Scenario: API indisponível

- **WHEN** a requisição de autenticação falha sem resposta interpretável da API
- **THEN** uma mensagem própria do painel é exibida na área de erro geral
- **AND** a área de erro nunca aparece sem texto

#### Scenario: Autenticação bem-sucedida

- **WHEN** as credenciais são aceitas
- **THEN** o funcionário é notificado do acesso concedido
- **AND** é levado ao painel, ou ao endereço que tentou abrir antes de ser barrado

## ADDED Requirements

### Requirement: Excesso de tentativas comunicado como tempo de espera

Quando a API recusar a autenticação por excesso de tentativas, o sistema SHALL exibir na área de erro geral
o tempo restante de bloqueio em linguagem corrente, derivado do prazo informado pela resposta. O sistema
MUST NOT reemitir a requisição automaticamente enquanto o bloqueio durar.

**Motivação:** o endpoint aceita 5 tentativas por 10 minutos por IP + CPF. Dizer apenas "erro" deixa o
funcionário insistindo contra uma porta fechada, e cada nova tentativa empurra o desbloqueio para a frente.

#### Scenario: Teto de tentativas atingido

- **WHEN** a API responde que o limite de tentativas foi excedido, informando o prazo de espera
- **THEN** a área de erro geral exibe quanto tempo falta, em minutos e segundos legíveis
- **AND** nenhuma nova tentativa é emitida automaticamente

#### Scenario: Prazo abaixo de um minuto

- **WHEN** o prazo informado é menor que um minuto
- **THEN** o tempo é apresentado em segundos

### Requirement: Cache da sessão anterior descartado no login

Ao concluir uma autenticação, o sistema SHALL descartar os dados de sessão anterior mantidos em memória no
navegador.

**Motivação:** o perfil do funcionário é consultado uma única vez por sessão; sem o descarte, dois
funcionários usando a mesma aba em sequência veriam o painel abrir com a identificação do primeiro.

#### Scenario: Troca de funcionário na mesma aba

- **WHEN** um funcionário se autentica em uma aba onde outro esteve autenticado antes
- **THEN** nenhum dado do funcionário anterior é reaproveitado
