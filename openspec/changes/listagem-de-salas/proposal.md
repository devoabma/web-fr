## Why

A change `cadastro-de-salas` entregou o formulário e registrou a dívida no próprio texto: **quem cadastra
não vê o resultado na tela**. O administrador criava a sala, lia um aviso de sucesso e ficava sem
confirmação — a única defesa contra cadastro duplicado era o `400` da `api-fr`, não a interface. O item 7.1
das tarefas daquela change ("listar as salas na própria tela") e o 7.2 (ativar/inativar) são o que esta
change fecha.

Listar é também o que torna o `inactive` visível. A `api-fr` não apaga sala: `DELETE` não existe para esse
recurso, o que existe é `PATCH /rooms/activate/:id` e `/deactivate/:id`. Sem listagem, uma sala inativada
por outra via simplesmente sumia do seletor do painel sem nenhum lugar onde fosse possível reativá-la.

Esta é a primeira tabela de dados do painel. Como as outras quatro áreas administrativas (funcionários,
computadores, liberações, impressão) vão repetir o mesmo arranjo — buscar, paginar, agir na linha —, a
tabela nasce como primitiva do design system (`components/ui/data-table`), não como componente da tela de
salas.

## What Changes

- **Primitiva `DataTable`** (`components/ui/data-table/`) sobre TanStack Table **v9**, com paginação no
  cliente, seletor de linhas por página, esqueleto de carregamento por coluna e mensagem de vazio.
- **Componente `Table`** do shadcn adicionado ao design system (não existia).
- **Listagem em `/admin/rooms`**: nome, tempo padrão, descrição, status e data de criação, alimentada por
  `GET /rooms/get-all`.
- **Busca por nome** no cliente, acima da tabela — a `api-fr` não tem paginação nem filtro nessa rota.
- **Ativar / inativar sala**: `PATCH /rooms/activate/:id` e `/rooms/deactivate/:id`, cada sentido em seu
  próprio componente. Inativar pede confirmação e diz quantos computadores saem do quadro; reativar vai
  direto, por ser construtivo e reversível pelo botão ao lado.
- **`createdAt`** acrescentado ao tipo `RoomProps`, formatado com `date-fns`.
- **`formatDuration` / `formatMinutes`** em `utils/`: a leitura em horas do formulário virou utilitário
  compartilhado, agora que a tabela também precisa dela.
- **Cabeçalho da área responsivo**: abaixo de 640px o título e o botão empilham, e o botão ocupa a largura.

## Capabilities

### Added Capabilities
- `listagem-de-salas`: ver as salas cadastradas na própria área administrativa, buscar por nome, navegar por
  páginas e alternar a sala entre ativa e inativa sem sair da tela.

## Impact

- Novo: `src/components/ui/table.tsx`, `src/components/ui/data-table/index.tsx`,
  `src/components/ui/data-table/data-table-features.ts`,
  `src/components/ui/data-table/data-table-pagination.tsx`,
  `src/app/(private)/admin/rooms/_components/rooms-table.tsx`,
  `src/app/(private)/admin/rooms/_components/rooms-columns.tsx`,
  `src/app/(private)/admin/rooms/_components/activate-room.tsx`,
  `src/app/(private)/admin/rooms/_components/inactive-room.tsx`,
  `src/server/rooms/activate.ts`, `src/server/rooms/inactive.ts`.
- Alterado: `src/app/(private)/admin/rooms/page.tsx`, `src/server/rooms/get-all.ts`, `src/utils/index.ts`,
  `src/app/(private)/admin/rooms/_components/new-room.tsx`, `package.json`
  (`@tanstack/react-table`, `date-fns`).
- **Editar sala continua fora.** O botão de editar existe na linha e não faz nada: `PATCH /rooms/update/:id`
  ainda não foi encapsulado. É um gatilho sem ação, visível para o administrador.
- **Busca e paginação são do cliente.** `GET /rooms/get-all` devolve tudo de uma vez. Com dezenas de salas
  isso não pesa; é a mesma lacuna de paginação já registrada para funcionários e computadores, e a tabela
  vai precisar de paginação de servidor quando a API tiver.
- **A busca cobre só o nome.** Descrição e status ficam de fora do campo de busca.
- **A cor dos botões de alternância indica o estado, não a ação**: verde na sala ativa, vermelho na
  inativa. Quem lê a cor como "o que vai acontecer" entende ao contrário; o tooltip e o diálogo é que
  dizem a ação.
- Contagem e paginação leem o modelo pré-paginado, então o rodapé continua anunciando o total real da busca
  e não o tamanho da página.
