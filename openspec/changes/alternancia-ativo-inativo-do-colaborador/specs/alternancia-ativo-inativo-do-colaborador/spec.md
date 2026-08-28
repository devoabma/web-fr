## ADDED Requirements

### Requirement: Alternância da situação a partir da listagem

A listagem de colaboradores SHALL oferecer, em cada linha, o controle que alterna a situação daquele
colaborador entre ativa e inativa. O controle apresentado MUST corresponder ao sentido disponível: a
linha de um colaborador ativo oferece inativar, a de um inativo oferece reativar.

A alternância MUST NOT apagar cadastro, vínculos de sala ou histórico. Inativar MUST ser reversível
pelo controle que passa a ocupar o mesmo lugar.

**Motivação:** a coluna de situação já era apresentada, mas nada na interface a produzia — desligar
alguém exigia acesso ao banco.

#### Scenario: Colaborador ativo

- **WHEN** a linha de um colaborador ativo é apresentada
- **THEN** o controle oferecido é o de inativar

#### Scenario: Colaborador inativo

- **WHEN** a linha de um colaborador inativo é apresentada
- **THEN** o controle oferecido é o de reativar

#### Scenario: Situação atualizada na lista

- **WHEN** a alternância é concluída com sucesso
- **THEN** a listagem passa a apresentar a nova situação
- **AND** o controle da linha passa a oferecer o sentido oposto

### Requirement: Confirmação apenas ao inativar

Inativar SHALL exigir confirmação explícita. Reativar MUST ser executado diretamente, sem confirmação.

**Motivação:** inativar tira o acesso de uma pessoa e o erro só aparece quando ela tenta entrar;
reativar devolve acesso e é desfeito pelo controle que aparece em seguida.

A confirmação MUST informar o efeito real sobre uma sessão já aberta: o impedimento vale a partir do
próximo acesso, e não interrompe quem está com o painel aberto. A confirmação MUST NOT afirmar que o
colaborador é desconectado imediatamente.

A confirmação MUST informar que os vínculos de sala e o histórico permanecem.

Enquanto a alternância estiver em andamento, o controle de confirmação MUST estar indisponível e a
confirmação MUST NOT ser encerrada — um segundo acionamento produziria uma recusa da API sobre uma ação
que já deu certo.

#### Scenario: Inativar com confirmação

- **WHEN** o usuário aciona o controle de inativar
- **THEN** uma confirmação é apresentada nomeando o colaborador
- **AND** informa que o impedimento vale a partir do próximo acesso
- **AND** informa que vínculos e histórico permanecem

#### Scenario: Reativar sem confirmação

- **WHEN** o usuário aciona o controle de reativar
- **THEN** a reativação é executada imediatamente
- **AND** o resultado é comunicado

#### Scenario: Acionamento repetido

- **WHEN** a confirmação é acionada duas vezes seguidas
- **THEN** apenas uma alteração é enviada
- **AND** nenhuma mensagem de erro é apresentada

### Requirement: Impedimento de inativar o próprio cadastro

A interface SHALL impedir que o administrador autenticado inative o próprio cadastro, antes do
acionamento. O controle correspondente MUST ser apresentado como indisponível e MUST explicar o motivo
quando percorrido pelo ponteiro ou pelo foco.

O controle indisponível MUST permanecer capaz de apresentar sua explicação — um controle que apenas
apaga, sem responder, deixa o usuário sem saber por que a ação sumiu.

**Motivação:** a API recusa a operação, mas deixar a recusa chegar como erro transforma uma regra fixa
numa tentativa frustrada.

#### Scenario: Própria linha do administrador

- **WHEN** o administrador autenticado percorre o controle de inativar da própria linha
- **THEN** o controle é apresentado como indisponível
- **AND** a explicação informa que não é possível inativar o próprio cadastro

#### Scenario: Acionamento na própria linha

- **WHEN** o administrador autenticado aciona o controle de inativar da própria linha
- **THEN** nenhuma confirmação é apresentada
- **AND** nenhuma alteração é enviada

### Requirement: Comunicação de falhas da alternância

Falhando a alternância, a tela SHALL comunicar o motivo devolvido pela API e MUST NOT alterar a
situação apresentada na listagem.

Quando a falha for por excesso de tentativas, a mensagem MUST informar o tempo de espera por extenso.

#### Scenario: Falha comum

- **WHEN** a alternância falha
- **THEN** a mensagem da API é comunicada
- **AND** a linha continua apresentando a situação anterior

#### Scenario: Excesso de tentativas

- **WHEN** a alternância é recusada por excesso de tentativas
- **THEN** a mensagem informa quanto tempo é preciso esperar
