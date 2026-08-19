## Why

A rota `/panel` existia desde a change `shell-do-painel`, mas como placeholder: um `<h1>PanelPage</h1>`
dentro de uma moldura completa. O painel tinha barra superior, sidebar, sessão e menu do usuário — e nada
para operar. O item 3.11 do roadmap registrava exatamente isso.

A primeira tela de operação é a visão da sala, porque é ela que responde à pergunta feita no balcão:
*"tem máquina livre?"*. Todo o resto do painel (impressão, histórico, inventário) só faz sentido depois
que o funcionário consegue ver a sala em que trabalha.

O funcionário não escolhe a sala de uma lista global: a `api-fr` já devolve em `GET /rooms/get-all` apenas
as salas do escopo dele (`ADMIN` vê a Seccional inteira, `MEMBER` vê as salas em que está vinculado). O
painel não precisa filtrar por permissão — precisa apenas apresentar bem o que chega, inclusive quando
chega vazio.

Também há uma regra de negócio que a tela precisa comunicar antes de qualquer botão: **o advogado se libera
sozinho, na própria máquina**. Esta tela é a exceção, não o caminho principal. Sem esse aviso, o
funcionário assume que precisa liberar todo mundo manualmente.

## What Changes

- **Tela `/panel` deixa de ser placeholder**: cabeçalho com título e subtítulo, aviso de uso e o quadro da
  sala (`page.tsx`, `_components/releases-notice.tsx`, `_components/releases-board.tsx`).
- **Seleção de sala integrada** (`src/server/rooms/get-all.ts` + `_components/room-select.tsx`): React Query
  sobre `GET /rooms/get-all`, sala inativa fora da lista, primeira sala ativa assumida como padrão.
- **Colaboradores da sala** (`_components/room-employees.tsx`): fileira de avatares deduplicada por
  funcionário, com excedente em contador e nomes no tooltip.
- **Primitivos novos**: `src/components/ui/select.tsx`, `dialog.tsx` e `alert-dialog.tsx`, no estilo
  `base-nova` sobre `@base-ui/react`.
- **Peças da grade de computadores, ainda com dados fake** (`_components/computer-card.tsx`,
  `status-summary.tsx`, `release-computer-dialog.tsx`, `close-session-dialog.tsx`,
  `release-computer-schema.tsx`, `_data/rooms.ts`): construídas e tipadas, **não montadas** no quadro.
- **Máscara de data de nascimento** (`src/utils/masks/birth-date.ts`), ao lado da máscara de CPF já
  existente.
- **`queryKeys.getRooms()`** somado ao catálogo de chaves do React Query.
- **`min-w-[96px]` → `min-w-24`** no `dropdown-menu.tsx`: valor arbitrário trocado pela escala do Tailwind.

## Capabilities

### Added Capabilities
- `visao-da-sala`: a primeira tela de operação do painel — escolher a sala, ver quem responde por ela e
  entender a cota do dia antes de agir sobre qualquer máquina.

## Impact

- Código novo: `src/server/rooms/get-all.ts`, `src/app/(private)/panel/_components/*`,
  `src/app/(private)/panel/_data/rooms.ts`, `src/components/ui/{select,dialog,alert-dialog}.tsx`,
  `src/utils/masks/birth-date.ts`.
- Alterado: `src/app/(private)/panel/page.tsx`, `src/constants/query-keys.ts`,
  `src/components/ui/dropdown-menu.tsx`.
- **A grade de computadores não está no ar.** `ComputerCard`, `StatusSummary` e os dois diálogos existem,
  compilam e não são importados por nenhuma tela. O quadro para na seleção de sala.
- **Dois modelos de computador convivem.** O quadro já lê o formato da API (`inUse: boolean`,
  `maintenance: boolean | null`); as peças da grade leem o formato fake (`status: 'available' | 'in-use' |
  'maintenance'`). Montar a grade exige antes uma tradução entre os dois — ver `design.md`.
- **Liberar manualmente continua bloqueado.** O diálogo de liberação e seu schema estão prontos, mas a
  `api-fr` não expõe rota de liberação manual. O formulário valida e não tem para onde enviar.
- **Sem paginação e sem tempo real.** `GET /rooms/get-all` devolve tudo de uma vez e o painel não recebe
  eventos: a tela mostra o estado do momento da requisição.
- O `standardTime` é a cota **da sala**, não o saldo do advogado. A tela diz "por dia nesta sala"
  justamente para não sugerir que é um crédito individual por máquina.
