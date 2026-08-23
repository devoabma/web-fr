## ADDED Requirements

### Requirement: Cadastro de sala de liberação

A área administrativa de salas SHALL oferecer o cadastro de uma sala, informando nome, tempo padrão e
descrição. O envio MUST usar `POST /rooms/create` e MUST NOT enviar o identificador da sala — quem o deriva
do nome é a API. O acesso à área continua sendo decidido pela guarda de navegação e pela API; a tela
MUST NOT tratar a própria presença como autorização.

Concluído o cadastro, o sistema MUST informar o sucesso nomeando a sala criada e o tempo padrão adotado, e
MUST descartar o formulário para que o próximo cadastro comece limpo.

A sala recém-criada MUST passar a estar disponível nas demais telas que listam salas, sem exigir recarga da
página.

**Motivação:** sem sala cadastrada não há computador, vínculo de funcionário nem liberação. Enquanto o
cadastro não existisse na interface, todo ambiente novo começava por uma escrita direta no banco.

#### Scenario: Sala cadastrada

- **WHEN** um administrador informa nome, tempo padrão e descrição válidos e confirma
- **THEN** a sala é criada
- **AND** o sistema informa o sucesso nomeando a sala e o tempo padrão adotado
- **AND** o formulário é descartado

#### Scenario: Sala nova disponível nas outras telas

- **WHEN** uma sala acaba de ser cadastrada
- **THEN** ela passa a constar entre as salas oferecidas ao operador do painel
- **AND** isso acontece sem recarga da página

#### Scenario: Descrição não informada

- **WHEN** o administrador deixa a descrição em branco
- **THEN** a sala é criada sem descrição
- **AND** não é gravado um texto vazio no lugar da ausência

### Requirement: Identificador derivado do nome exposto antes do envio

Enquanto o nome é digitado, o sistema SHALL apresentar o identificador que será gravado para a sala,
derivado do nome pelas mesmas etapas que a API aplica. A prévia MUST refletir o resultado real, incluindo os
casos em que caracteres digitados são descartados, e MUST NOT apresentar uma forma mais favorável do que a
que será gravada. A prévia MUST ceder lugar à mensagem de erro do campo quando houver uma.

**Motivação:** a unicidade da sala é decidida pelo identificador, não pelo nome. Sem a prévia, dois nomes
que o administrador enxerga como distintos colidem e a recusa fala de um nome que ele acabou de conferir.

#### Scenario: Prévia acompanha a digitação

- **WHEN** o administrador digita o nome da sala
- **THEN** o identificador correspondente é apresentado junto ao campo
- **AND** ele se atualiza a cada alteração do nome

#### Scenario: Acento não sobrevive ao identificador

- **WHEN** o nome contém acentos ou cedilha
- **THEN** a prévia apresenta as letras simples correspondentes

#### Scenario: Caractere descartado aparece descartado

- **WHEN** o nome contém caractere que a derivação descarta
- **THEN** a prévia apresenta o identificador já sem ele
- **AND** o resultado é o mesmo que a API vai gravar

#### Scenario: Erro no nome tem precedência sobre a prévia

- **WHEN** o campo de nome está inválido
- **THEN** a mensagem de erro ocupa o lugar da prévia

### Requirement: Tempo padrão informado em minutos e conferido em horas

O tempo padrão SHALL ser informado em minutos, por ser a unidade que a API recebe, e o sistema MUST
apresentar ao lado a mesma quantidade lida em horas e minutos. A leitura MUST ser anunciada a tecnologias
assistivas conforme muda, e MUST NOT apresentar valor algum enquanto o campo estiver vazio ou inválido.

O sistema SHALL recusar tempo padrão fora de uma faixa plausível para uma cota diária, com mínimo e máximo
explicados ao administrador.

**Motivação:** o tempo padrão é a cota diária de cada advogado naquela sala. Um dígito a mais não quebra
tela nenhuma — muda em silêncio quanto tempo cada advogado tem no dia.

#### Scenario: Leitura em horas acompanha o valor

- **WHEN** o administrador informa o tempo padrão em minutos
- **THEN** a leitura correspondente em horas e minutos é apresentada ao lado do campo

#### Scenario: Campo vazio não inventa leitura

- **WHEN** o campo de tempo padrão está vazio
- **THEN** nenhuma leitura em horas é apresentada como se fosse um valor

#### Scenario: Tempo padrão fora da faixa

- **WHEN** o administrador informa tempo padrão abaixo do mínimo ou acima do máximo aceito
- **THEN** o cadastro é recusado antes do envio
- **AND** a mensagem informa o limite violado

### Requirement: Recusa da API explicada e recuperável

Quando a API recusar o cadastro, o sistema MUST apresentar a explicação vinda dela, MUST preservar o que foi
digitado e MUST devolver o foco ao campo que costuma ser a causa da recusa. Não havendo explicação
utilizável — falha de rede ou resposta fora do contrato —, o sistema MUST apresentar um texto próprio que
não afirme mais do que sabe. Excedido o limite de tentativas, o sistema MUST informar quanto tempo falta
para tentar de novo, em vez de repetir a recusa.

O formulário MUST NOT ser descartado enquanto o envio estiver em curso, e o sistema MUST impedir que uma
mesma confirmação dispare mais de um cadastro.

#### Scenario: Sala já cadastrada

- **WHEN** o identificador derivado do nome colide com o de uma sala existente
- **THEN** a explicação da API é apresentada
- **AND** os dados digitados permanecem na tela
- **AND** o foco volta ao campo de nome

#### Scenario: Falha sem resposta utilizável

- **WHEN** o envio falha sem resposta interpretável da API
- **THEN** o sistema apresenta um aviso próprio, sem atribuir uma causa que não conhece

#### Scenario: Limite de tentativas atingido

- **WHEN** a API responde que o limite de tentativas foi excedido
- **THEN** o sistema informa quanto tempo falta para tentar novamente

#### Scenario: Fechamento durante o envio

- **WHEN** o administrador tenta fechar o formulário com o envio em curso
- **THEN** o formulário permanece aberto com os dados preservados

#### Scenario: Confirmação repetida

- **WHEN** o administrador aciona a confirmação mais de uma vez seguidas
- **THEN** apenas um cadastro é enviado
