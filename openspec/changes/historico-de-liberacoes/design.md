## Context

`GET /lawyers/get-all-releases/:roomId?` já existia e já resolvia o escopo por papel. O painel de
operação a consumia desde `saldo-ao-vivo-na-grade`, mas com sala obrigatória e olhando só para as
sessões abertas — o histórico inteiro trafegava e era descartado no `filter`.

Duas coisas mudaram: a sala virou opcional na função de acesso, e o que era descartado virou a tela.

## Decisões

### O desfecho da sessão é derivado, não lido

A `api-fr` não tem um campo "status". Ela devolve `endDate` (nulo enquanto aberta) e `usedAllTime`. A
auditoria pergunta outra coisa: *como isso terminou?* — e a resposta é a combinação dos dois:

- `endDate === null` → **em andamento**;
- fechada com `usedAllTime` → **tempo esgotado**, a API fechou sozinha no `expiresAt`;
- fechada sem `usedAllTime` → **encerrada**, alguém interveio no balcão.

A distinção entre os dois últimos é a que tem valor: ela separa o fluxo normal da exceção, que é
exatamente o que se procura num histórico.

### A duração das sessões abertas envelhece, e é corrigida na tela

`usedMinutes` e `remainingMinutes` vêm calculados do servidor. Para uma sessão fechada o número
congelou junto com ela; para uma aberta, o tempo de tela continua correndo. `buildReleaseViews` recebe
os minutos decorridos desde a resposta (`useElapsedMinutes`, o mesmo do painel de operação) e desconta
— o relógio anda sem uma requisição por minuto.

**A cota zerada na tela não fecha a sessão.** Ela vira `usedAllTime`, porque a API encerra por conta
própria quando o `expiresAt` chega e o refetch seguinte só confirma. Mas o status continua "em
andamento": o encerramento é da API, e anunciá-lo antes mostraria como fechada uma sessão em que ainda
há alguém sentado.

### Só a sala vive na URL

Mesma regra das impressões, e pelo mesmo motivo: a sala decide **o que a tela carrega** — é chave de
consulta, e um link colado no chat do balcão tem de voltar à mesma sala. Período, situação e busca só
**estreitam o que já está na mão**.

Um `?sala=` inválido cai em "todas as salas". Uma auditoria não tem por que ficar vazia porque um
parâmetro envelheceu.

### Sala inativa continua no filtro — ao contrário das impressões

Impressões filtram `!room.inactive`, porque não se imprime numa sala fora de operação. Liberações não:
a sala saiu de operação, mas as sessões que aconteceram nela continuam sendo registro. Esconder a sala
esconderia o passado dela junto — e é justamente o passado que esta tela existe para mostrar.

Isso não virou parâmetro do componente compartilhado. Cada tela filtra a própria lista antes de passar;
o `RoomFilter` mostra o que recebe. Um `showInactive` embutiria no controle uma regra que é da tela.

### A contagem por situação e a filtragem por situação usam recortes diferentes

Os ladrilhos ("3 em andamento · 12 com tempo esgotado · 8 encerradas") contam o conjunto já estreitado
por período e busca, mas **inteiro quanto ao estado**. Se eles contassem o resultado final, escolher
"em andamento" zeraria os outros dois — e o ladrilho deixaria de ser a leitura de relance que justifica
sua existência para virar um eco do filtro.

Daí as duas etapas: `scopedReleases` (período + busca) alimenta a contagem, e `filteredReleases`
(+ situação) alimenta a tabela.

### A lista vazia tem quatro causas, e a situação fala por último

Nada registrado, busca sem resultado, período sem alcance, situação inexistente no recorte. A ordem das
verificações importa: a situação é o filtro mais estreito, então ela sobrescreve as outras mensagens.
Dizer "amplie o período" quando o que zerou a lista foi pedir só as sessões em andamento mandaria a
pessoa mexer no controle errado.

### A tela não encerra sessão

O painel de operação encerra; esta lista. A tentação é óbvia — a linha "em andamento" está ali, com o
botão a um passo —, e é por isso que o aviso do topo diz explicitamente para usar o painel. Duas telas
capazes de encerrar sessão é um caminho a mais para o clique errado sobre um advogado que está usando
a máquina agora.

### Os filtros no cliente aqui não são uma escolha com prazo

Nas impressões, filtrar no cliente foi decisão consciente sobre uma rota que aceita `?lawyer=`,
`?startDate=` e `?endDate=`. Aqui a rota não aceita nada além do `roomId` no caminho, e não pagina. Não
há para onde empurrar o trabalho — a lista chega inteira porque é assim que a API a serve.

### Os filtros compartilhados nasceram da segunda tela, não da primeira

`room-filter` e `period-filter` viviam em `printers/_components/`. Duas telas de histórico com o mesmo
seletor de sala, o mesmo seletor de período e o mesmo corte por fuso justificaram a extração para
`_components/shared/filters/` — e é o que transformou `printers-board` em `printers-table`.

O que **não** foi compartilhado: o `StatusFilter`, que é só das liberações, e a busca, que é três
linhas de JSX com campos diferentes em cada tela. Compartilhar aquilo seria abstrair por simetria.

## Riscos

- **Sem expurgo e sem paginação, o histórico só cresce.** Impressões somem toda sexta; sessões ficam
  para sempre. A paginação da tabela segura a renderização, mas a resposta inteira trafega — e o
  problema chega antes aqui do que nas impressões.
- **Um `useMemo` que lê `Date.now()`** não recalcula sozinho: a tela aberta atravessando a meia-noite
  continua chamando de "hoje" o dia anterior até a próxima interação. Mesma limitação das impressões.
- **A situação é derivada de dois campos.** Se a `api-fr` passar a fechar sessão por um terceiro motivo
  sem marcar `usedAllTime`, ela aparecerá como "encerrada no balcão" — que é a leitura errada.
