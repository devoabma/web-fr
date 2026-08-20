## ADDED Requirements

### Requirement: Conexão das estações consultada por sala

O painel SHALL obter em `GET /computers/online/:roomId` quais estações da sala estão conectadas ao canal
`/ws/computers`. A rota devolve apenas as conectadas: um computador ausente da lista MUST ser considerado
desconectado. A consulta SHALL ser revalidada periodicamente enquanto a tela estiver em foco, porque uma
estação que se conecta não notifica o painel.

Enquanto a resposta não existir — por ainda não ter chegado ou por a consulta ter falhado —, a conexão do
computador MUST ser tratada como desconhecida, e nenhuma ação MUST ser bloqueada por conta disso.

#### Scenario: Estações são consultadas por sala

- **WHEN** uma sala está selecionada
- **THEN** a consulta de estações conectadas é feita para aquela sala
- **AND** trocar de sala consulta as estações da nova sala

#### Scenario: Ausência na lista é desconexão

- **WHEN** a resposta chega sem um computador da sala
- **THEN** aquele computador é apresentado como desconectado

#### Scenario: Estação que se conecta volta a aceitar liberação

- **WHEN** uma estação marcada como desconectada entra no canal com a tela aberta e em foco
- **THEN** a próxima revalidação a apresenta como conectada
- **AND** a liberação volta a ser oferecida sem que o funcionário recarregue a página

#### Scenario: Falha na consulta degrada sem bloquear

- **WHEN** a consulta de estações conectadas falha
- **THEN** o funcionário é avisado de que não foi possível verificar quais estações estão ligadas
- **AND** a grade continua operando, sem marcar nenhum computador como desconectado
- **AND** a liberação continua sendo oferecida em todos os computadores disponíveis

## MODIFIED Requirements

### Requirement: Estado do computador derivado da API

Cada cartão SHALL apresentar exatamente um entre três estados: disponível, em uso e manutenção. Quando um
computador estiver simultaneamente em manutenção e marcado como em uso, o estado apresentado MUST ser
manutenção.

O estado disponível SHALL distinguir a máquina pronta para uso da máquina cuja estação está desconectada.
A máquina livre e desconectada MUST NOT ser apresentada com a mesma sinalização da máquina pronta, e o
cartão SHALL informar o motivo provável da desconexão. A máquina em uso e desconectada SHALL manter o
encerramento, com a ressalva de que a tela da estação não será limpa.

#### Scenario: Máquina em manutenção prevalece sobre ocupação

- **WHEN** um computador chega com data de manutenção e com a marca de uso ativa
- **THEN** o cartão apresenta o estado de manutenção
- **AND** não oferece a ação de encerrar sessão

#### Scenario: Máquina com sessão aberta aparece em uso

- **WHEN** existe uma sessão sem data de encerramento para aquele computador
- **THEN** o cartão apresenta o estado em uso, com o nome do advogado e o saldo da sessão

#### Scenario: Máquina livre e conectada aparece disponível

- **WHEN** o computador não está em manutenção, não tem sessão aberta nem marca de uso, e a estação está
  conectada
- **THEN** o cartão apresenta o estado disponível e a cota diária da sala

#### Scenario: Máquina livre e desconectada aparece como offline

- **WHEN** o computador está livre e a estação não está conectada ao canal
- **THEN** o cartão é apresentado como offline, em sinalização distinta da máquina pronta
- **AND** informa que a estação pode estar desligada, sem rede ou com o programa fechado

#### Scenario: Conexão desconhecida não altera o cartão

- **WHEN** a conexão da estação é desconhecida
- **THEN** o cartão livre continua sendo apresentado como disponível

#### Scenario: Máquina em uso e desconectada avisa sobre o encerramento

- **WHEN** um computador em uso está com a estação desconectada
- **THEN** o encerramento continua sendo oferecido
- **AND** o cartão informa que a tela daquela estação não será limpa pelo encerramento

#### Scenario: Manutenção informa desde quando

- **WHEN** o computador está em manutenção
- **THEN** o cartão apresenta a data e a hora em que a máquina saiu de operação

### Requirement: Liberação manual de um computador

O cartão de um computador disponível SHALL oferecer a liberação manual, confirmada por formulário com CPF,
número da OAB e data de nascimento do advogado. O envio SHALL usar `POST /lawyers/release-computer`,
identificando a máquina pelo seu endereço físico. A data de nascimento MUST ser enviada como sequência de
oito dígitos, sem separadores, no formato exigido pela API.

A liberação MUST NOT ser oferecida em computador cuja estação esteja conhecidamente desconectada. Quando a
API gravar uma sessão nova e informar que a estação não recebeu o aviso, o painel SHALL encerrar essa
sessão imediatamente e comunicar que a liberação foi desfeita. Não conseguindo encerrá-la, o painel MUST
instruir o funcionário a encerrá-la pelo cartão antes de tentar outra máquina. A movimentação para
manutenção MUST permanecer disponível na máquina desconectada.

#### Scenario: Liberação bem-sucedida

- **WHEN** os dados conferem com o cadastro da Seccional e a estação recebe o aviso
- **THEN** o funcionário é informado do nome do advogado liberado e do saldo do dia
- **AND** o formulário é fechado
- **AND** a grade é revalidada

#### Scenario: Dados recusados mantêm o formulário aberto

- **WHEN** a API recusa a liberação por dados que não conferem, situação irregular ou pendência financeira
- **THEN** a mensagem devolvida pela API é apresentada ao funcionário
- **AND** o formulário permanece aberto com os dados já digitados

#### Scenario: Estação desconectada não é oferecida para liberação

- **WHEN** um computador livre está com a estação desconectada
- **THEN** a ação de liberar aparece indisponível naquele cartão
- **AND** a ação de enviar para manutenção continua disponível

#### Scenario: Liberação não entregue é desfeita

- **WHEN** a sessão é gravada mas a estação não confirma o recebimento do aviso
- **THEN** a sessão recém-criada é encerrada pelo painel
- **AND** o funcionário é informado de que a liberação foi desfeita e deve usar outro computador
- **AND** a grade é revalidada

#### Scenario: Desfazer que falha vira instrução

- **WHEN** a estação não confirma o aviso e o encerramento da sessão também falha
- **THEN** o funcionário é informado de que a sessão ficou aberta
- **AND** é instruído a encerrá-la pelo cartão antes de liberar outra máquina

#### Scenario: Encerramento por tempo esgotado não é confundido com liberação nova

- **WHEN** a resposta encerra a sessão anterior do advogado sem abrir uma nova
- **THEN** o painel não tenta desfazer nada

#### Scenario: Formulário não reaproveita o advogado anterior

- **WHEN** o formulário é aberto para uma máquina depois de ter sido usado em outra
- **THEN** os campos aparecem vazios

#### Scenario: Envio em andamento não aceita repetição

- **WHEN** uma liberação está sendo enviada, inclusive durante o desfazer
- **THEN** os botões de confirmar e cancelar ficam indisponíveis até a resposta
