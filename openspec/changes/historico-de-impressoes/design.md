## Context

A rota `GET /printers/get-all/:roomId?` já existia na `api-fr` e já resolvia o escopo por papel: `ADMIN`
enxerga todas as salas, `MEMBER` só aquelas em que está vinculado. O trabalho aqui foi de tela — decidir o
que mostrar, em que ordem, e o que dizer sobre o que a lista **não** conta.

## Decisões

### O escopo por papel não é reimplementado no cliente

Sem `roomId`, a rota devolve exatamente o que aquele funcionário pode ver. É isso que a opção "Todas as
salas" usa: nenhum `if (role === 'ADMIN')` na tela. Repetir a regra no cliente criaria uma segunda fonte de
verdade que envelheceria sozinha — e que, sendo cliente, não protege nada.

### A sala vive na URL; período e busca, não

A distinção é o que cada filtro faz. A sala decide **o que a tela carrega** da `api-fr` — é uma chave de
consulta, e uma tela recarregada ou um link colado no chat do balcão têm de voltar à mesma sala. Período e
busca só **estreitam o que já está na mão**; guardá-los na URL encheria o endereço de estado que não muda
requisição nenhuma.

Um `?sala=` inválido — id inexistente, sala inativa, ou sala que aquele funcionário não enxerga — cai em
"todas as salas". A alternativa seria uma tela vazia com um erro, e o histórico não tem por que sumir
porque um parâmetro envelheceu.

### Os filtros rodam no cliente, e isso é uma escolha com prazo

A rota aceita `?lawyer=`, `?startDate=` e `?endDate=`. A tela não os usa. Duas razões:

1. **A lista já está inteira na mão.** A `api-fr` não pagina. Mandar a busca ao servidor trocaria um filtro
   instantâneo por uma ida à rede a cada tecla, sobre dados que o navegador já tem.
2. **A busca do cliente cobre mais.** Ela alcança advogado, computador **e** sala; o `?lawyer=` cobre só o
   primeiro.

**Quando isso deixa de valer:** no dia em que a rota paginar. Aí o cliente passa a ver uma página, filtrar
localmente vira mentira, e os três parâmetros da query são o caminho pronto. O ponto de troca é o
`queryFn` — daí a chave `getPrinters(roomId)` já ser parametrizada.

### O fuso é o da Seccional, não o do navegador

Tanto a coluna de data quanto o corte dos períodos usam `America/Fortaleza` fixo. A impressão aconteceu no
balcão: uma enviada às 22h precisa aparecer no dia em que foi enviada, e não no seguinte porque alguém
abriu o painel de outro fuso. Sem isso, "hoje" seria uma pergunta sobre o relógio de quem olha.

Os períodos comparam **chaves de dia** em `en-CA` (`2026-08-27`), não instantes. Nesse formato a ordem
lexicográfica é a ordem cronológica, então "últimos 7 dias" é um `>=` de strings — sem aritmética de
`Date`, que é onde o fuso costuma escapar. A janela conta com o dia de hoje: `now - 6 dias`, senão "últimos
7 dias" mostraria oito.

### A lista vazia tem três causas, e três saídas

Vazio porque não há nada guardado, porque a busca não achou, ou porque o período não alcança. Cada um pede
uma ação diferente de quem está olhando: esperar, corrigir o texto, ampliar o período. Uma mensagem única
("nenhum resultado") faria as três parecerem a primeira, que é a única sem saída.

### O botão de abrir é um link de verdade

O arquivo está no Storage, em outro domínio. `<a download>` entre origens é ignorado pelo navegador — o
atributo estaria ali mentindo. Um `<a target="_blank">` vestido de botão faz o que promete: abre o arquivo,
e de lá o usuário salva, imprime de novo ou copia o endereço. Sendo link, ganha de graça o menu de
contexto, o "abrir em nova janela" e a lista de links da página para quem navega por leitor de tela — daí o
`aria-label` começar pelo verbo e terminar pelo nome, que é o que diferencia uma linha da outra.

### Só as salas seguram a tela; as impressões não

Enquanto as salas carregam, a toolbar inteira fica em esqueleto: são elas que dizem qual sala está
selecionada, e renderizar o seletor antes disso o faria mostrar "Todas as salas" para pular à sala da URL um
instante depois. A espera pelas impressões, essa, é a própria tabela quem mostra — o layout não sai do
lugar.

Pelo mesmo motivo a consulta de impressões espera as salas (`enabled: !isPendingRooms`): antes disso um
`?sala=` na URL ainda não virou id validado, e buscar agora traria o histórico inteiro para trocá-lo pelo da
sala em seguida, gastando dois requests.

**Se as salas falharem**, a tela não cai: sem `roomId` a rota já devolve tudo o que o funcionário pode ver.
O que se perde é o filtro por sala — e isso é dito em um aviso, porque um seletor vazio sem explicação é
pior que a falha.

### A contagem espera a lista

Contar antes de os dados chegarem escreveria "00 impressões" a cada troca de sala. Zero é uma afirmação,
não uma espera — por isso a contagem vira esqueleto enquanto a consulta corre. O total ao lado
("· 42 no total") só aparece quando algum filtro está de fato escondendo linhas.

## Riscos

- **Um `useMemo` que lê `Date.now()`** não recalcula sozinho. Uma tela deixada aberta atravessando a
  meia-noite continua chamando de "hoje" o dia anterior, até a próxima interação. O balcão fecha antes
  disso; se algum dia a tela ficar aberta 24h, vira defeito.
- **Sem paginação na `api-fr`**, o volume da lista cresce até o expurgo de sexta. A paginação da tabela
  segura a renderização, mas a resposta inteira trafega.
- **A URL do arquivo é a do Storage.** Se ela expirar ou exigir credencial, o botão "Abrir" falha fora do
  alcance desta tela — não há como distinguir isso de um arquivo apagado.
