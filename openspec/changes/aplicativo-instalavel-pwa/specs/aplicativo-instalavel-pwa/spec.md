## ADDED Requirements

### Requirement: Instalação como aplicativo no dispositivo

O painel SHALL declarar-se instalável, de modo que o navegador ofereça adicioná-lo à tela de início do
aparelho.

Uma vez instalado, o painel MUST abrir em tela cheia, sem a barra de endereço do navegador, e MUST abrir
diretamente na área operacional — não na página institucional.

**Motivação:** quem coordena a Seccional acompanha as salas do celular. Abrir o navegador, achar a aba e
digitar o endereço é atrito repetido várias vezes por dia; o aplicativo instalado troca isso por um toque.

#### Scenario: Instalação a partir do navegador

- **WHEN** o painel é aberto num aparelho compatível, em conexão segura
- **THEN** o navegador oferece a instalação do aplicativo

#### Scenario: Abertura do aplicativo instalado

- **WHEN** o usuário toca no ícone do aplicativo na tela de início
- **THEN** o painel abre em tela cheia, sem barra de endereço
- **AND** apresenta a área operacional, ou o login quando não houver sessão válida

#### Scenario: Login a partir do aplicativo

- **WHEN** o aplicativo é aberto sem sessão e o usuário se autentica
- **THEN** ele é levado à área operacional, sem passar pela página institucional

### Requirement: Identidade visual do aplicativo instalado

O ícone do aplicativo SHALL apresentar a marca do Sala Livre sobre fundo sólido da identidade do produto,
e MUST permanecer legível em qualquer formato de recorte aplicado pelo sistema.

O aplicativo MUST fornecer variação própria de ícone para sistemas que recortam o ícone e para sistemas
que não respeitam transparência.

**Motivação:** a marca é um traço fino. Sobre papel de parede claro ou fotográfico ela desapareceria sem
fundo sólido, e um único desenho redimensionado seria raspado nos recortes circulares dos launchers ou
apareceria com fundo preto no iPhone.

#### Scenario: Launcher que recorta o ícone

- **WHEN** o sistema exibe o ícone em formato circular ou arredondado
- **THEN** a marca aparece inteira e centralizada, sem partes cortadas

#### Scenario: Sistema que ignora transparência

- **WHEN** o ícone é exibido em um sistema que não respeita fundo transparente
- **THEN** ele aparece com o fundo sólido da identidade, nunca sobre preto

### Requirement: Resposta visível à ausência de conexão

Quando o aparelho estiver sem rede e o usuário tentar navegar, o painel SHALL apresentar uma tela própria,
identificada com a marca, explicando a ausência de conexão e oferecendo nova tentativa.

Essa tela MUST ser exibível sem qualquer acesso à rede.

**Motivação:** num aplicativo instalado, a tela de erro do navegador não é lida como "a internet caiu",
e sim como "o aplicativo quebrou" — a suspeita cai no produto em vez de cair na rede.

#### Scenario: Navegação sem rede

- **WHEN** o usuário abre o aplicativo ou navega entre telas com o aparelho sem conexão
- **THEN** é apresentada a tela de ausência de conexão do próprio produto

#### Scenario: Retorno da conexão

- **WHEN** a rede volta e o usuário pede nova tentativa
- **THEN** o painel carrega normalmente

### Requirement: Nenhum dado de sessão em cache local

O painel MUST NOT armazenar em cache do navegador telas renderizadas com dados de sessão nem respostas da
API.

O armazenamento local SHALL ficar restrito a arquivos estáticos versionados por conteúdo e aos elementos
da marca. Toda navegação MUST ser atendida pela rede, e a falha MUST resultar na tela de ausência de
conexão — nunca em uma tela do painel guardada anteriormente.

**Motivação:** o aparelho do balcão é compartilhado entre turnos, e o encerramento de sessão apaga
credenciais, não caches do navegador. Uma tela do painel guardada localmente sobreviveria ao logout e
seria exibida ao usuário seguinte, com os dados de quem estava antes.

#### Scenario: Troca de usuário no mesmo aparelho

- **WHEN** um usuário encerra a sessão e outro abre o aplicativo no mesmo aparelho
- **THEN** nenhuma tela ou dado do usuário anterior é apresentado

#### Scenario: Falha de rede durante a navegação

- **WHEN** a navegação falha por ausência de rede
- **THEN** é apresentada a tela de ausência de conexão
- **AND** não é apresentada uma versão anterior da tela solicitada

#### Scenario: Ação de escrita sem rede

- **WHEN** o usuário executa uma ação que altera dados e a rede está indisponível
- **THEN** a ação falha de forma visível
- **AND** não é atendida a partir de armazenamento local

### Requirement: Ausência de efeito em desenvolvimento

O mecanismo de instalação MUST permanecer inativo fora do ambiente de produção, e MUST remover registro
remanescente encontrado no ambiente de desenvolvimento.

**Motivação:** um worker deixado por um build de produção executado localmente continua servindo arquivos
antigos por cima do servidor de desenvolvimento. A tela quebra sem nenhum erro no terminal, e o diagnóstico
é demorado justamente por não haver sinal.

#### Scenario: Desenvolvimento após execução de build local

- **WHEN** o painel é aberto em desenvolvimento e existe registro remanescente de execução anterior
- **THEN** o registro é removido
- **AND** os arquivos passam a vir do servidor de desenvolvimento
