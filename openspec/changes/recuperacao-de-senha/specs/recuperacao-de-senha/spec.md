## ADDED Requirements

### Requirement: Solicitação de recuperação de acesso

O sistema SHALL oferecer, sem exigir sessão, uma tela onde o funcionário solicita a recuperação da própria
senha informando o CPF e o e-mail cadastrados. A tela MUST ser alcançável a partir da tela de entrada.

O sistema MUST validar o CPF localmente antes de qualquer requisição e MUST NOT alterar a caixa do e-mail
informado, porque o cadastro preserva a caixa original e a busca do funcionário a compara.

**Motivação:** a tela de entrada já anunciava esse caminho e ele terminava em erro de rota. Sem ele, a única
recuperação possível era pedir uma senha nova a um administrador.

#### Scenario: Solicitação aceita

- **WHEN** o funcionário informa um CPF e um e-mail que correspondem ao seu cadastro
- **THEN** o sistema registra o envio do código de redefinição para aquele e-mail
- **AND** o formulário dá lugar a uma confirmação que apresenta o e-mail de destino e o prazo de validade do
  código
- **AND** a confirmação oferece o caminho para informar o código

#### Scenario: Par de CPF e e-mail que não corresponde a um cadastro

- **WHEN** o funcionário informa um par que não corresponde a nenhum cadastro
- **THEN** o sistema apresenta a recusa devolvida pela API, sem revelar qual dos dois dados não conferiu

#### Scenario: CPF localmente inválido

- **WHEN** o CPF informado não passa na validação de dígitos verificadores
- **THEN** o sistema recusa o envio no próprio campo, sem consumir uma solicitação

#### Scenario: E-mail cadastrado com letras maiúsculas

- **WHEN** o funcionário informa o e-mail exatamente como consta no cadastro, com maiúsculas
- **THEN** o sistema envia o endereço sem alterar a caixa
- **AND** o cadastro é encontrado

### Requirement: Reenvio do código com espera obrigatória

O sistema SHALL permitir reenviar o código a partir da confirmação de envio, sem exigir que o funcionário
redigite CPF e e-mail. O reenvio MUST permanecer bloqueado por um intervalo após cada envio, com o tempo
restante visível.

A contagem do tempo restante MUST ser derivada do instante de término e não de decrementos sucessivos, para
permanecer correta quando a página deixa de receber tiques regulares.

O sistema MUST NOT transportar CPF ou e-mail pelo endereço da página.

**Motivação:** a rota de solicitação tem teto por endereço de rede e a janela reinicia a cada excesso.
Cliques repetidos trancariam o funcionário justamente quando ele mais precisa do código.

#### Scenario: Reenvio bloqueado logo após o envio

- **WHEN** o código acabou de ser enviado
- **THEN** o controle de reenvio permanece indisponível
- **AND** apresenta quanto tempo falta para ser liberado

#### Scenario: Reenvio liberado

- **WHEN** o intervalo de espera termina
- **THEN** o controle de reenvio volta a ficar disponível

#### Scenario: Página em segundo plano durante a espera

- **WHEN** a página deixa de receber tiques regulares durante a espera e volta a recebê-los
- **THEN** o tempo restante apresentado corresponde ao tempo real decorrido
- **AND** o controle é liberado assim que o intervalo se completa

#### Scenario: Falha no reenvio

- **WHEN** o reenvio falha
- **THEN** o sistema avisa a falha sem desfazer a confirmação já apresentada

### Requirement: Redefinição da senha com o código recebido

O sistema SHALL oferecer, sem exigir sessão, uma tela onde o funcionário informa o código recebido, a nova
senha e a confirmação da nova senha.

O sistema MUST normalizar o código para caixa alta e descartar caracteres fora do formato enquanto ele é
digitado, porque a busca do código diferencia maiúsculas de minúsculas. O sistema MUST recusar localmente,
antes de qualquer requisição, código fora do formato, senha abaixo do mínimo exigido pela API e confirmação
divergente — cada recusa indicada no campo que a originou.

O sistema MUST NOT estabelecer sessão automaticamente após a redefinição.

**Motivação:** o código chega por e-mail e é copiado à mão. Um espaço no fim ou a caixa trocada produziriam
"código inválido" e mandariam o funcionário gastar outra solicitação sem motivo.

