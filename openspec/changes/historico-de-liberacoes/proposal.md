## Why

`/releases` era a **última rota da barra lateral que ainda caía na 404**. Com ela, as cinco áreas
prometidas pela navegação passam a existir.

O painel de operação mostra o agora: quem está em cada máquina, quanto tempo falta. O que ele não
responde é o depois. *Aquele advogado esteve aqui ontem? Quanto tempo usou? A sessão acabou por tempo
ou alguém encerrou no balcão?* Sem essa tela, cada pergunta dessas terminava no banco.

A rota `GET /lawyers/get-all-releases/:roomId?` já servia o painel de operação — mas o front a chamava
sempre com sala obrigatória, filtrando `endDate === null` e jogando fora o resto. O histórico inteiro
já chegava pela rede e era descartado a cada requisição.

## What Changes

- **Nova tela `/releases`**, com o histórico completo de sessões que o funcionário pode ver.
- **`getAllReleases(roomId?)` passa a aceitar sala opcional**, montando o caminho com ou sem ela — é o
  que a opção "Todas as salas" usa. O painel de operação continua passando a sala.
- **Situação da sessão derivada no cliente** (`_data/release-view.ts`): `in-progress`, `exhausted` ou
  `closed`. A `api-fr` devolve `endDate` e `usedAllTime`; o desfecho que a auditoria procura é a
  combinação dos dois.
- **Duração que anda sozinha** nas sessões abertas, pelo mesmo `useElapsedMinutes` do painel de
  operação — o cálculo é do servidor e envelhece parado na tela.
- **Quatro filtros numa toolbar**: sala, período, situação e busca. Só a sala vive na URL.
- **Ladrilhos de contagem por situação**, para a leitura de relance sem percorrer a coluna.
- **Seis colunas**: advogado, sala, computador, liberado em, duração e situação.
- **Filtros de sala e período extraídos para `_components/shared/filters/`**, agora usados pelas duas
  telas de histórico. `printers-board.tsx` vira `printers-table.tsx` ao adotá-los.

## Capabilities

### Added Capabilities
- `historico-de-liberacoes`: a tela que lista todas as sessões já abertas, com o desfecho de cada uma,
  filtros de sala, período, situação e texto, e a duração das sessões em curso andando na tela.
- `filtros-compartilhados-de-historico`: os controles de sala e de período que as telas de histórico
  reusam, com o recorte de período calculado no fuso da Seccional.

## Impact

- Novo: `src/app/(private)/releases/` (`page.tsx`, `_components/releases-table`, `releases-columns`,
  `releases-notice`, `status-filter`, `_data/release-view`),
  `src/app/(private)/_components/shared/filters/` (`room-filter`, `period-filter`, `match-period`).
- Alterado: `src/server/lawyers/get-all-releases.ts` (sala opcional),
  `src/app/(private)/printers/page.tsx`.
- Removido: `src/app/(private)/printers/_components/printers-board.tsx`, `room-filter.tsx`,
  `period-filter.tsx` — substituídos por `printers-table.tsx` e pelos filtros compartilhados.
- **A tela é somente leitura.** Liberar e encerrar continuam sendo do painel de operação, e o aviso do
  topo diz isso — duas telas capazes de encerrar sessão seria um caminho a mais para o clique errado.
- **A extração dos filtros não muda o comportamento das impressões.** A lista de períodos padrão exclui
  os 30 dias, que é o que aquela tela já oferecia; o rótulo de "todo o período" continua sendo
  sobrescrito ali para "desde a última limpeza".
- **Sala inativa continua no filtro das liberações**, ao contrário das impressões. A sala saiu de
  operação, mas as sessões que aconteceram nela continuam valendo como registro.
- **Os filtros rodam no cliente.** A rota não pagina e não aceita filtro algum — nem por advogado, nem
  por data —, então não há para onde empurrar o trabalho. Diferente das impressões, aqui isso não é
  escolha: é o contrato.
- **O histórico cresce sem expurgo.** Impressões somem toda sexta; sessões, não. O dia em que a lista
  ficar grande demais é o dia em que a `api-fr` precisa paginar.
