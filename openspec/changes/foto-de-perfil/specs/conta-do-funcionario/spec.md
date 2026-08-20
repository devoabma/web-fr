## ADDED Requirements

### Requirement: O funcionário troca a própria foto de perfil

O painel SHALL permitir que o funcionário autenticado substitua a própria imagem de perfil a partir da área
de conta, sem depender de administrador. O ponto de acesso à troca MUST ser a própria imagem apresentada na
área de conta, indicando por dica de ferramenta a ação disponível.

O acionamento MUST ser possível por teclado, e a indicação visual da ação MUST aparecer tanto sob o ponteiro
quanto sob o foco de teclado.

**Motivação:** a imagem nascia como iniciais do nome e não havia como alterá-la pelo painel, embora a API
aceite a troca pelo próprio funcionário. O avatar era o maior elemento da tela sem função nenhuma — e é
onde a mão vai primeiro.

#### Scenario: Acesso à troca pela imagem

- **WHEN** o ponteiro repousa sobre a imagem de perfil na área de conta
- **THEN** o sistema indica que a imagem pode ser atualizada
- **AND** o acionamento apresenta o formulário de envio

#### Scenario: Acesso por teclado

- **WHEN** o funcionário alcança a imagem de perfil pela navegação por teclado
- **THEN** a indicação da ação disponível é apresentada
- **AND** o acionamento pelo teclado apresenta o formulário de envio

#### Scenario: Troca bem-sucedida

- **WHEN** o funcionário envia uma imagem válida
- **THEN** a imagem de perfil é substituída
- **AND** o sistema confirma a troca
- **AND** o formulário é encerrado

#### Scenario: Falha de comunicação

- **WHEN** a requisição de envio não obtém resposta da API
- **THEN** o sistema informa a falha em termos de conexão
- **AND** não afirma que a imagem foi alterada

#### Scenario: Excesso de tentativas

- **WHEN** a API recusa o envio por excesso de tentativas
- **THEN** o sistema informa quanto tempo falta para tentar de novo
- **AND** não repete a requisição automaticamente

#### Scenario: Fechamento durante o envio

- **WHEN** o funcionário tenta encerrar o formulário enquanto o envio está em andamento
- **THEN** o formulário permanece aberto com o arquivo selecionado até a conclusão da chamada

#### Scenario: Reabertura do formulário

- **WHEN** o funcionário encerra o formulário e o abre novamente
- **THEN** nenhuma imagem está selecionada
- **AND** a pré-visualização volta a apresentar a imagem de perfil corrente

### Requirement: A imagem é conferida antes do envio

O formulário de troca de imagem SHALL apresentar a imagem escolhida no mesmo formato em que ela será
exibida no perfil, antes de qualquer requisição, acompanhada do nome e do tamanho do arquivo. O formulário
MUST permitir descartar a escolha e MUST NOT oferecer o envio enquanto nenhuma imagem estiver selecionada.

**Motivação:** o avatar é recortado como quadrado na exibição. Sem ver o enquadramento final antes de
enviar, o funcionário descobriria o corte só depois da troca — e não há como desfazer.

#### Scenario: Conferência da imagem escolhida

- **WHEN** o funcionário escolhe uma imagem válida
- **THEN** a imagem é apresentada no enquadramento final do perfil
- **AND** o nome e o tamanho do arquivo são apresentados

#### Scenario: Descarte da escolha

- **WHEN** o funcionário descarta a imagem escolhida
- **THEN** a pré-visualização volta a apresentar a imagem de perfil corrente
- **AND** o envio deixa de ser oferecido

#### Scenario: Nenhuma imagem selecionada

- **WHEN** o formulário é apresentado sem imagem escolhida
- **THEN** o sistema informa que nenhuma imagem está selecionada
- **AND** o envio não é oferecido

#### Scenario: Troca da imagem escolhida

- **WHEN** o funcionário escolhe outra imagem antes de enviar
- **THEN** a pré-visualização passa a apresentar a nova escolha

#### Scenario: Reescolha do mesmo arquivo

- **WHEN** o funcionário descarta a escolha e seleciona o mesmo arquivo novamente
- **THEN** a pré-visualização é apresentada normalmente

### Requirement: Arquivo inválido é recusado antes do envio

O sistema SHALL recusar, antes de qualquer requisição, arquivo fora dos formatos aceitos pela API, arquivo
vazio e arquivo acima do limite de tamanho aceito pela API. Cada recusa MUST ser explicada em texto, e o
arquivo recusado MUST NOT permanecer selecionado.

O formulário MUST informar os formatos aceitos e o limite de tamanho antes da escolha do arquivo.

**Motivação:** o filtro de formatos da janela do sistema é apenas uma sugestão e pode ser contornado pelo
próprio usuário. Sem recusa local, o erro só apareceria depois de subir o arquivo inteiro — caro na rede da
sala e confuso para quem espera.

#### Scenario: Formato não aceito

- **WHEN** o funcionário escolhe um arquivo fora dos formatos aceitos
- **THEN** o sistema explica que o formato não é suportado e quais são aceitos
- **AND** nenhuma requisição é enviada
- **AND** o arquivo não permanece selecionado

#### Scenario: Arquivo acima do limite

- **WHEN** o funcionário escolhe uma imagem acima do limite de tamanho
- **THEN** o sistema informa o limite permitido
- **AND** nenhuma requisição é enviada
- **AND** o arquivo não permanece selecionado

#### Scenario: Arquivo vazio

- **WHEN** o funcionário escolhe um arquivo sem conteúdo
- **THEN** o sistema informa a recusa
- **AND** nenhuma requisição é enviada

#### Scenario: Regras visíveis antes da escolha

- **WHEN** o formulário de troca de imagem é apresentado
- **THEN** os formatos aceitos e o limite de tamanho são informados

### Requirement: A imagem nova aparece imediatamente em todo o painel

Concluída a troca, o sistema SHALL apresentar a imagem nova na área de conta e no menu do usuário sem
recarregar a página e sem nova consulta ao cadastro. O sistema MUST NOT oferecer o envio novamente enquanto
a troca corrente não estiver concluída, de modo que um segundo acionamento não gere um segundo envio do
mesmo arquivo.

**Motivação:** a imagem é lida por uma única consulta compartilhada entre a área de conta e o menu. Como a
API já devolve o endereço da imagem nova, uma consulta adicional só atrasaria a atualização — e, nesse
intervalo, o envio ficaria oferecido de novo com o arquivo ainda selecionado.

#### Scenario: Atualização da área de conta

- **WHEN** a troca de imagem é concluída
- **THEN** a área de conta apresenta a imagem nova sem recarregar a página

#### Scenario: Atualização do menu do usuário

- **WHEN** a troca de imagem é concluída
- **THEN** o menu do usuário apresenta a imagem nova sem recarregar a página

#### Scenario: Envio em andamento

- **WHEN** o envio da imagem está em andamento
- **THEN** o envio não pode ser acionado novamente
- **AND** o descarte da imagem selecionada não é oferecido
