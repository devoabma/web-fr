## Why

A change `painel-operacao-das-maquinas` entregou a liberação pelo balcão com um aviso: se a resposta da
`api-fr` vinha com `notified: false`, o funcionário era alertado de que a estação estava offline e não ia
destravar sozinha. Era o melhor possível na época — a API não expunha nenhuma forma de perguntar quem
estava conectado ao canal `/ws/computers`, então o painel só descobria a máquina muda **depois** de gravar
a sessão.

O aviso resolvia a informação e deixava o estrago de pé. Três consequências, todas no balcão:

**A sessão ficava aberta numa máquina que ninguém ia usar.** O advogado caminhava até um computador
travado, voltava, e a segunda tentativa era recusada — a `api-fr` não permite duas sessões simultâneas para
o mesmo advogado. Para sair do impasse era preciso encerrar a sessão fantasma pelo cartão antes de tentar
outra máquina, e nada na tela dizia isso.

**A máquina desligada aparecia verde.** O cartão dizia "Disponível · cota de 60 min no dia" e o contador do
topo a somava às disponíveis. O balcão prometia uma vaga que não existia.

**Não havia como escolher outra máquina antes de errar.** A informação de quem está ligado só chegava como
consequência de uma tentativa.

A `api-fr` passou a expor `GET /computers/online/:roomId` (commit `8089c01`), que lista as estações
conectadas ao canal. Esta change consome essa rota: a grade passa a marcar quem está muda **antes** do
clique, e o `notified: false` — que continua possível para quem cai entre o último refetch e a confirmação
— deixa de ser um aviso e passa a desfazer a liberação.

## What Changes

- **`src/server/computers/get-online.ts` (novo)**: consulta `GET /computers/online/:roomId`. A rota devolve
  **só as conectadas** — ausência na lista é o sinal de offline.
- **`src/constants/query-keys.ts`**: chave `getOnlineComputers(roomId)`.
- **`_components/releases-board.tsx`**:
  - terceira consulta da tela, com `refetchInterval` de 20s. É a única com polling: uma estação recém-ligada
    não avisa o painel, e sem o refetch ela ficaria bloqueada até alguém sair e voltar para a aba;
  - `refreshBoard()` passa a invalidar também a lista de conectadas;
  - **liberação desfeita quando a estação não recebe o aviso**: com `expiresAt` presente e
    `notified: false`, o painel encerra a sessão recém-criada e explica o que houve. O caminho em que o
    encerramento também falha ganha mensagem própria, dizendo para encerrar pelo cartão antes de tentar
    outra máquina;
  - aviso na tela quando a consulta de conectadas falha, porque a grade volta a não distinguir as mudas.
- **`_data/computer-view.ts`**: `buildComputerViews` recebe o conjunto de ids conectados e preenche
  `isOnline`. `null` = o painel não conseguiu perguntar.
- **`_components/computer-card.tsx`**: máquina livre e offline sai do verde para o âmbar, é rotulada
  "Offline", explica o motivo provável e tem a liberação bloqueada. Manutenção continua disponível — tirar
  de operação a máquina muda é o que o balcão costuma querer em seguida. Máquina **em uso** e offline
  mantém o encerramento, com a ressalva de que a tela dela não será limpa.
- **`_components/status-summary.tsx`**: as livres e mudas saem da contagem de disponíveis e ganham pílula
  âmbar própria, exibida só quando houver alguma.

## Capabilities

### Modified Capabilities
- `operacao-das-maquinas`: a conexão da estação passa a ser um estado visível da grade e uma pré-condição
  da liberação.
- `visao-da-sala`: a contagem por estado deixa de somar máquinas que não aceitam liberação.

## Impact

- Código novo: `src/server/computers/get-online.ts`.
- Alterado: `_data/computer-view.ts`, `_components/{releases-board,computer-card,status-summary}.tsx`,
  `src/constants/query-keys.ts`.
- **Depende da `api-fr` em `8089c01` ou posterior.** Contra uma API antiga a consulta responde 404, a tela
  cai no aviso de degradação e o comportamento volta a ser o anterior — com o desfazer automático de pé.
- **Uma requisição a cada 20s por painel com a aba em foco.** O intervalo pausa fora de foco. O teto global
  da `api-fr` é de 300 requisições por minuto por IP; três por minuto por funcionário não chega perto.
- **A leitura é da conexão atual, não do estado do computador.** Estação ligada com o Desktop fechado conta
  como offline — que é exatamente o que interessa, porque é o programa que abre a tela.
- **O bloqueio pode atrasar até 20s para liberar de novo** uma máquina que acabou de ser ligada. O caminho
  contrário — máquina que cai depois do refetch — continua coberto pelo desfazer.
- **A liberação desfeita não custa cota.** O consumo é contado em minutos inteiros, e o encerramento é
  imediato.
- **Continua sem tempo real.** A `api-fr` não emite eventos de negócio no WebSocket; o painel pergunta.
