## MODIFIED Requirements

### Requirement: Respiro uniforme nas tabelas do painel

As tabelas do painel SHALL usar o mesmo espaçamento interno, com calha suficiente para que o conteúdo de
colunas vizinhas não se toque e a primeira coluna não encoste na borda.

O esqueleto de carregamento MUST ocupar a mesma altura de linha do conteúdo definitivo. Esqueleto mais
baixo faz a tabela encolher no instante em que os dados chegam, e o salto se lê como defeito de
renderização.

A altura MUST ser sustentada pela caixa que envolve cada marcador, e não pelo marcador em si: o traço
apresentado SHALL ser mais fino que a linha de texto que ele antecipa. O esqueleto anuncia a espera; ocupar
o peso visual do conteúdo faz o placeholder competir com o que ele está anunciando.

A coluna que define a altura da linha — aquela com ladrilho de identidade e duas linhas de texto — MUST ter
esqueleto com esse mesmo arranjo, e não um marcador único do tamanho do bloco.

A quantidade de linhas de esqueleto MUST ser fixa e menor que uma página cheia. O total de registros é
desconhecido até a resposta chegar, de modo que imitar a página é chute; e o crescimento da tabela quando os
dados chegam não empurra para cima o que já estava lido.

**Motivação:** o espaçamento anterior deixava 16px entre colunas e 8px até a borda, e o esqueleto era 4px
mais baixo que a linha real — com dez linhas, 40px de salto ao carregar. Corrigida a altura, o esqueleto
passou ao excesso oposto: traços da altura inteira do texto repetidos por uma página inteira, uma tela cinza
no lugar de um aviso de espera.

#### Scenario: Colunas vizinhas legíveis

- **WHEN** uma tabela do painel é apresentada
- **THEN** há calha suficiente entre colunas para distinguir onde termina uma e começa a outra
- **AND** a primeira coluna não encosta na borda do quadro

#### Scenario: Carregamento sem salto

- **WHEN** os dados chegam e substituem o esqueleto de carregamento
- **THEN** a altura das linhas permanece a mesma
- **AND** a tabela não encolhe no instante da troca

#### Scenario: Esqueleto discreto

- **WHEN** uma tabela do painel está carregando
- **THEN** os marcadores são visivelmente mais finos que o texto que antecipam
- **AND** a linha do esqueleto tem a mesma altura da linha de conteúdo

#### Scenario: Coluna de identidade no esqueleto

- **WHEN** uma tabela do painel está carregando
- **THEN** a primeira coluna apresenta marcador de ladrilho acompanhado de duas barras de texto
- **AND** a altura dessa linha corresponde à da linha real

#### Scenario: Quantidade de linhas do esqueleto

- **WHEN** uma tabela do painel está carregando
- **THEN** são apresentadas poucas linhas de esqueleto, independentemente da quantidade de linhas por página
  escolhida

### Requirement: Código MAC apresentado como chave de pareamento

O código MAC SHALL ser apresentado com destaque próprio, em fonte monoespaçada e em recipiente que o
distinga do texto corrido da linha.

O valor MUST ser exibido exatamente como está gravado, sem transformação de caixa ou de formato. A API o
guarda como texto opaco e o pareamento no servidor é byte a byte; mostrar algo diferente do gravado
enganaria justamente quem compara com a configuração da estação.

A fonte MUST ser monoespaçada, e não apenas de dígitos alinhados: o código contém letras, e só a
monoespaçada alinha a coluna inteira para conferência caractere a caractere.

O código MAC MUST NOT ser critério da busca da listagem. Ele está na tela para ser conferido contra a
configuração do Desktop, não para ser digitado: são dezessete caracteres que ninguém tem de memória, e
incluí-los na busca de texto aumenta o alcance do campo sem ajudar quem procura uma estação.

**Motivação:** a busca por MAC foi acrescentada supondo que quem diagnostica uma estação muda chegaria com o
código copiado. Na prática quem tem o código na mão sabe de qual sala a máquina é, e a busca por sala já a
encontra.

#### Scenario: MAC legível para conferência

- **WHEN** a listagem de computadores é apresentada
- **THEN** os códigos MAC ficam alinhados em coluna, caractere a caractere
- **AND** cada um aparece exatamente como gravado

#### Scenario: MAC fora da busca

- **WHEN** o administrador digita parte de um código MAC no campo de busca
- **THEN** a busca não usa esse critério para filtrar a lista
