## ADDED Requirements

### Requirement: Listagem das impressões por escopo do funcionário

O painel SHALL apresentar em `/printers` o histórico do que foi enviado para impressão, ordenado da
impressão mais recente para a mais antiga. Cada linha MUST identificar o advogado, a sala, o computador de
origem e o momento da impressão.

O escopo do que é apresentado MUST ser o que a API resolve para o funcionário autenticado — todas as salas
para `ADMIN`, apenas as salas vinculadas para `MEMBER`. A tela MUST NOT reimplementar essa regra no
cliente: uma segunda fonte de verdade envelheceria sozinha e, sendo cliente, não protegeria nada.

**Motivação:** o advogado envia o arquivo da estação e volta ao guichê pedindo a impressão. Sem esta tela,
quem atende não tem onde olhar.

#### Scenario: Funcionário com salas vinculadas

- **WHEN** um funcionário `MEMBER` abre a tela de impressões
- **THEN** a lista apresenta apenas impressões das salas em que ele está vinculado
- **AND** o seletor de sala oferece apenas essas salas

#### Scenario: Funcionário administrador

- **WHEN** um funcionário `ADMIN` abre a tela de impressões
- **THEN** a lista apresenta as impressões de todas as salas
- **AND** o seletor de sala oferece todas as salas ativas

#### Scenario: Ordem da lista

- **WHEN** a lista é apresentada
- **THEN** a impressão mais recente aparece primeiro

### Requirement: Aviso do expurgo semanal e do escopo

A tela SHALL informar, antes da lista, que os arquivos enviados para impressão são apagados semanalmente,
com o momento do expurgo explícito, e que o funcionário enxerga apenas as salas em que está vinculado.

**Motivação:** as duas coisas mudam o significado da lista e nenhuma se deduz olhando para ela. Sem o
aviso, o balcão descobriria o expurgo no dia em que precisasse de um arquivo que já não existe, e uma lista
curta seria lida como "houve poucas impressões" em vez de "este é o seu recorte".

#### Scenario: Aviso presente

- **WHEN** a tela de impressões é apresentada
- **THEN** o dia e o horário do expurgo semanal são apresentados em destaque
- **AND** é dito que a lista mostra apenas o que foi impresso desde a última limpeza
- **AND** é dito que o funcionário enxerga as salas em que está vinculado

### Requirement: Filtro por sala refletido no endereço

A sala escolhida SHALL ser refletida no endereço da página, de modo que recarregar ou compartilhar o
endereço volte à mesma sala. A opção "todas as salas" MUST corresponder à ausência do parâmetro, e não a um
valor próprio no endereço.

Um parâmetro de sala que não corresponda a uma sala visível para aquele funcionário — inexistente, inativa
ou fora do escopo — MUST recair em "todas as salas". A tela MUST NOT ficar vazia por causa de um parâmetro
envelhecido.

A troca de sala MUST NOT reposicionar a rolagem da página.

#### Scenario: Sala escolhida

- **WHEN** o usuário escolhe uma sala no seletor
- **THEN** o endereço passa a conter o identificador dessa sala
- **AND** a lista passa a apresentar apenas as impressões dessa sala
- **AND** a página não é reposicionada

#### Scenario: Todas as salas

- **WHEN** o usuário escolhe "todas as salas"
- **THEN** o parâmetro de sala é removido do endereço
- **AND** a lista apresenta todas as impressões que o funcionário pode ver

#### Scenario: Endereço com sala inválida

- **WHEN** a tela é aberta com um parâmetro de sala inexistente ou fora do escopo do funcionário
- **THEN** o seletor apresenta "todas as salas"
- **AND** a lista apresenta todas as impressões que o funcionário pode ver

### Requirement: Filtros de período e busca sobre o resultado carregado

A tela SHALL oferecer um filtro de período com as opções "todo o período", "hoje", "ontem" e "últimos 7
dias", e uma busca por texto que alcance o nome do advogado, a descrição do computador e o nome da sala.

Período e busca MUST NOT ser refletidos no endereço: eles apenas estreitam o que já foi carregado, ao
contrário da sala, que decide o que é carregado.

O recorte de período MUST ser calculado no fuso horário da Seccional, e não no do navegador de quem olha. A
janela de "últimos 7 dias" MUST incluir o dia corrente.

#### Scenario: Período restringe a lista

- **WHEN** o usuário escolhe "hoje" no filtro de período
- **THEN** apenas as impressões do dia corrente permanecem na lista
- **AND** o endereço da página não muda

#### Scenario: Busca por texto

