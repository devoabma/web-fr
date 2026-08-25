## Why

O parque é atualizado máquina a máquina. O instalador do Desktop roda na estação, e quem está no balcão só
descobre em que versão cada uma ficou indo até ela e olhando o `V` que o aplicativo desenha no canto da
própria tela. Numa sala de dez computadores isso são dez caminhadas.

O caso que dói não é a sala inteira desatualizada — essa é uma decisão consciente de quando atualizar. É a
**máquina que ficou para trás sozinha**: a atualização que falhou no meio, a estação que estava desligada
no dia da rodada, a que voltou para a versão anterior por conta própria depois de um erro. Ela continua
liberando sessão normalmente, então nada na operação denuncia o problema; ele aparece depois, como um
comportamento estranho que ninguém consegue reproduzir nas outras máquinas da mesma sala.

A `api-fr` passou a guardar a última versão informada por cada estação (commit `b01add1`): o Desktop manda o
número no `register` do WebSocket, a API grava junto com o carimbo de quando recebeu, e os dois campos já
vêm embutidos nos computadores de `GET /rooms/get-all` — a mesma resposta que a grade do painel já lê.

Esta change consome esses dois campos: cada cartão passa a dizer em que versão a estação está, e a que está
atrás das vizinhas da própria sala se destaca sozinha na grade.

## What Changes

- **`src/server/rooms/get-all.ts`**: `ComputerProps` ganha `appVersion` e `appVersionReportedAt`, ambos
  `string | null`, documentados — em especial o carimbo, que é de quando a estação **informou**, e não de
  quando esteve online.
- **`_data/computer-view.ts`**:
  - `ComputerVersionView` com o número, o carimbo e `isOutdated`;
  - `compareVersions`, comparação numérica segmento a segmento — comparar como texto poria `1.0.10` antes
    de `1.0.7` e apontaria a máquina errada;
  - régua da defasagem calculada por sala: a maior versão que alguma máquina daquela sala informou;
  - `ComputerView.version`, `null` quando a estação nunca informou.
- **`_components/computer-card.tsx`**: a versão aparece abaixo da pílula de estado, sempre visível na grade.
  Em âmbar quando está atrás das irmãs de sala; `v—` quando não há informação. O tooltip explica qual dos
  três casos é e, quando há carimbo, quando a estação se apresentou.

## Capabilities

### Modified Capabilities
- `operacao-das-maquinas`: a versão instalada na estação passa a ser informação visível da grade.

## Impact

- Alterado: `src/server/rooms/get-all.ts`, `_data/computer-view.ts`, `_components/computer-card.tsx`.
  Nenhum arquivo novo.
- **Nenhuma requisição nova.** Os campos vêm de carona na resposta que a grade já busca; o custo de rede é
  zero e o refetch existente atualiza a informação junto com o resto do cartão.
- **Depende da `api-fr` em `b01add1` ou posterior.** Contra uma API antiga os campos simplesmente não vêm,
  o valor cai em ausente e todos os cartões mostram `v—` — a grade não quebra nem mente.
- **A régua é a própria sala, não uma versão oficial.** O painel não sabe o que foi publicado. Sala inteira
  parada numa versão antiga não destaca ninguém, porque nenhuma máquina está abaixo do topo da sala. Sala
  com um computador só nunca destaca — não há com quem comparar.
- **O carimbo não vale como "vista por último".** A versão só viaja no `register`, isto é, a cada conexão.
  Estação semanas no ar sem cair mantém um carimbo antigo estando perfeitamente saudável. Quem responde
  quem está conectado agora continua sendo `GET /computers/online/:roomId`.
- **`v—` não é erro.** Ou a estação não conectou desde que a `api-fr` passou a guardar, ou está rodando um
  Desktop antigo que não manda o campo — a API ignora o envio ausente e não grava nada.
- **A informação é passiva.** Nada aqui atualiza, agenda ou cobra atualização de máquina nenhuma; o painel
  só mostra o que as estações informaram.
