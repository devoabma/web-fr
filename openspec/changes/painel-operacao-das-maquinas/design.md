## Context

A change anterior deixou a tela pela metade de propósito: o método do repositório é montar com dados fake,
acertar o desenho e só então trocar a fonte. Esta change faz a troca e liga as ações.

O ponto de partida foi uma pergunta de rota: a grade deve ler `GET /computers/get-all` ou os computadores
embutidos em `GET /rooms/get-all`? A resposta decidiu a arquitetura da tela inteira.

## Goals / Non-Goals

**Goals**
- Grade real, ordenada e estável, com os três estados derivados da API.
- As quatro ações do balcão funcionando, com erro e pendência visíveis em cada uma.
- A sala escolhida sobrevivendo a um recarregamento.
- Nenhuma ação oferecida que a API vá recusar.

**Non-Goals**
- Tempo real. Sem eventos de negócio no WebSocket, polling.
- Paginação — a API não oferece em nenhuma das duas rotas.
- Inventário (criar, editar, excluir computador): é tela de ADMIN, e aí sim `GET /computers/get-all`.
- Histórico de sessões encerradas. A rota já traz tudo, mas a tela só usa as abertas.

## Decisions

### A grade lê a sala, não a rota de computadores

`GET /computers/get-all` chama `checkIfEmployeeIsAdmin()`. O painel é operado por `MEMBER` — a grade
simplesmente não carregaria. Isso encerra a discussão sozinho, mas há mais três razões:

1. Os computadores já chegam em `GET /rooms/get-all`, dentro da sala selecionada. Uma segunda requisição
   buscaria o que já está em memória.
2. Duas fontes divergem. O `Select` viria de uma requisição e a grade de outra; basta uma revalidar antes
   da outra para a tela mostrar a sala A com os computadores da sala B.
3. O escopo por papel já vem resolvido no servidor. Em `/computers/get-all` seria preciso mandar `roomId`
   na mão, sem validação de vínculo.

O que `/computers/get-all` tem a mais — `room: { id, name }` e filtro por descrição — é exatamente o que
falta numa tela de inventário e sobra numa tela de sala.

### `maintenance` e `inactive` são data, não booleano

A `api-fr` tipa os dois como `z.date().nullable()`, que no JSON viram string ISO. O painel tipava
`boolean | null`. O filtro `!room.inactive` funcionava por acidente — string não vazia é verdadeira — mas
qualquer comparação estrita (`=== true`) passaria a falhar em silêncio, e o card não teria como formatar
"em manutenção desde 12/08" a partir de um booleano. Corrigido para `string | null`.

### Manutenção vence `inUse` na derivação do estado

Os dois campos podem ser verdadeiros ao mesmo tempo (o item 7.15 da change anterior deixou isso em aberto).
A ordem escolhida é manutenção → em uso → disponível. Uma máquina em manutenção com o `inUse` travado não
pode aparecer como ocupada, senão o funcionário tenta encerrar uma sessão que não existe.

### A sessão vem da lista de liberações, filtrada no front

`GET /lawyers/get-all-releases/:roomId?` devolve o **histórico inteiro** da sala, ordenado do mais recente
para o mais antigo — não há filtro de sessão aberta na API. O painel filtra `endDate === null` e indexa por
`computer.id`. O `reverse()` antes do `Map` faz a sessão mais recente vencer, caso duas apareçam abertas na
mesma máquina.

### `status` deriva de `session || inUse`, não só da sessão

Se a leitura das liberações falhar, a grade ainda marca as máquinas ocupadas pelo `inUse` que veio com a
sala. O card perde o nome do advogado, o relógio e o botão de encerrar, mas não passa a convidar alguém a
liberar por cima de uma sessão em curso. Uma faixa âmbar explica a degradação — sem ela a tela pareceria
correta e incompleta ao mesmo tempo.

### A ordenação é do front porque a API não ordena

O `select` de `computers` em `GET /rooms/get-all` não tem `orderBy`: a ordem é a que o Postgres devolver e
muda entre requisições. Com polling de 30s, a grade se reembaralharia sozinha na frente do funcionário.
Ordenar por `number` no `buildComputerViews` resolve, com cópia do array — `sort` muta, e o array pertence
ao cache do React Query.

### Os diálogos não fecham no confirmar

Antes o `onConfirm` era seguido de `onClose()` local. Com API real, uma liberação recusada — CPF que não
confere, advogado inadimplente, cota esgotada — faria o diálogo sumir como se tivesse dado certo, e o
funcionário redigitaria tudo. Agora quem fecha é o container, e só no sucesso; o erro chega por toast com o
diálogo ainda aberto e preenchido.

### Manutenção age direto, sem diálogo de confirmação

`AlertDialog` está reservado a ação destrutiva. Enviar para manutenção não derruba ninguém — a API só
aceita com a máquina livre — e o caminho de volta é um clique no mesmo card. Confirmar aqui seria atrito
sem risco correspondente. Liberar e encerrar, que mexem com uma pessoa do outro lado, seguem com diálogo.

### A pendência é por card, não por grade

O `isPending` de uma mutação do React Query é global: passá-lo direto desabilitaria a grade inteira a cada
manutenção. Como a mutação carrega o `computerId` que recebeu, `variables` diz qual card está ocupado e só
ele trava.

### A sala vive na URL

`?sala=<roomId>`, lida com `useSearchParams` e escrita com `router.replace`. Um valor inválido, ou de uma
sala que o funcionário não enxerga, cai na primeira da lista em vez de deixar a tela vazia. O custo é a
fronteira de `Suspense` em `page.tsx`, sem a qual o build falha ao pré-renderizar.

## Risks / Trade-offs

- **Polling de 30s** custa uma requisição por sala aberta a cada meio minuto, trazendo o histórico inteiro
  de liberações. Aceito porque não há alternativa: o saldo é calculado no servidor. Cai fora no dia em que
  a `api-fr` emitir eventos de negócio no WebSocket.
- **O relógio do card está até 30s atrasado.** Para uma cota medida em dezenas de minutos, é ruído.
- **`birth` vai em `DDMMYYYY`.** A API compara com o cadastro da OAB já formatado assim; o formulário
  digita `dd/mm/aaaa`. A conversão mora no container. Errar isso faria *toda* liberação falhar com
  "informações não conferem", que é a mensagem menos útil possível para depurar.
- **`notified: false` é aviso, não erro.** A sessão foi gravada e a estação está offline. Liberando do
  balcão ninguém vê a tela da máquina — sem o toast de alerta, o advogado caminha até um computador travado.
- **Máquina ocupada sem sessão correspondente** não tem ação: encerrar exige `sessionId`. O card diz isso
  em vez de oferecer um botão que erraria.