#### Scenario: Redefinição bem-sucedida

- **WHEN** o funcionário informa um código válido e uma nova senha confirmada
- **THEN** a senha é alterada
- **AND** o formulário dá lugar a uma confirmação
- **AND** a confirmação oferece o caminho para entrar com a nova senha

#### Scenario: Código digitado em caixa baixa

- **WHEN** o funcionário digita ou cola o código em caixa baixa
- **THEN** o campo apresenta o código em caixa alta
- **AND** o código é aceito

#### Scenario: Código inválido ou expirado

- **WHEN** a API recusa o código por ser inválido ou estar expirado
- **THEN** o sistema apresenta a recusa
- **AND** posiciona o cursor no campo do código
- **AND** oferece o caminho para solicitar um novo código

#### Scenario: Nova senha igual à anterior

- **WHEN** a API recusa a nova senha por ser idêntica à anterior
- **THEN** o sistema apresenta a recusa
- **AND** posiciona o cursor no campo da nova senha

#### Scenario: Confirmação divergente

- **WHEN** a confirmação não coincide com a nova senha
- **THEN** o sistema recusa o envio no campo de confirmação, sem consumir uma tentativa

#### Scenario: Visibilidade das senhas

- **WHEN** o funcionário aciona a alternância de visibilidade
- **THEN** os dois campos de senha passam a ser exibidos em texto legível, em conjunto

### Requirement: Preenchimento do código a partir do link do e-mail

O sistema SHALL aceitar o código pelo endereço da tela de redefinição e apresentá-lo já preenchido no campo
correspondente.

O valor recebido pelo endereço MUST ser validado contra o formato do código antes de ser apresentado; valor
fora do formato MUST resultar em campo vazio, nunca em conteúdo parcial ou arbitrário.

**Motivação:** o e-mail de recuperação traz um link direto para a tela. Aproveitá-lo elimina a transcrição
manual — mas o endereço vem de fora e não pode ser tratado como confiável.

#### Scenario: Chegada pelo link do e-mail

- **WHEN** o funcionário abre a tela de redefinição pelo link do e-mail
- **THEN** o campo do código já vem preenchido com o código do link

#### Scenario: Endereço com código fora do formato

- **WHEN** o valor recebido pelo endereço não corresponde ao formato do código
- **THEN** o campo do código é apresentado vazio

#### Scenario: Chegada sem código no endereço

- **WHEN** o funcionário abre a tela de redefinição sem código no endereço
- **THEN** o campo do código é apresentado vazio, pronto para digitação

### Requirement: Limite de requisições no fluxo de recuperação

Quando a API recusar uma solicitação de recuperação ou uma redefinição por excesso de requisições, o sistema
SHALL apresentar o tempo de espera informado pela API em linguagem corrente, e MUST NOT repetir a requisição
automaticamente.

**Motivação:** as duas rotas têm teto por endereço de rede. Sem dizer quanto falta, o funcionário insiste no
botão achando que o problema é o dado informado.

#### Scenario: Excesso de solicitações de recuperação

- **WHEN** a API recusa a solicitação por excesso de requisições
- **THEN** o sistema apresenta há quanto tempo é preciso esperar antes de tentar de novo

#### Scenario: Excesso de tentativas de redefinição

- **WHEN** a API recusa a redefinição por excesso de requisições
- **THEN** o sistema apresenta há quanto tempo é preciso esperar antes de tentar de novo

### Requirement: Restrição do fluxo a quem não tem sessão

As telas do fluxo de recuperação SHALL ser tratadas como telas de autenticação: alcançáveis sem sessão e
indisponíveis para quem já está autenticado, que MUST ser devolvido ao painel.

**Motivação:** quem já está dentro troca a senha pela área de conta, com a senha atual em mãos. Deixar o
fluxo público aberto a uma sessão ativa duplicaria caminhos para o mesmo fim.

#### Scenario: Acesso sem sessão

- **WHEN** um visitante sem sessão abre qualquer tela do fluxo de recuperação
- **THEN** a tela é apresentada

#### Scenario: Acesso com sessão ativa

- **WHEN** um funcionário autenticado tenta abrir uma tela do fluxo de recuperação
- **THEN** o sistema o devolve ao painel
