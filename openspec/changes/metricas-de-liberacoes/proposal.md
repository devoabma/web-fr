## Why

`/metrics` existia como casca: cabeçalho, aviso e um bloco tracejado dizendo que os indicadores
estavam sendo construídos. O painel respondia *quem está usando agora* (`/panel`) e *o que já
aconteceu* (`/releases`), mas não respondia **quanto** — que salas concentram a demanda, se o
movimento cresceu, quem são os advogados que mais voltam.

O `docs/ROADMAP.md` da `api-fr` marcava "Uso por sala e computador" e "Tempo médio por sessão" como
⛔ *bloqueado: não implementado na API*. A verificação confirmou: não havia `groupBy`, `aggregate`
nem `_count` em lugar nenhum do servidor.

Dava para contar tudo no cliente a partir de `GET /lawyers/get-all-releases`, como o histórico já
faz. Mas o gráfico "por ano" precisa do histórico **inteiro**, sem recorte de data — e essa rota não
pagina. Nos números do próprio desenho da tela (~28 mil sessões) isso é da ordem de 11 MB de JSON
baixados e percorridos no navegador a cada visita, para produzir quatro números. A change irmã
`aggregate-release-metrics`, na `api-fr`, move a contagem para o Postgres.

## What Changes

- **Nova tela `/metrics`**: quatro indicadores no topo e quatro recortes — por ano, por mês, por
  sala e por advogado.
- **`getReleasesMetrics(roomId?, year?)`**: acesso à rota agregada nova. Devolve ~5 KB prontos no
  lugar do histórico bruto.
- **Dois filtros na URL**: `?ano=` e `?sala=`. Os dois decidem *o que* a `api-fr` agrega, então
  precisam sobreviver ao recarregar e ao compartilhar o link — mesmo critério do `?sala=` das
  outras telas de histórico.
- **Gráficos com `recharts`**, via o `chart` do shadcn — primeira dependência de gráfico do projeto.
- **Rankings sem `recharts`**: sala e advogado são listas com barra proporcional em CSS. Não são
  séries num eixo; são comparações lado a lado com nome, contagem e percentual.
- **Ranking completo de advogados num Drawer**, aberto pelo "Ver todos". O card mostra os dez
  primeiros; a rota já devolve a lista inteira, então não há segunda chamada.
- **`components.json` corrigido**: apontava `tailwind.css` para `src/app/globals.css`, que não
  existe — o arquivo real é `src/styles/globals.css`. Qualquer `shadcn add` mexeria no lugar errado.
- **`ReleaseProps` ganha `lawyer.oab`**, acompanhando a mudança aditiva da `api-fr`.

## Capabilities

### Added Capabilities
- `metricas-de-liberacoes`: a tela que resume a demanda pelas salas em indicadores e quatro recortes
  de contagem, com filtro de ano e de sala, ranking completo de advogados em painel lateral e
  estados de vazio explicados pela causa.

## Impact

- Novo: `src/app/(private)/metrics/_components/` (`metrics-board`, `metric-kpi-card`, `year-filter`,
  `releases-by-year-chart`, `releases-by-month-chart`, `chart-value-label`, `releases-by-room-card`,
  `releases-by-lawyer-card`, `lawyer-ranking-row`, `lawyers-ranking-drawer`),
  `src/app/(private)/metrics/_data/metrics-view.ts`,
  `src/server/lawyers/get-releases-metrics.ts`,
  `src/components/ui/` (`chart.tsx`, `card.tsx`, `progress.tsx`).
- Alterado: `src/app/(private)/metrics/page.tsx`, `src/constants/query-keys.ts`,
  `src/server/lawyers/get-all-releases.ts`, `components.json`.
- Mantido: `_components/metrics-notice.tsx` — o texto já dizia o certo sobre o recorte por papel e
  sobre os números não serem registro oficial.
- Dependência nova: `recharts`. O `chart` do shadcn é um invólucro de tema sobre ele e **não traz
  Radix**, então convive com o estilo `base-nova`/`@base-ui/react` deste projeto.
- **A tela é somente leitura**, como o histórico. Nenhum indicador leva a uma ação.
- **`byRoom` ignora o filtro de sala de propósito.** É um ranking *entre* salas; filtrado, viraria uma
  única barra em 100%, que não informa nada. O subtítulo do card diz isso em voz alta.
- **A sigla da seccional é derivada, não fixa.** O model `Lawyers` da `api-fr` não guarda UF — quem
  tem `uf` é a sala. Quando todas as salas visíveis são da mesma seccional, o rótulo vira `OAB/MA`;
  havendo mistura, fica só `OAB`. Cravar a sigla no código quebraria a marca branca.
- **O delta compara com o mesmo período do ano anterior** e some quando não há base: dividir por zero
  imprimiria "+∞%", e o primeiro ano de operação cairia sempre nesse caso.
- **Mês futuro mostra `—`, não `0`.** Zero afirmaria que ninguém usou a sala em dezembro.
