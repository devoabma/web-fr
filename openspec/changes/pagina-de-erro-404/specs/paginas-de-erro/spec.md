## ADDED Requirements

### Requirement: Página de rota não encontrada

O sistema SHALL responder a qualquer endereço que não corresponda a uma rota conhecida com uma página na
identidade visual do Sala Livre, em português, contendo o código do erro, uma explicação do que aconteceu e
caminhos de retorno. A página MUST reaproveitar o cabeçalho e o rodapé da aplicação e MUST ser renderizada
como Server Component, com JavaScript de cliente restrito ao controle de retorno pelo histórico.

#### Scenario: Visitante acessa endereço inexistente

- **WHEN** um visitante acessa um endereço que não corresponde a nenhuma rota
- **THEN** a página de erro é exibida com a marca do produto, o código 404 e a explicação do erro
- **AND** o cabeçalho e o rodapé são os mesmos das demais páginas públicas

#### Scenario: Conteúdo pré-renderizado

- **WHEN** a aplicação é construída para produção
- **THEN** a página de erro é gerada como conteúdo estático

### Requirement: Caminhos de retorno a partir do erro

A página SHALL oferecer duas saídas: uma navegação para a área principal do produto e um retorno à página
anterior. A navegação principal MUST usar link, preservando o comportamento nativo do navegador. O retorno
à página anterior MUST funcionar mesmo quando não existe histórico de navegação, levando o usuário a um
destino alternativo em vez de não fazer nada.

#### Scenario: Retorno com histórico disponível

- **WHEN** o usuário chegou à página de erro navegando dentro do produto e aciona o retorno
- **THEN** o navegador volta para a página anterior

#### Scenario: Retorno sem histórico

- **WHEN** o usuário abriu o endereço inválido diretamente, sem histórico na aba, e aciona o retorno
- **THEN** ele é levado ao destino alternativo definido para a página, em vez de permanecer parado

#### Scenario: Navegação principal

- **WHEN** o usuário aciona a chamada principal da página de erro
- **THEN** ele é levado à entrada do painel por meio de link, podendo abrir em nova aba ou copiar o endereço

### Requirement: Rodapé ao fim da viewport em telas estreitas

Em viewports estreitas, quando o conteúdo da página de erro for menor que a altura da tela, o rodapé SHALL
ficar posicionado ao fim da viewport, sem espaço vazio abaixo dele. Em viewports maiores o layout MUST
permanecer idêntico ao das demais páginas públicas, com cabeçalho e rodapé ocupando a largura máxima
definida para o conteúdo.

#### Scenario: Celular com conteúdo curto

- **WHEN** a página é exibida em viewport menor que 640px
- **THEN** o rodapé aparece encostado no fim da tela
- **AND** o conteúdo principal fica centralizado verticalmente no espaço restante

#### Scenario: Desktop

- **WHEN** a página é exibida em viewport de 640px ou mais
- **THEN** cabeçalho e rodapé ocupam a mesma largura das demais páginas públicas, sem encolher para o
  tamanho do próprio conteúdo
