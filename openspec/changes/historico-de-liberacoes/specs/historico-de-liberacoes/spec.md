## ADDED Requirements

### Requirement: Listagem das liberações por escopo do funcionário

O painel SHALL apresentar em `/releases` o histórico das sessões de liberação, da mais recente para a
mais antiga, incluindo as que ainda estão em andamento. Cada linha MUST identificar o advogado, a sala,
o computador, o momento da liberação, a duração e o desfecho da sessão.

O escopo MUST ser o que a API resolve para o funcionário autenticado — todas as salas para `ADMIN`,
apenas as vinculadas para `MEMBER`. A tela MUST NOT reimplementar essa regra no cliente.

**Motivação:** o painel de operação responde o agora; nada respondia o depois. Saber se uma sessão
terminou por tempo ou por intervenção do balcão exigia acesso ao banco.

#### Scenario: Funcionário com salas vinculadas

- **WHEN** um funcionário `MEMBER` abre a tela de liberações
- **THEN** a lista apresenta apenas sessões das salas em que ele está vinculado

#### Scenario: Funcionário administrador

- **WHEN** um funcionário `ADMIN` abre a tela de liberações
- **THEN** a lista apresenta as sessões de todas as salas

#### Scenario: Ordem da lista

- **WHEN** a lista é apresentada
- **THEN** a liberação mais recente aparece primeiro

### Requirement: Desfecho da sessão

Cada liberação SHALL ser classificada em um de três desfechos: em andamento, tempo esgotado, ou
encerrada antes do tempo.

Uma sessão sem data de término MUST ser apresentada como em andamento. Uma sessão terminada que
consumiu a cota da sala MUST ser apresentada como tempo esgotado. Uma sessão terminada que não consumiu
a cota MUST ser apresentada como encerrada antes do tempo.

Uma sessão em andamento cuja cota chegue a zero na tela MUST continuar sendo apresentada como em
andamento: o encerramento é da API, e antecipá-lo mostraria como fechada uma sessão em que ainda há
alguém na máquina.

**Motivação:** separar o fluxo normal — a sessão que acabou sozinha — da exceção em que alguém
interveio é o que se procura num histórico.

#### Scenario: Sessão aberta

- **WHEN** uma sessão sem data de término é apresentada
- **THEN** o desfecho apresentado é "em andamento"

#### Scenario: Sessão que consumiu a cota

- **WHEN** uma sessão terminada que consumiu a cota da sala é apresentada
- **THEN** o desfecho apresentado é "tempo esgotado"

#### Scenario: Sessão encerrada pelo balcão

- **WHEN** uma sessão terminada que não consumiu a cota é apresentada
- **THEN** o desfecho apresentado é "encerrada"

#### Scenario: Cota zerada com a sessão ainda aberta

- **WHEN** a cota de uma sessão em andamento chega a zero na tela
- **THEN** ela continua sendo apresentada como em andamento

### Requirement: Duração das sessões em andamento

A duração das sessões em andamento SHALL avançar na tela sem depender de nova consulta à API, a partir
do tempo decorrido desde a resposta recebida.

A duração das sessões já terminadas MUST NOT ser alterada: o valor congelou junto com a sessão.

**Motivação:** o cálculo é do servidor e nasce defasado. Uma duração parada numa sessão em curso é uma
informação errada que piora a cada minuto; consultar a API a cada minuto para corrigi-la é desperdício.

#### Scenario: Sessão aberta com a tela parada

- **WHEN** a tela permanece aberta com uma sessão em andamento na lista
- **THEN** a duração apresentada para essa sessão avança

#### Scenario: Sessão terminada

- **WHEN** a tela permanece aberta com uma sessão terminada na lista
- **THEN** a duração apresentada para essa sessão não muda

### Requirement: Filtro por sala refletido no endereço

A sala escolhida SHALL ser refletida no endereço da página. A opção "todas as salas" MUST corresponder
à ausência do parâmetro.

Um parâmetro de sala que não corresponda a uma sala visível para o funcionário MUST recair em "todas as
salas". A troca de sala MUST NOT reposicionar a rolagem.

Salas inativas MUST continuar disponíveis no filtro: a sala saiu de operação, mas as sessões que
ocorreram nela continuam sendo registro.

#### Scenario: Sala escolhida

- **WHEN** o usuário escolhe uma sala no filtro
- **THEN** o endereço passa a conter o identificador dessa sala
- **AND** a lista passa a apresentar apenas as liberações dessa sala

#### Scenario: Endereço com sala inválida

- **WHEN** a tela é aberta com um parâmetro de sala inexistente ou fora do escopo
- **THEN** o filtro apresenta "todas as salas"
- **AND** a lista apresenta tudo o que o funcionário pode ver

