## ADDED Requirements

### Requirement: Inventário de computadores listado com busca

A área administrativa de computadores SHALL apresentar as máquinas cadastradas, informando para cada uma o
número que ela tem na sala, a descrição, a sala vinculada, o endereço físico da placa de rede, a situação e a
data de cadastro. O número MUST ser apresentado com o mesmo termo que a grade do painel usa — "estação" —,
para que a mesma máquina seja chamada do mesmo jeito nas duas telas.

A tela SHALL oferecer busca que encontre a máquina tanto pelo nome da sala quanto pela descrição, sem exigir
que o administrador saiba de antemão por qual dos dois procurar. A busca MUST reagir à digitação sem recarga
da página.

Falhando o carregamento, o sistema MUST apresentar um aviso no lugar da tabela e MUST NOT apresentar a lista
vazia como se o inventário estivesse vazio.

**Motivação:** `cadastro-de-salas` entregou o formulário sem listagem e registrou o custo — quem cadastra não
vê o resultado e repete o cadastro sem perceber. Aqui a lista nasce junto.

#### Scenario: Inventário apresentado

- **WHEN** um administrador abre a área de computadores
- **THEN** as máquinas cadastradas são apresentadas com número, descrição, sala, endereço físico, situação e
  data de cadastro

#### Scenario: Busca pelo nome da sala

- **WHEN** o administrador busca pelo nome de uma sala
- **THEN** as máquinas daquela sala são apresentadas

#### Scenario: Busca pela descrição

- **WHEN** o administrador busca pela descrição de uma máquina
- **THEN** a máquina correspondente é apresentada

#### Scenario: Busca sem resultado

- **WHEN** a busca não encontra nenhuma máquina
- **THEN** o sistema informa que nada foi encontrado

#### Scenario: Falha ao carregar o inventário

- **WHEN** o carregamento do inventário falha
- **THEN** o sistema apresenta um aviso no lugar da tabela
- **AND** não apresenta a ausência de dados como inventário vazio

### Requirement: Situação da máquina com manutenção acima de em uso

A situação apresentada SHALL distinguir três estados: em manutenção, em uso e disponível. Quando a máquina
estiver em manutenção, o sistema MUST apresentá-la como em manutenção mesmo que ela também conste como em
uso, e MUST NOT apresentá-la como ocupada.

**Motivação:** os dois estados são independentes no servidor. Uma máquina pode entrar em manutenção com a
marca de uso pendente de uma sessão anterior; apresentá-la como ocupada manda o balcão encerrar uma sessão
que não está de pé.

#### Scenario: Máquina em manutenção

- **WHEN** a máquina está em manutenção
- **THEN** a situação apresentada é a de manutenção

#### Scenario: Máquina em manutenção e marcada como em uso

- **WHEN** a máquina está em manutenção e também consta como em uso
- **THEN** a situação apresentada continua sendo a de manutenção

#### Scenario: Máquina disponível

- **WHEN** a máquina não está em manutenção nem em uso
- **THEN** a situação apresentada é a de disponível

### Requirement: Cadastro de computador vinculado a uma sala ativa

A área SHALL oferecer o cadastro de uma máquina informando sala, número, descrição e endereço físico da placa
de rede. O envio MUST usar `POST /computers/create`.

O sistema MUST oferecer para vínculo apenas salas ativas, porque sala inativa não recebe liberação e a
máquina cadastrada nela nunca chega ao painel. Não havendo nenhuma sala ativa, o sistema MUST explicar o
motivo e MUST NOT permitir o envio.

Concluído o cadastro, o sistema MUST informar o sucesso nomeando a máquina, o endereço gravado e a sala, e
MUST descartar o formulário. A máquina recém-cadastrada MUST passar a constar tanto na listagem desta tela
quanto na grade do painel, sem recarga da página.

**Motivação:** o computador é o objeto que o Desktop conhece. Sem cadastro pela interface, a sala fica com a
grade vazia e não há o que liberar.

#### Scenario: Computador cadastrado

