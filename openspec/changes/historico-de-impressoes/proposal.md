## Why

A navegação já listava "Impressões", e o item caía na 404. Era a última das cinco áreas prometidas pela
barra lateral que ainda não existia.

O que falta ao balcão é concreto: um advogado envia um arquivo da estação e volta ao guichê pedindo a
impressão. Hoje não há onde olhar. Quem atende precisa saber **quem** imprimiu, **de qual máquina**,
**quando** — e chegar ao arquivo.

Há uma pressa embutida nisso: a `api-fr` apaga os arquivos enviados **toda sexta-feira às 23:59**
(`delete-weekly-prints.cron.ts`). Uma tela que não diga isso deixaria o balcão descobrir o expurgo no dia em
que precisasse de algo que já não existe mais.

## What Changes

- **Nova tela `/printers`**, com o histórico de impressões que o funcionário tem permissão para ver.
- **Aviso de expurgo semanal** no topo, junto do escopo por papel — as duas coisas que mudam o que a tela
  significa e não se deduzem olhando a lista.
- **Três filtros numa toolbar**: sala, período e busca por texto. A sala vive na URL; período e busca ficam
  no estado.
- **Tabela com cinco colunas** — advogado, sala, computador, data/hora e a ação de abrir o arquivo. O
  arquivo abre em aba nova, não baixa.
- **Contagem do resultado** ao pé da toolbar, com o total quando algum filtro estiver escondendo linhas.

## Capabilities

### Added Capabilities
- `historico-de-impressoes`: a tela que lista o que foi enviado para impressão, com escopo por papel,
  filtros de sala, período e texto, acesso ao arquivo e o aviso do expurgo semanal.

## Impact

- Novo: `src/app/(private)/printers/page.tsx` e `_components/` (`printers-board`, `printers-columns`,
  `printers-notice`, `room-filter`, `period-filter`), `src/server/printers/get-all.ts`.
- Alterado: `src/constants/query-keys.ts` (chave `getPrinters`).
- **A tela é somente leitura.** Não há o que editar numa impressão já registrada, e a `api-fr` não expõe
  nada além da consulta.
- **O "baixar" do roadmap virou "abrir".** O arquivo está no Storage, em outro domínio; o atributo
  `download` seria ignorado pelo navegador. Abrir em aba nova é o que de fato acontece — de lá o usuário
  salva ou imprime.
- **Os filtros rodam no cliente, com a rota do servidor já suportando parte deles.** Decisão consciente,
  registrada em `design.md`; a troca fica para quando a listagem paginar.
- **Nada de paginação própria**: a `api-fr` devolve a lista inteira e a paginação é a da tabela.