#### Scenario: Sala inativa

- **WHEN** existe uma sala inativa visível ao funcionário
- **THEN** ela continua sendo oferecida no filtro por sala

### Requirement: Filtros de período, situação e busca sobre o resultado carregado

A tela SHALL oferecer filtro de período, filtro por desfecho da sessão, e busca por texto que alcance o
nome do advogado, a descrição do computador e o nome da sala.

Período, situação e busca MUST NOT ser refletidos no endereço: eles apenas estreitam o que já foi
carregado, ao contrário da sala, que decide o que é carregado.

O recorte de período MUST ser calculado no fuso da Seccional.

#### Scenario: Situação restringe a lista

- **WHEN** o usuário escolhe um desfecho no filtro de situação
- **THEN** apenas as liberações com esse desfecho permanecem na lista
- **AND** o endereço da página não muda

#### Scenario: Busca por texto

- **WHEN** o usuário digita um trecho do nome de um advogado, de um computador ou de uma sala
- **THEN** apenas as linhas que contêm esse trecho em algum desses campos permanecem
- **AND** a comparação ignora maiúsculas e minúsculas

### Requirement: Contagem por desfecho independente do filtro de situação

A tela SHALL apresentar, junto da toolbar, quantas liberações há em cada desfecho.

Essa contagem MUST considerar o recorte de período e de busca, e MUST NOT considerar o filtro de
situação — do contrário, escolher um desfecho zeraria os demais e a contagem deixaria de informar.

A contagem MUST NOT ser apresentada enquanto a lista não tiver chegado.

#### Scenario: Contagem com situação filtrada

- **WHEN** o usuário escolhe um desfecho no filtro de situação
- **THEN** as contagens dos outros desfechos continuam sendo apresentadas com seus valores

#### Scenario: Contagem com período filtrado

- **WHEN** o usuário restringe o período
- **THEN** as contagens por desfecho passam a refletir apenas esse período

#### Scenario: Lista ainda carregando

- **WHEN** a consulta das liberações está em andamento
- **THEN** nenhum número é apresentado no lugar das contagens

### Requirement: Tela de registro, sem ações sobre a sessão

A tela SHALL ser somente leitura. Ela MUST NOT oferecer encerrar sessão, liberar computador ou
qualquer outra operação sobre as máquinas.

A tela MUST informar que liberar e encerrar são feitos no painel de operação.

**Motivação:** uma segunda tela capaz de encerrar sessão é um caminho a mais para o clique errado sobre
um advogado que está usando a máquina naquele momento.

#### Scenario: Linha em andamento

- **WHEN** uma liberação em andamento é apresentada
- **THEN** nenhuma ação de encerramento é oferecida na linha

#### Scenario: Aviso da tela

- **WHEN** a tela é apresentada
- **THEN** é informado que a tela é registro e que a operação acontece no painel

### Requirement: Estados de carregamento, erro e lista vazia

Enquanto as salas não tiverem chegado, a tela SHALL apresentar a toolbar em esqueleto. A espera pelas
liberações MUST ser apresentada dentro da própria tabela.

Falhando o carregamento das liberações, a tela MUST apresentar mensagem no lugar da tabela.

Falhando o carregamento das salas, a lista MUST continuar sendo apresentada e a tela MUST avisar que o
filtro por sala está indisponível.

A lista vazia MUST distinguir suas causas — nada registrado, busca sem resultado, período sem alcance,
desfecho ausente no recorte. Quando o desfecho escolhido for a causa, a mensagem MUST apontar o filtro
de situação, e não os demais: ele é o mais estreito, e orientar a ampliar o período mandaria o usuário
ao controle errado.

#### Scenario: Salas ainda carregando

- **WHEN** a tela é aberta e as salas ainda não chegaram
- **THEN** a toolbar é apresentada como esqueleto
- **AND** a tabela é apresentada como esqueleto

#### Scenario: Falha ao carregar as liberações

- **WHEN** a consulta das liberações falha
- **THEN** uma mensagem ocupa o lugar da tabela

#### Scenario: Falha ao carregar as salas

- **WHEN** a consulta das salas falha
- **THEN** a lista continua apresentando tudo o que o funcionário pode ver
- **AND** um aviso informa que o filtro por sala está indisponível

#### Scenario: Nada registrado

- **WHEN** não há liberação alguma no recorte do funcionário
- **THEN** a mensagem explica que toda sessão aberta no painel passa a aparecer ali

#### Scenario: Situação sem resultado

- **WHEN** há liberações no recorte de período e busca, mas nenhuma com o desfecho escolhido
- **THEN** a mensagem nomeia o desfecho escolhido
- **AND** orienta a escolher "todas as situações", informando quantas linhas isso traria