- **WHEN** um administrador informa sala, número, descrição e endereço físico válidos e confirma
- **THEN** a máquina é criada
- **AND** o sistema informa o sucesso nomeando a máquina, o endereço gravado e a sala
- **AND** o formulário é descartado

#### Scenario: Máquina nova disponível nas outras telas

- **WHEN** uma máquina acaba de ser cadastrada
- **THEN** ela passa a constar na listagem e na grade da sala no painel
- **AND** isso acontece sem recarga da página

#### Scenario: Sala inativa não é oferecida

- **WHEN** existe uma sala inativa
- **THEN** ela não aparece entre as salas oferecidas para vínculo

#### Scenario: Nenhuma sala ativa

- **WHEN** não há nenhuma sala ativa cadastrada
- **THEN** o sistema explica que é preciso cadastrar uma sala antes
- **AND** o envio não é permitido

### Requirement: Número livre sugerido ao escolher a sala

O número da máquina é único dentro da sala. Ao escolher ou trocar a sala, o sistema SHALL propor um número
ainda não utilizado naquela sala e MUST apresentar quais números já estão em uso, para que a colisão seja
percebida antes do envio e não pela recusa da API.

A proposta MUST substituir eventual mensagem de erro pendente no campo, para que não reste um aviso de
inválido sobre um valor que o próprio sistema acabou de preencher.

**Motivação:** a recusa por número repetido só chega depois do envio, e o administrador não tem como saber de
cabeça quais números aquela sala já usou.

#### Scenario: Sala escolhida propõe número

- **WHEN** o administrador escolhe uma sala
- **THEN** o campo de número é preenchido com um número ainda não utilizado naquela sala

#### Scenario: Números em uso apresentados

- **WHEN** a sala escolhida já tem máquinas cadastradas
- **THEN** o sistema apresenta os números já em uso naquela sala

#### Scenario: Erro pendente cede à proposta

- **WHEN** o campo de número está com mensagem de erro de um envio anterior
- **AND** o administrador troca a sala
- **THEN** o campo é preenchido com o número proposto
- **AND** a mensagem de erro deixa de ser apresentada

### Requirement: Endereço físico aceito em qualquer separador e gravado num formato só

O endereço físico da placa de rede SHALL ser apresentado ao administrador já agrupado enquanto ele digita, e
o sistema MUST descartar durante a digitação o que não for dígito hexadecimal.

O sistema MUST aceitar o endereço escrito com qualquer dos separadores usuais, ou sem separador algum, e MUST
normalizar todos para o mesmo formato antes do envio — um endereço copiado de um inventário externo não pode
ser recusado por causa do separador.

O sistema MUST recusar, antes do envio, endereço que não tenha exatamente doze dígitos hexadecimais, e a
mensagem MUST dizer o que se espera.

**Motivação:** é pelo endereço físico que o Desktop pede a liberação. Um endereço errado não quebra tela
nenhuma — a estação simplesmente nunca aparece, e o balcão atende uma máquina que, para o sistema, não
existe.

#### Scenario: Agrupamento durante a digitação

- **WHEN** o administrador digita o endereço físico
- **THEN** o valor é apresentado agrupado de dois em dois dígitos

#### Scenario: Caractere não hexadecimal descartado

- **WHEN** o administrador digita um caractere que não é dígito hexadecimal
- **THEN** ele não é incorporado ao campo

#### Scenario: Endereço colado com outro separador

- **WHEN** o administrador informa o endereço com separador diferente do apresentado, ou sem separador
- **THEN** o cadastro é aceito
- **AND** o endereço é enviado no mesmo formato usado para todos os demais

#### Scenario: Endereço incompleto

- **WHEN** o endereço informado não tem doze dígitos hexadecimais
- **THEN** o cadastro é recusado antes do envio
- **AND** a mensagem informa o que se espera

### Requirement: Exclusão de computador confirmada por digitação

A área SHALL oferecer a exclusão de uma máquina. Por não haver inativação para computador — a remoção é
definitiva e leva junto o histórico de sessões e as impressões daquela máquina —, o sistema MUST exigir que o
administrador digite a descrição da máquina para liberar a confirmação, e MUST advertir sobre o que será
apagado junto.

