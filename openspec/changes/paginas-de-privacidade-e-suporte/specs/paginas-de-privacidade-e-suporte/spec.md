## ADDED Requirements

### Requirement: Páginas públicas de texto

O painel SHALL oferecer `/privacy` e `/support` alcançáveis **sem sessão**. As duas MUST constar de
`PUBLIC_ROUTES` e MUST ser servidas estaticamente — nenhuma delas lê cookie nem chama a `api-fr`.

Os caminhos MUST seguir a convenção do repositório: **URL em inglês, rótulo em português**.

**Motivação:** o `proxy.ts` nega por padrão. Uma página de privacidade fora de `PUBLIC_ROUTES` não dá
404 — manda o visitante para o login, que é a resposta mais confusa possível para quem estava
justamente tentando descobrir o que o produto faz com os dados dele.

#### Scenario: Visitante sem sessão abre a política

- **WHEN** alguém sem cookie de sessão acessa `/privacy`
- **THEN** a página é servida normalmente, sem redirecionamento para o login

#### Scenario: Cookie de sessão inválido

- **WHEN** o visitante chega com cookie expirado ou corrompido
- **THEN** a página é servida assim mesmo, e o cookie inútil é descartado na resposta

### Requirement: Rodapé só aponta para páginas que existem

Todo link do rodapé MUST corresponder a uma rota com página publicada e listada em `PUBLIC_ROUTES`.

Um destino sem página MUST ser removido do rodapé **e** de `PUBLIC_ROUTES` — não basta tirar o link.

**Motivação:** os três links do rodapé (`/privacy`, `/support`, `/status`) apontavam para rotas
públicas sem página, e todas caíam em 404. Deixar o caminho na lista de rotas públicas mantém a 404
alcançável por quem digitar o endereço.

#### Scenario: Destino sem página construída

- **WHEN** um destino previsto no rodapé não tem página
- **THEN** ele não aparece no rodapé e não consta de `PUBLIC_ROUTES`

### Requirement: Política de privacidade descreve os dados reais

A política MUST descrever os dados pessoais que o Sala Livre efetivamente persiste, separados por
ator: **usuário atendido**, **administrador ou funcionário autorizado** e **equipamento**.

A política MUST informar que os dados apresentados na liberação são **conferidos contra bases ou
sistemas externos integrados**, e MUST tratar os **arquivos enviados para impressão** como dado
pessoal de retenção temporária.

A política MUST citar a Lei nº 13.709/2018 ao enumerar os direitos do titular, e MUST carregar a data
da última atualização.

A política MUST NOT descrever tratamento que o produto não realiza.

**Motivação:** o produto trata CPF, data de nascimento, inscrição na OAB, situação cadastral e o
histórico de qual pessoa usou qual máquina e por quanto tempo. Uma política genérica, que fala de
"cookies e dados de navegação", descreveria um produto diferente deste — e o titular não teria como
saber o que perguntar.

#### Scenario: Titular procura o que é guardado sobre ele

- **WHEN** o titular abre `/privacy` e procura a seção de dados tratados
- **THEN** encontra a lista por ator, incluindo os registros de sessão (sala, computador, início e
  fim) e os arquivos de impressão

#### Scenario: Política sem data

- **WHEN** o texto da política é alterado
- **THEN** a data de última atualização exibida na página acompanha a alteração

### Requirement: Canal de atendimento único e destacado

As duas páginas MUST apresentar o mesmo endereço de atendimento, vindo de **uma única constante**, e
MUST apresentá-lo em bloco próprio — não diluído no corpo do texto.

**Motivação:** o endereço aparece nas duas páginas, e divergir é pior do que não ter: o titular
escreve para uma caixa que ninguém lê e conclui que foi ignorado. O destaque existe porque o contato
é a única ação concreta destas páginas, e a LGPD espera que o titular o encontre sem ler o documento
inteiro.

#### Scenario: Endereço de atendimento muda

- **WHEN** o canal de atendimento é alterado
- **THEN** basta alterar a constante, e as duas páginas passam a exibir o novo endereço

### Requirement: Suporte organizado pela situação vista na tela

O guia de suporte MUST organizar os problemas de liberação pelo **que a pessoa está vendo**, com uma
subseção por recusa devolvida pela `api-fr`, e MUST descrever como configurável por ambiente aquilo
que varia entre instalações — cota, tempo de sessão e condições extras de acesso.

O guia MUST listar o que informar ao abrir um chamado, e MUST avisar que o suporte não pede senha.

O guia MUST NOT cravar números de cota ou de tempo de sessão.

**Motivação:** quem abre a página de suporte está olhando para uma mensagem de erro, não procurando
um módulo do sistema. E números cravados estariam errados na próxima seccional, porque cada ambiente
configura os seus.

#### Scenario: Funcionário busca uma recusa específica

- **WHEN** o advogado recebe "já existe uma sessão ativa" e o funcionário abre `/support`
- **THEN** encontra uma subseção com esse título, explicando a regra de sessão única e o que fazer

#### Scenario: Abertura de chamado

- **WHEN** o funcionário precisa acionar o suporte
- **THEN** a página informa o que enviar junto: nome, sala, identificação do computador, data e hora,
  mensagem de erro e o que estava sendo feito

### Requirement: Preview da landing é o produto real

A seção de preview do painel na landing MUST exibir uma imagem do painel real, e MUST NOT reconstruir
a interface do painel em JSX com dados fictícios.

A imagem MUST ser marcada como `priority` e MUST declarar `sizes`.

A imagem MUST NOT declarar um `quality` ausente de `images.qualities` no `next.config.ts`.

**Motivação:** o mockup em JSX eram 144 linhas de interface falsa que envelheciam a cada mudança no
painel de verdade, sem nenhum teste para avisar. E, no Next 16, um `quality` fora de `images.qualities`
é coagido em silêncio para o valor mais próximo — o código pedia 100 e o build entregava 75, o que é
pior do que não declarar nada.

#### Scenario: Painel real muda de layout

- **WHEN** a interface do painel é alterada
- **THEN** atualizar a landing é substituir a imagem, não reescrever JSX de imitação
