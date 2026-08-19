## Why

A change `painel-visao-da-sala` parou no meio do caminho: a faixa da sala lia a API, mas a grade de
computadores existia como peça solta — `ComputerCard`, `StatusSummary` e os dois diálogos compilavam sem
serem importados por tela alguma. O funcionário escolhia a sala e não via máquina nenhuma.

Esta change fecha a tela. A grade entra no ar com dados reais, e as quatro ações que o balcão precisa
passam a funcionar: liberar, encerrar, colocar em manutenção e devolver à operação.

Duas descobertas mudaram o plano que estava registrado:

**A liberação manual nunca esteve bloqueada.** O roadmap e a change anterior registravam "rota não existe
na API". Ela existe: `POST /lawyers/release-computer` é **pública** e recebe `macCode` — foi desenhada para
o Desktop, mas serve o painel sem alteração alguma. O diálogo pronto desde a change anterior ganhou destino.

**A rota de computadores não serve a esta tela.** `GET /computers/get-all` parece a fonte natural da grade,
mas chama `checkIfEmployeeIsAdmin()`: o funcionário comum, que é quem opera o balcão, tomaria `401`. Os
computadores continuam vindo embutidos em `GET /rooms/get-all`, com o escopo por papel já resolvido e numa
requisição só. `GET /computers/get-all` fica reservado à futura tela de inventário do ADMIN.

## What Changes

- **Grade de computadores no ar** (`_components/releases-board.tsx`, `computer-card.tsx`): ordenada por
  número, com os três estados derivados da API e as ações por estado.
- **Camada de dados das liberações** (`src/server/lawyers/get-all-releases.ts`): quem está em qual máquina,
  com saldo e horário de início.
- **Quatro mutações** (`src/server/lawyers/release-computer.ts`, `close-session.ts`,
  `src/server/computers/put-into-maintenance.ts`, `take-out-of-maintenance.ts`).
- **Tradução entre os dois modelos** (`_data/computer-view.ts`): junta o inventário da sala com as sessões
  abertas e resolve o `status` de três valores. Substitui `_data/rooms.ts`, que era dado fake e foi apagado.
- **Sala na URL** (`?sala=<roomId>`): a tela virou recarregável e compartilhável; `page.tsx` ganhou a
  fronteira de `Suspense` que `useSearchParams` exige no build.
- **Correção de tipo em `src/server/rooms/get-all.ts`**: `maintenance` e `inactive` são data ISO
  (`string | null`), não `boolean` — a API tipa os dois como `z.date()`.
- **`queryKeys.getReleases(roomId)`** somado ao catálogo de chaves.
- **Polling de 30s** nas liberações, porque o saldo é calculado no servidor.

## Capabilities

### Added Capabilities
- `operacao-das-maquinas`: ver o estado real de cada computador da sala e agir sobre ele — liberar um
  advogado, encerrar uma sessão em curso e mover a máquina para dentro e para fora da manutenção.

### Modified Capabilities
- `visao-da-sala`: o quadro deixa de terminar na seleção de sala. A sala escolhida passa a viver na URL, e
  as contagens por estado entram na faixa ao lado da cota.

## Impact

- Código novo: `src/server/lawyers/{get-all-releases,release-computer,close-session}.ts`,
  `src/server/computers/{put-into-maintenance,take-out-of-maintenance}.ts`,
  `src/app/(private)/panel/_data/computer-view.ts`.
- Alterado: `_components/{releases-board,computer-card,status-summary,release-computer-dialog,
  close-session-dialog}.tsx`, `panel/page.tsx`, `src/server/rooms/get-all.ts`, `src/constants/query-keys.ts`.
- Removido: `_data/rooms.ts` (dados fake, sem referência restante).
- **O relógio da tela anda de 30 em 30 segundos.** `usedMinutes` e `remainingMinutes` são calculados na
  API a cada requisição; entre um refetch e outro o saldo na tela está parado. Sem eventos de negócio no
  WebSocket, é o melhor disponível.
- **A máquina em uso não aceita manutenção.** A API recusa com `400`, então o card em uso não oferece a
  ação — a sessão tem de ser encerrada antes.
- **Sem paginação.** Nem `GET /rooms/get-all` nem `GET /lawyers/get-all-releases/:roomId?` paginam. Por
  sala o volume não pede; o histórico completo de liberações da sala trafega inteiro a cada 30s.
- **Continua sem tempo real.** O `notified: false` da liberação avisa quando a estação está offline, mas o
  painel não recebe eventos — só descobre no refetch seguinte.
