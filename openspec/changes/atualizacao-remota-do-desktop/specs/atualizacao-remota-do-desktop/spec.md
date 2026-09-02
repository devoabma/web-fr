## ADDED Requirements

### Requirement: Pedido de atualização oferecido apenas onde ele faz sentido

A listagem administrativa de computadores SHALL oferecer, na linha da estação, uma ação para mandá-la
atualizar o aplicativo agora. A oferta MUST ser decidida pela situação que o servidor informa
(`updateStatus`) combinada com a presença da estação no canal (`isOnline`), e MUST NOT ser calculada
comparando versões no cliente.

A ação MUST estar ausente para a estação comprovadamente na versão publicada.

A ação MUST estar ausente para a estação de situação indeterminada que também esteja fora do canal, por não
haver nada a comunicar nem quem escute.

#### Scenario: Estação atrás da versão publicada

- **WHEN** a estação chega com situação de desatualizada
- **THEN** a linha apresenta a ação de atualizar

#### Scenario: Estação na versão publicada

- **WHEN** a estação chega com situação de em dia
- **THEN** a linha não apresenta a ação de atualizar

#### Scenario: Estação conectada que não informou a versão

- **WHEN** a estação chega com situação indeterminada e com o canal aberto
- **THEN** a linha apresenta a ação de atualizar
- **AND** a explicação disponível diz que a estação não informou a versão

#### Scenario: Estação desconectada que não informou a versão

- **WHEN** a estação chega com situação indeterminada e sem o canal aberto
- **THEN** a linha não apresenta a ação de atualizar

#### Scenario: API que não informa a situação

- **WHEN** a resposta da listagem não traz a situação da estação
- **THEN** nenhuma linha apresenta a ação
- **AND** a tabela segue funcionando em todo o resto

### Requirement: Recusas previsíveis travadas na tela, com o motivo à mão

A ação SHALL aparecer travada, e não oculta, quando a estação estiver em uso ou fora do canal — as duas
situações que a API recusa antes de gastar a conexão.

O elemento travado MUST permanecer focável e capaz de exibir a explicação, de modo que o motivo da trava
esteja disponível sem clique. A tela MUST NOT enviar o pedido enquanto a trava estiver ativa.

O aviso animado de novidade MUST acender apenas quando a estação estiver desatualizada **e** sem trava, e
MUST permanecer legível quando a animação estiver desligada por preferência do sistema.

#### Scenario: Estação em uso por advogado(a)

- **WHEN** a estação desatualizada está com sessão aberta
- **THEN** a ação aparece travada
- **AND** a explicação diz que a atualização espera o encerramento da sessão

#### Scenario: Estação desconectada

- **WHEN** a estação desatualizada está fora do canal
- **THEN** a ação aparece travada
- **AND** a explicação diz que ela busca a versão sozinha ao ser ligada

#### Scenario: Novidade sinalizada

- **WHEN** a estação está desatualizada, livre e conectada
- **THEN** a ação exibe o aviso de novidade
- **AND** o aviso continua visível com movimento reduzido

#### Scenario: Novidade não sinalizada em máquina inalcançável

- **WHEN** a estação está desatualizada e travada
- **THEN** a ação não exibe o aviso animado

### Requirement: Confirmação informando a transição, as mudanças e o efeito sobre quem usa

A ação SHALL exigir confirmação antes de enviar o pedido. A confirmação MUST identificar a estação, MUST
apresentar a versão instalada e a versão publicada como uma transição, e MUST apresentar as notas da
publicação quando houverem, junto da data em que ela foi publicada.

A confirmação MUST declarar que a troca não interrompe advogado(a) em atendimento.

Quando o painel não conhecer a versão publicada, a confirmação MUST dizê-lo em texto e MUST NOT apresentar
um número inventado.

Enquanto o pedido estiver em andamento, a confirmação MUST NOT ser fechada.

#### Scenario: Versão publicada conhecida

- **WHEN** a listagem trouxe a versão publicada
- **THEN** a confirmação apresenta a versão instalada, a publicada e a promessa de não interromper sessão

#### Scenario: Estação sem versão informada

- **WHEN** a estação nunca informou a versão instalada
- **THEN** a confirmação apresenta uma marca de ausência no lugar da versão instalada

#### Scenario: Versão publicada desconhecida

- **WHEN** a listagem não trouxe a versão publicada
- **THEN** a confirmação explica que a estação vai consultar o servidor de atualizações
- **AND** nenhuma versão de destino é apresentada

#### Scenario: Fechamento durante o envio

- **WHEN** o pedido está em voo e o usuário tenta fechar a confirmação
- **THEN** ela permanece aberta até o desfecho

### Requirement: Desfecho apresentado como envio do pedido, nunca como atualização concluída

Ao receber a resposta de sucesso, a tela SHALL informar que o pedido foi enviado para a estação e MUST
declarar que a troca leva alguns minutos e termina com a estação reiniciando sozinha. A tela MUST NOT
afirmar que a versão já foi instalada.

A tela SHALL revalidar a listagem de computadores após o sucesso.

#### Scenario: Pedido aceito com versão conhecida

- **WHEN** a API confirma o envio e devolve a versão de destino
- **THEN** a mensagem cita essa versão
- **AND** informa que a troca leva alguns minutos e a estação reinicia sozinha

#### Scenario: Pedido aceito sem versão de destino

- **WHEN** a API confirma o envio sem devolver versão
- **THEN** a mensagem diz que a estação vai consultar o servidor de atualizações

#### Scenario: Coluna de versão ainda antiga após o sucesso

- **WHEN** a listagem é revalidada logo após o pedido
- **THEN** a versão exibida pode continuar sendo a antiga
- **AND** isso não é apresentado como falha

### Requirement: Recusas da API traduzidas, e teto de disparos respeitado sem retentativa

A tela SHALL apresentar a recusa usando a mensagem em português devolvida pela API, com texto de reserva
quando não houver mensagem.

Quando a recusa for por excesso de tentativas, a tela MUST ler o tempo de espera informado pela API e
apresentá-lo ao usuário, e MUST NOT reenviar o pedido automaticamente.

A confirmação MUST permanecer aberta após uma recusa, para que a nova tentativa não exija reabri-la.

#### Scenario: Estação caiu entre a leitura e o clique

- **WHEN** a API recusa por estação desconectada
- **THEN** a mensagem da API é apresentada ao usuário
- **AND** a confirmação segue aberta

#### Scenario: Teto de disparos atingido

- **WHEN** a API recusa por excesso de tentativas e informa o tempo de espera
- **THEN** a mensagem apresenta em quanto tempo tentar de novo
- **AND** nenhum reenvio automático acontece

#### Scenario: Falha sem mensagem legível

- **WHEN** a chamada falha sem mensagem da API
- **THEN** a tela apresenta um texto de reserva orientando a verificar a conexão

### Requirement: Nenhuma requisição adicional para sustentar a ação

A ação SHALL obter a versão publicada a partir do mesmo recurso que alimenta a tabela, identificado pela
mesma chave de cache, e MUST NOT disparar uma requisição adicional por linha.

#### Scenario: Tabela com várias linhas elegíveis

- **WHEN** a tabela apresenta várias estações com a ação disponível
- **THEN** nenhuma requisição extra é feita além da listagem que a tabela já carrega
