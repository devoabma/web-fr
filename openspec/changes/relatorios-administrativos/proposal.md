## Why

A diretoria pergunta coisas que o painel sabe responder mas não sabe entregar: *quantos e quais
advogados usaram a Sala 2 em março?* Hoje `/admin/reports` é casca — cabeçalho, aviso e um bloco
tracejado dizendo que os relatórios estão sendo construídos.

`/metrics` chegou perto e parou antes. Ela responde **quanto** (contagens do ano), mas não serve como
relatório por quatro motivos: recorta por ano fechado, sem dia nem intervalo; devolve contagem por
advogado, não a **lista nominal** com primeiro acesso, último acesso e tempo consumido; recorta por
papel, então cada MEMBER vê um número diferente; e não exporta nada. Ninguém leva uma tela para a
reunião da diretoria — leva um arquivo.

## What Changes

- **Três relatórios em `/admin/reports`**, sobre a mesma barra de filtros:
  - **Advogados por sala** — o pedido da diretoria. Uma linha por advogado, com nome, inscrição,
    número de acessos, primeiro e último acesso e tempo consumido no período.
  - **Movimento por sala** — comparativo entre salas: liberações, advogados distintos, tempo
    ocupado, tempo médio e fatia do movimento. Inclui as salas paradas.
  - **Ranking de advogados** — recorrência: quem mais volta, em quantas salas diferentes, com que
    frequência. É o corte transversal que o primeiro, preso a uma sala, não dá.
- **Filtro de período próprio dos relatórios**: **Dia**, **Mês**, **Ano** e **Intervalo** livre. O
  `PeriodFilter` compartilhado (hoje / ontem / últimos 7 dias) não sabe dizer "março de 2025", que é
  exatamente como a diretoria pergunta. Dia e intervalo usam o `Calendar` do shadcn em português do
  Brasil; mês e ano usam `Select`, porque numa grade de dias escolher "março de 2025" obrigaria a
  clicar num dia qualquer para significar o mês inteiro.
- **Exportação em `.xlsx` e PDF**, um botão por relatório. O PDF sai com a **marca do Sala Livre**,
  período e sala impressos — documento que se anexa a processo, não captura de tela.
- **Agregação no cliente** a partir de `GET /lawyers/get-all-releases`, com uma única consulta em
  cache servindo os três relatórios e todas as trocas de filtro. Ver `design.md`: é a inversão
  deliberada da decisão tomada em `metricas-de-liberacoes`, e o porquê está lá.
- **Correção de promessa falsa no cabeçalho da tela.** O texto atual anuncia relatórios "por período,
  sala e **colaborador**". O dado não existe: `computer_sessions` guarda `computer_id` e `lawyer_id`,
  e `release-computer.ts` cria a sessão sem registrar quem a autorizou. **O banco não sabe qual
  funcionário atendeu.** O texto passa a prometer só o que a tela entrega.
- **Impressões ficam de fora**, por ora. O cron `delete-weekly-prints` limpa o histórico toda
  sexta-feira: um "relatório de impressões de 2025" seria um documento oficial com número errado.

## Capabilities

### New Capabilities
- `relatorios-administrativos`: a tela exclusiva da administração que recorta as liberações por dia,
  mês, ano ou intervalo e produz três relatórios exportáveis em Excel e PDF, com a lista nominal dos
  advogados atendidos em cada sala.

### Modified Capabilities
<!-- Nenhuma. `openspec/specs/` está vazio (as changes anteriores ainda não foram sincronizadas), e
     esta change não altera requisito de nenhuma capacidade existente: `/metrics` continua como está. -->

## Impact

- Novo: `src/app/(private)/admin/reports/_components/` (barra de filtros, seletor de período, os três
  relatórios e os botões de exportação), `src/app/(private)/admin/reports/_data/` (view-model das
  agregações e o recorte de período), `src/lib/export/` (geradores de `.xlsx` e PDF).
- Alterado: `src/app/(private)/admin/reports/page.tsx` (subtítulo sem a promessa de "colaborador") e
  `src/app/(private)/admin/reports/_components/reports-notice.tsx` (ganha o aviso de que o tempo é
  contado só sobre sessões encerradas).
- Reusado sem alteração: `getAllReleases`, `getAllRooms`, `RoomFilter`, `DataTable`, `queryKeys`.
- **Dependências novas de exportação, todas carregadas sob demanda** (`dynamic import`, só ao clicar
  em exportar — não pesam no carregamento da tela): `write-excel-file` para o `.xlsx`, `jspdf` +
  `jspdf-autotable` para o PDF.
- **Dependência nova de interface**: `calendar` e `popover` do shadcn, que trazem `react-day-picker`.
  Esta entra no bundle da tela, e é a única que entra.
- **`pnpm-workspace.yaml` ganha `core-js: false`**: o `jspdf` arrasta `canvg` → `core-js`, cujo
  postinstall (um banner de doação) fazia `pnpm install` falhar com `ERR_PNPM_IGNORED_BUILDS` em
  clone limpo e em CI. Mesmo tratamento que `sharp` e `unrs-resolver` já tinham.
  - `exceljs` foi descartado: parado desde dezembro de 2024 e arrasta nove dependências.
  - `xlsx` (SheetJS) foi descartado: o pacote no npm está congelado em `0.18.5`, a versão com o CVE
    de *prototype pollution* — a biblioteca saiu do registry e hoje é distribuída pelo CDN próprio.
- **A tela é somente leitura**, como `/releases` e `/metrics`. Nenhum número leva a uma ação.
- **A tela é de ADMIN e enxerga todas as salas** — é o que o `reports-notice` já declara, e é o que
  torna o relatório um documento único: dois diretores lendo o mesmo período veem o mesmo número.

### Dívida que esta change deixa registrada na `api-fr`

Nenhum dos dois itens bloqueia a entrega, e os dois deveriam virar change no repositório irmão:

1. **`get-all-releases` não aceita recorte de data nem pagina.** O relatório de um único dia baixa o
   histórico inteiro para descartar 99% dele. Enquanto o volume for de dezenas de milhares de
   sessões numa tela administrativa esporádica, o custo se paga; ele cresce junto com o passado da
   Seccional. A saída é um recorte `?de=&ate=` na rota, ou uma rota `/reports` agregada.
2. **`computer_sessions` não registra o funcionário que liberou.** Sem uma coluna `employee_id` não
   existe relatório de produtividade por colaborador, nem auditoria de quem autorizou uma liberação
   fora do padrão.