A conferência do texto MUST ignorar diferença de caixa e espaço nas pontas. O sistema MUST descartar o texto
digitado ao fechar, para que o atrito valha em toda reabertura.

Excluída a máquina, o sistema MUST informar o sucesso nomeando a máquina e a sala, e ela MUST deixar de
constar tanto na listagem quanto na grade do painel, sem recarga da página.

**Motivação:** um clique numa linha de tabela é barato demais para uma ação que apaga histórico e não tem
volta.

#### Scenario: Exclusão confirmada

- **WHEN** o administrador digita a descrição da máquina e confirma
- **THEN** a máquina é excluída
- **AND** o sistema informa o sucesso nomeando a máquina e a sala
- **AND** ela deixa de constar na listagem e na grade do painel

#### Scenario: Texto de confirmação não confere

- **WHEN** o texto digitado não corresponde à descrição da máquina
- **THEN** a confirmação permanece indisponível

#### Scenario: Diferença de caixa não atrapalha

- **WHEN** o administrador digita a descrição com caixa diferente ou com espaço nas pontas
- **THEN** a confirmação é liberada

#### Scenario: Reabertura exige digitar de novo

- **WHEN** o administrador fecha o diálogo e o abre novamente
- **THEN** o campo de confirmação está vazio
- **AND** a confirmação permanece indisponível

#### Scenario: Advertência sobre o que é apagado

- **WHEN** o diálogo de exclusão é apresentado
- **THEN** o sistema adverte que o histórico de liberações e as impressões da máquina são apagados junto

### Requirement: Exclusão bloqueada para máquina em uso

O sistema MUST impedir a exclusão de máquina em uso e MUST apresentar o motivo do bloqueio, esclarecendo que
a sessão precisa ser encerrada antes. O bloqueio MUST NOT esconder o motivo de quem navega por teclado ou por
tecnologia assistiva.

**Motivação:** a API recusa a exclusão de máquina em uso justamente para não derrubar a sessão de um advogado
em silêncio. Repetir o bloqueio na tela evita a ida inútil — mas um controle apenas apagado não explica nada.

#### Scenario: Máquina em uso

- **WHEN** a máquina está em uso
- **THEN** a exclusão não pode ser iniciada
- **AND** o sistema apresenta o motivo do bloqueio

### Requirement: Recusa da API explicada e recuperável

Quando a API recusar o cadastro ou a exclusão, o sistema MUST apresentar a explicação vinda dela e MUST
preservar o que foi digitado. No cadastro, o sistema MUST devolver o foco ao campo do endereço físico, que é
a causa mais frequente da recusa. Não havendo explicação utilizável, o sistema MUST apresentar um texto
próprio que não afirme mais do que sabe. Excedido o limite de tentativas, o sistema MUST informar quanto
tempo falta para tentar de novo.

O formulário e o diálogo MUST NOT ser descartados enquanto a requisição estiver em curso, e o sistema MUST
impedir que uma mesma confirmação dispare mais de uma requisição.

#### Scenario: Número já usado na sala

- **WHEN** o número informado já pertence a outra máquina da mesma sala
- **THEN** a explicação da API é apresentada
- **AND** os dados digitados permanecem na tela

#### Scenario: Endereço físico já cadastrado

- **WHEN** o endereço físico informado já pertence a outra máquina
- **THEN** a explicação da API é apresentada
- **AND** o foco volta ao campo do endereço físico

#### Scenario: Falha sem resposta utilizável

- **WHEN** a requisição falha sem resposta interpretável da API
- **THEN** o sistema apresenta um aviso próprio, sem atribuir uma causa que não conhece

#### Scenario: Limite de tentativas atingido

- **WHEN** a API responde que o limite de tentativas foi excedido
- **THEN** o sistema informa quanto tempo falta para tentar novamente

#### Scenario: Fechamento durante a requisição

- **WHEN** o administrador tenta fechar o formulário ou o diálogo com a requisição em curso
- **THEN** ele permanece aberto com os dados preservados

#### Scenario: Confirmação repetida

- **WHEN** o administrador aciona a confirmação mais de uma vez seguidas
- **THEN** apenas uma requisição é enviada
