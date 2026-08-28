## ADDED Requirements

### Requirement: Controle de sala reutilizável entre históricos

O painel SHALL oferecer um único controle de filtro por sala, reutilizado pelas telas de histórico.

O controle MUST receber a lista de salas já recortada pela tela que o usa, e MUST NOT decidir por conta
própria quais salas exibir — o critério muda entre históricos: impressões só fazem sentido em salas em
operação, liberações continuam valendo como registro de salas já desativadas.

O controle MUST oferecer a opção "todas as salas" à frente das demais, e MUST receber da tela o que
essa opção significa ali.

A opção "todas" MUST corresponder à ausência de sala na consulta, e MUST NOT viajar para a API como um
valor próprio.

**Motivação:** duas telas com o mesmo seletor divergiriam na primeira correção feita em só uma delas.
Embutir no controle o critério de quais salas mostrar faria o oposto — acoplaria a ele uma regra que
pertence a cada tela.

#### Scenario: Sala com descrição

- **WHEN** uma sala com descrição é apresentada na lista de opções
- **THEN** o nome e a descrição são apresentados

#### Scenario: Opção "todas as salas"

- **WHEN** a lista de opções é apresentada
- **THEN** "todas as salas" aparece antes das salas
- **AND** acompanhada da explicação que a tela forneceu

### Requirement: Controle de período reutilizável, com recortes por tela

O painel SHALL oferecer um único controle de filtro por período, reutilizado pelas telas de histórico.

O conjunto de recortes oferecidos MUST ser definido pela tela que usa o controle. Uma tela cujo dado é
apagado periodicamente MUST NOT oferecer um recorte maior que esse intervalo, porque ele nunca mudaria
o resultado.

O texto que descreve "todo o período" MUST ser fornecido pela tela: o alcance dessa opção difere entre
um histórico que é limpo toda semana e um que nunca é apagado.

#### Scenario: Recortes padrão

- **WHEN** uma tela usa o controle sem declarar os recortes
- **THEN** são oferecidos "todo o período", "hoje", "ontem" e "últimos 7 dias"

#### Scenario: Recorte adicional declarado

- **WHEN** uma tela declara também o recorte de 30 dias
- **THEN** essa opção passa a ser oferecida naquela tela
- **AND** continua ausente nas telas que não a declararam

### Requirement: Recorte de período no fuso da Seccional

O recorte de período SHALL ser calculado no fuso horário da Seccional, e não no do navegador de quem
olha.

Os limites do recorte MUST ser calculados uma única vez por filtragem, e não a cada linha percorrida:
todas as linhas de uma mesma filtragem MUST ser comparadas contra o mesmo instante, de modo que nenhuma
mude de dia no meio da varredura.

A janela de "últimos 7 dias" MUST incluir o dia corrente, e a de "últimos 30 dias" também.

#### Scenario: Registro perto da virada do dia

- **WHEN** um registro é criado no fim da noite no horário da Seccional
- **AND** a tela é aberta por alguém com o navegador em outro fuso
- **THEN** o registro é contado no dia em que ocorreu no balcão

#### Scenario: Janela de sete dias

- **WHEN** o recorte "últimos 7 dias" é escolhido
- **THEN** o dia corrente está incluído
- **AND** o recorte abrange sete dias, não oito
