## ADDED Requirements

### Requirement: Vínculo com salas ajustado pela listagem

A listagem de colaboradores SHALL oferecer, em cada pessoa, o ajuste das salas vinculadas em uma única
passagem: marcar vincula, desmarcar desvincula, uma confirmação grava.

A seleção MUST abrir refletindo os vínculos atuais e MUST ser recomeçada deles a cada abertura. A confirmação
MUST permanecer indisponível enquanto a seleção for igual ao que está gravado.

Gravado o ajuste, as salas do colaborador MUST passar a constar atualizadas tanto na listagem de
colaboradores quanto na de salas, sem recarga da página.

**Motivação:** o vínculo só existia dentro do cadastro. Quem passasse do formulário sem marcar sala nenhuma
ficava sem caminho — e o vínculo decide de quais salas o colaborador consegue liberar estações.

#### Scenario: Salas vinculadas e desvinculadas na mesma passagem

- **WHEN** o administrador marca duas salas novas, desmarca uma vinculada e confirma
- **THEN** as duas novas passam a constar vinculadas
- **AND** a desmarcada deixa de constar
- **AND** as duas listagens acompanham a mudança sem recarga da página

#### Scenario: Nada a salvar

- **WHEN** a seleção é igual aos vínculos gravados
- **THEN** a confirmação fica indisponível

#### Scenario: Seleção abandonada não persiste

- **WHEN** o administrador mexe na seleção, fecha o painel sem confirmar e o abre de novo
- **THEN** a seleção volta a refletir os vínculos gravados

### Requirement: Envio restrito à diferença

O sistema MUST enviar a `POST /employees/link-with-rooms` apenas as salas que foram marcadas e não estavam
vinculadas, e a `POST /employees/unlink-with-rooms` apenas as que estavam vinculadas e foram desmarcadas.
Nenhuma das duas chamadas MUST ser feita com lista vazia.

A vinculação MUST ser tentada antes da desvinculação.

**Motivação:** a API recusa com 400 quando o corpo do vínculo traz uma sala já vinculada, e ambas as rotas
exigem ao menos um id. Enviar a seleção inteira derrubaria o salvamento a cada edição. A ordem protege o
estado: a vinculação é a chamada que valida, e falhando ela nada foi removido.

#### Scenario: Apenas marcações novas no vínculo

- **WHEN** o administrador marca uma sala nova, mantendo as demais como estavam
- **THEN** somente a sala nova é enviada para vinculação
- **AND** nenhuma desvinculação é solicitada

#### Scenario: Falha ao vincular preserva o que existia

- **WHEN** a vinculação é recusada pela API
- **THEN** o sistema apresenta a recusa
- **AND** nenhum vínculo existente é removido

#### Scenario: Sucesso parcial anunciado

- **WHEN** a vinculação é concluída e a desvinculação seguinte falha
- **THEN** o sistema informa que as salas foram vinculadas e que a remoção não foi concluída
- **AND** as listagens são atualizadas, porque o vínculo novo já existe no servidor

### Requirement: Sala inativa já vinculada permanece visível

As salas inativas que já estiverem vinculadas ao colaborador MUST constar da seleção, identificadas como
inativas, e MUST poder ser desmarcadas. Salas inativas não vinculadas MUST NOT ser oferecidas.

**Motivação:** a API recusa vincular sala inativa, mas não recusa desvincular — e uma sala desativada depois
do vínculo continua ligada ao colaborador. Escondê-la faria o painel abrir sem um vínculo que existe, e
salvar qualquer outra mudança a enviaria para a desvinculação sem ninguém ter pedido.

#### Scenario: Sala desativada depois do vínculo

- **WHEN** uma sala vinculada ao colaborador é desativada e o administrador abre o painel de salas dele
- **THEN** a sala consta da seleção, marcada e identificada como inativa

#### Scenario: Sala inativa não vinculada

- **WHEN** existe uma sala inativa sem vínculo com o colaborador
- **THEN** ela não é oferecida na seleção

### Requirement: Salas identificadas desde a abertura

Enquanto o catálogo de salas estiver sendo carregado, os vínculos atuais MUST ser apresentados já com o nome
de cada sala.

**Motivação:** `GET /employees/get-all` traz as salas de cada colaborador com nome. Aguardar o catálogo para
nomear o que já se conhece deixaria o painel abrir com marcadores em branco, o que se lê como vínculo
corrompido.

#### Scenario: Painel aberto antes do catálogo chegar

- **WHEN** o administrador abre o painel de salas de um colaborador que já tem vínculos
- **THEN** as salas vinculadas aparecem nomeadas imediatamente
