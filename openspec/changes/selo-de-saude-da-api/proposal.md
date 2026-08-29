## Why

O cabeçalho do painel exibia um selo verde escrito **"All OK"**. Ele era `<Badge>` fixo no JSX: nunca
consultou nada, nunca mudou de cor, e continuaria verde com a API inteiramente fora do ar.

Isso é pior do que não ter selo nenhum. Um indicador que só sabe dizer "está tudo bem" treina quem
opera o balcão a confiar nele — e no dia da queda, o funcionário vê o selo verde, o advogado na sala vê
erro, e a suspeita cai no lugar errado. Um selo que mente é ruído com aparência de sinal.

A `api-fr` já expunha `GET /health`, e ela responde `200` sem tocar em nada: confirma que o processo
Fastify está de pé, mais nada. Ler o `/health` daqui resolveria só metade — com o banco fora, toda rota
de dado devolve `500` e o `/health` continua `200`. Por isso a `api-fr` ganhou uma rota de **prontidão**
separada, e é ela que este selo lê.

## What Changes

- **`PanelStatus` (componente novo)**: o selo vira cliente e consulta `GET /ready` a cada 30s, com três
  estados — `Verificando` (cinza) na primeira carga, `Tudo certo` (verde) e `Sem conexão` (vermelho).
  O cabeçalho continua Server Component; só o selo é cliente.
- **`getReadiness()` (módulo novo)**: chamada a `/ready` com **timeout próprio de 8s**. O cliente axios
  não tem `timeout` global — nas rotas de dado, esperar é melhor do que abortar uma leitura que ia
  chegar. Numa sonda é o contrário: requisição pendurada não é "carregando", é o sintoma.
- **`retry: false` e `staleTime: 0`** nesta query, contra os padrões do `QueryClient` (2 tentativas,
  60s). Repetir só atrasa a má notícia — a próxima batida de 30s já é a nova tentativa; e um `staleTime`
  maior que o intervalo faria o selo demorar a acusar a queda.
- **Data de impressão no padrão do painel**: a coluna "Impresso em" passa de `28/08/2026 às 14:32` para
  `28 ago. 2026 às 14:32`, igual a Salas, Colaboradores e Computadores. **O fuso fixo da Seccional foi
  preservado** — ver *Design*, é a parte não óbvia.
- **Select de salas do painel de liberação** de `sm:max-w-80` para `sm:max-w-96`.
- **`placeholder:text-sm` centralizado** em `Input` e `Textarea`, saindo das três tabelas que repetiam a
  classe. Textos auxiliares redundantes removidos de alguns formulários. Sem efeito funcional.

## Capabilities

### Added Capabilities
- `selo-de-saude-da-api`: o painel passa a informar, no cabeçalho, se a API consegue atender de
  verdade — distinguindo "não sei ainda", "consegue" e "não consegue".

## Impact

- Novo: `src/server/health/get-readiness.ts`,
  `src/app/(private)/_components/shared/panel-header/panel-status.tsx`.
- Alterado: `panel-header/index.tsx`, `constants/query-keys.ts`,
  `printers/_components/printers-columns.tsx`, `panel/_components/room-select.tsx`,
  `components/ui/input.tsx`, `components/ui/textarea.tsx`, e as três tabelas de administração.
- **Depende de `GET /ready` na `api-fr`**, que é change própria naquele repositório. Sem ela, o selo
  fica permanentemente em "Sem conexão" — o `404` cai no `isError`.
- **O selo não distingue `429` de queda.** Com 60/min por IP na `api-fr` e 2 perguntas por minuto por
  aba, o teto só é alcançado com mais de 30 abas do painel atrás do mesmo IP. Se a Seccional passar
  disso, os selos acusariam queda sem haver queda.
- **A verificação visual do selo em navegador não foi feita.** `tsc`, `biome` e `build` passam, e a rota
  foi testada ponta a ponta contra a API — inclusive com o banco fora —, mas o componente renderizado
  não foi conferido a olho.
