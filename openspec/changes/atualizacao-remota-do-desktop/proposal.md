## Why

A change `versao-do-desktop-na-grade` deu ao painel o diagnóstico: dá para ver, de relance, que uma estação
ficou para trás. O que ela não deu foi o remédio. Descoberta a máquina atrasada, o caminho continuava sendo
o de sempre — levantar do balcão, ir até ela, rodar o instalador. E a régua daquela change era a **própria
sala**, porque o painel não tinha como saber qual versão estava publicada: sala inteira parada numa versão
antiga não destacava ninguém.

As duas metades que faltavam chegaram na `api-fr`:

- `GET /computers/get-all` passou a devolver, por computador, `isOnline` (o canal do WebSocket aberto
  **agora**, lido do mapa em memória) e `updateStatus` (`outdated` | `up-to-date` | `unknown`, decidido no
  servidor contra a versão publicada), e a trazer no envelope um `latestVersion` com a versão publicada,
  as `notas` do manifesto e a data de publicação;
- `POST /computers/update/:id` (ADMIN) empurra um `update_now` pelo canal que a estação já mantém aberto.

Esta change transforma isso em uma ação na linha da tabela de `/admin/computers`: a máquina que precisa
atualizar ganha um botão que só ela tem, e um clique manda a estação buscar a versão nova agora, sem
esperar o ciclo de 6 horas dela e sem ninguém sair do balcão.

## What Changes

- **`src/server/computers/get-all.ts`**: `ComputerWithRoomProps` ganha `isOnline: boolean` e
  `updateStatus: ComputerUpdateStatus`; o envelope `GetAllComputersResponse` ganha
  `latestVersion: LatestAppVersionProps | null`. Novos tipos exportados `ComputerUpdateStatus` e
  `LatestAppVersionProps`.
- **`src/server/computers/update-app.ts`** (novo): `updateComputerApp(computerId)` sobre
  `POST /computers/update/:id`, documentado com as três recusas previstas (`400` em uso ou já em dia, `409`
  desconectada, `429` teto de disparos) e com o que a resposta `200` significa — recado entregue, nunca
  atualização concluída.
- **`_components/update-computer-app.tsx`** (novo): botão de ação da linha mais o diálogo de confirmação.
  Aparece só quando há o que atualizar, mostra de que versão para qual, exibe as notas do manifesto e diz,
  antes do clique, que a troca nunca interrompe advogado(a).
- **`_components/computers-columns.tsx`**: a nova ação entra **primeiro** na coluna Ações, antes de editar
  e excluir.

## Capabilities

### Added Capabilities
- `atualizacao-remota-do-desktop`: o painel passa a **pedir** atualização de uma estação, e não só a
  observar a versão instalada.

## Impact

- Novos: `src/server/computers/update-app.ts`,
  `src/app/(private)/admin/computers/_components/update-computer-app.tsx`.
  Alterados: `src/server/computers/get-all.ts`, `_components/computers-columns.tsx`.
- **Nenhuma requisição nova para desenhar a tela.** `isOnline`, `updateStatus` e `latestVersion` vêm de
  carona na listagem que a tabela já busca; o componente lê o envelope da **mesma `queryKey`** pela cache do
  React Query, em vez de descer a versão publicada por props através das colunas.
- **Depende da `api-fr` com `POST /computers/update/:id`.** Contra uma API antiga, `updateStatus` não vem,
  a condição de exibição não é satisfeita e o botão simplesmente não aparece — a tabela não quebra.
- **A confirmação é do envio, não da troca.** Baixar ~60 MB, conferir assinatura e SHA-256, rodar o
  autoteste e reiniciar leva minutos. A prova de que deu certo é a versão nova aparecendo na coluna
  Desktop quando a estação voltar; o toast não promete mais do que isso.
- **Estação desconectada não vira fila.** A `api-fr` responde `409` e a máquina busca a versão sozinha na
  próxima partida — por isso o botão dela nasce travado, com o motivo no tooltip, em vez de disparar um
  pedido que morre no caminho.
- **Máquina em uso nunca é interrompida.** A trava é da API (`400`) e está espelhada na tela; a promessa
  aparece escrita no diálogo, porque é o que dá coragem para clicar no meio do expediente.
- **A ação é uma máquina por vez.** Não há "atualizar todas": o teto de disparos da `api-fr` é por
  computador (10 a cada 5 minutos) e o link da unidade é o que ele protege.