- **WHEN** o usuário digita um trecho do nome de um advogado, de um computador ou de uma sala
- **THEN** apenas as linhas que contêm esse trecho em algum desses campos permanecem
- **AND** a comparação ignora maiúsculas e minúsculas

#### Scenario: Impressão perto da virada do dia

- **WHEN** uma impressão é registrada no fim da noite no horário da Seccional
- **AND** a tela é aberta por alguém com o navegador em outro fuso
- **THEN** a impressão é contada no dia em que ocorreu no balcão

### Requirement: Contagem do resultado

A tela SHALL apresentar quantas impressões o recorte atual contém, com o período escolhido dito por
extenso. Quando algum filtro estiver escondendo linhas, o total carregado MUST ser apresentado ao lado.

A contagem MUST NOT ser apresentada enquanto a lista não tiver chegado — um zero é uma afirmação sobre o
resultado, não uma espera.

#### Scenario: Recorte sem filtros

- **WHEN** nenhum filtro está estreitando a lista
- **THEN** a contagem apresenta o número de impressões carregadas
- **AND** nenhum total adicional é apresentado

#### Scenario: Recorte filtrado

- **WHEN** um filtro está escondendo parte das linhas
- **THEN** a contagem apresenta o número de linhas visíveis
- **AND** o total carregado é apresentado ao lado

#### Scenario: Lista ainda carregando

- **WHEN** a consulta das impressões está em andamento
- **THEN** nenhum número é apresentado no lugar da contagem

### Requirement: Acesso ao arquivo impresso

Cada linha SHALL oferecer o acesso ao arquivo correspondente. O acesso MUST ser apresentado como link que
abre o arquivo em nova aba, e MUST NOT ser apresentado como download: o arquivo é servido por outro domínio,
onde o navegador ignora a instrução de baixar.

O controle MUST ter rótulo acessível que identifique de qual linha ele é, começando pela ação.

**Motivação:** prometer "baixar" e abrir uma aba é uma promessa quebrada a cada clique. Sendo link de
verdade, o controle ainda ganha menu de contexto, abertura em nova janela e presença na lista de links da
página.

#### Scenario: Abrir o arquivo

- **WHEN** o usuário aciona o controle de uma linha
- **THEN** o arquivo daquela impressão é aberto em nova aba

#### Scenario: Rótulo acessível

- **WHEN** a lista é percorrida por leitor de tela
- **THEN** cada controle anuncia a ação e o advogado da linha correspondente

### Requirement: Estados de carregamento, erro e lista vazia

Enquanto as salas não tiverem chegado, a tela SHALL apresentar a área de filtros em esqueleto: são as salas
que determinam qual sala está selecionada, e apresentar o seletor antes disso o faria mostrar uma escolha
para trocá-la um instante depois. A espera pelas impressões MUST ser apresentada dentro da própria lista,
sem deslocar o restante do layout.

Falhando o carregamento das impressões, a tela MUST apresentar mensagem no lugar da lista.

Falhando o carregamento das salas, a lista MUST continuar sendo apresentada — sem sala a API já devolve
tudo o que o funcionário pode ver — e a tela MUST avisar que o filtro por sala está indisponível. Um
seletor vazio sem explicação é pior que a falha.

A lista vazia MUST distinguir suas causas — não há nada registrado, a busca não encontrou, ou o período não
alcança — porque cada uma pede uma saída diferente de quem está olhando.

#### Scenario: Salas ainda carregando

- **WHEN** a tela é aberta e as salas ainda não chegaram
- **THEN** os filtros são apresentados como esqueleto
- **AND** a lista é apresentada como esqueleto

#### Scenario: Falha ao carregar as impressões

- **WHEN** a consulta das impressões falha
- **THEN** uma mensagem ocupa o lugar da lista, orientando a tentar novamente mais tarde

#### Scenario: Falha ao carregar as salas

- **WHEN** a consulta das salas falha
- **THEN** a lista continua apresentando todas as impressões que o funcionário pode ver
- **AND** um aviso informa que o filtro por sala está indisponível

#### Scenario: Nada registrado

- **WHEN** não há impressão alguma no recorte do funcionário
- **THEN** a mensagem explica que as impressões enviadas pelas estações aparecerão ali
- **AND** menciona o expurgo semanal

#### Scenario: Busca sem resultado

- **WHEN** há impressões carregadas mas nenhuma corresponde à busca
- **THEN** a mensagem informa quantas impressões existem e orienta a ajustar o texto

#### Scenario: Período sem alcance

- **WHEN** há impressões carregadas mas nenhuma dentro do período escolhido
- **THEN** a mensagem nomeia o período e orienta a ampliá-lo
- **AND** se houver busca ativa, orienta também a limpá-la
