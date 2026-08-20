## Context

O painel libera máquina que ele não vê. Quem confirma está no balcão; a tela que precisa destravar está do
outro lado da sala. Toda a operação depende de o Desktop daquela estação estar conectado ao canal
`/ws/computers` para receber a ordem — e até agora o painel só descobria que não estava pela resposta da
própria liberação, com a sessão já gravada.

`GET /computers/online/:roomId` muda a ordem dos fatos: dá para perguntar antes. Mas a resposta é uma
fotografia, e o intervalo entre a fotografia e o clique continua existindo. As duas defesas convivem.

## Goals / Non-Goals

**Goals**
- A máquina muda visível na grade, antes de qualquer tentativa.
- Nenhuma sessão sobrando de uma liberação que a estação não recebeu.
- A tela continuar funcionando quando a consulta de conectadas falhar.

**Non-Goals**
- Saber se o computador está ligado. O que a rota responde é se o **programa** está conectado.
- Tempo real. Segue bloqueado na `api-fr` (nenhum evento de negócio no WebSocket).
- Bloquear manutenção, encerramento ou qualquer outra ação por estar offline. Só a liberação depende da
  estação receber o aviso.

## Decisions

### Ausência na lista é o sinal, e o desconhecido não vale como offline

A rota devolve apenas as conectadas. Isso torna a leitura assimétrica: presença é prova de conexão,
ausência é prova de desconexão — mas **só depois que a resposta chega**. Enquanto a consulta não respondeu,
ou se ela falhou, `isOnline` fica `null`, e o cartão se comporta exatamente como antes da change.

Um `boolean` simples forçaria escolher entre dois erros: `false` por padrão bloquearia a sala inteira num
timeout de rede; `true` por padrão mentiria dizendo que a máquina está conectada. O terceiro estado é o
único que permite degradar sem inventar.

### Bloqueio na grade **e** desfazer na resposta

São defesas para janelas diferentes de tempo, não redundância:

- o bloqueio cobre a máquina que **já estava** desligada quando o funcionário olhou a tela — o caso comum,
  e o único que evita o vaivém do advogado até a máquina;
- o desfazer cobre a que **caiu** entre o último refetch e a confirmação — raro, mas o único caminho que a
  `api-fr` consegue reportar com certeza, porque ela tenta a entrega de fato.

Ficar só com o bloqueio deixaria a sessão fantasma de pé na corrida. Ficar só com o desfazer é o que já
existia, e obriga a errar para descobrir.

### A liberação é desfeita, não apenas avisada

O aviso anterior informava e ia embora. A sessão gravada numa máquina muda não é um dado neutro: ela
consome o direito do advogado a **estar** em sessão, porque a `api-fr` recusa uma segunda simultânea. O
advogado ficava preso a uma máquina que não abre, e o desbloqueio exigia que alguém no balcão soubesse
encerrar a sessão fantasma primeiro.

Encerrar no mesmo instante é o mais perto de nunca ter liberado. Não custa cota: o consumo é contado em
minutos inteiros e a sessão viveu segundos.

O `expiresAt` na condição não é detalhe. A rota tem dois caminhos de 200: a liberação nova (com `expiresAt`)
e o encerramento da sessão anterior que estourou o tempo (sem). O segundo também pode vir com
`notified: false`, e ali não há nada aberto para desfazer — encerrar de novo erraria.

### O encerramento que falha vira instrução, não silêncio

Se o desfazer também falhar — rede caindo no pior momento —, a sessão fica aberta e o advogado está preso.
A mensagem, nesse caminho, para de descrever o problema e passa a dizer o que fazer: encerrar pelo cartão
antes de tentar outra máquina. É a única situação da tela em que o funcionário precisa executar uma
correção manual.

### Polling de 20s só nesta consulta

A change anterior tirou o polling da tela de propósito: o saldo da sessão decai com o relógio e não
precisava de rede para andar. Aqui é o contrário — a conexão de uma estação muda **no servidor**, sem nada
que o navegador possa deduzir sozinho, e a consequência da defasagem é um botão travado.

Uma estação recém-ligada, sem refetch, ficaria marcada como offline indefinidamente, porque
`refetchOnWindowFocus` não dispara para quem nunca sai da aba. Vinte segundos é o teto do atraso para
liberar uma máquina que acabou de subir. O intervalo do React Query pausa com a aba fora de foco, então
painel esquecido aberto não bate na API.

Vale a pena reparar na assimetria: o atraso ao contrário — máquina que **cai** logo depois do refetch —
não precisa desse intervalo apertado, porque o desfazer cobre.

### Âmbar, não verde e não cinza

A máquina livre e offline é uma quarta leitura dentro do estado disponível, e as três cores já em uso estão
ocupadas: verde promete uso imediato, vermelho é sessão em andamento, cinza é decisão administrativa de
tirar de operação. Âmbar é o tom que a tela já reserva para "funciona, mas há algo a saber" — os mesmos
avisos de degradação das consultas.

O rótulo da pílula diz "Offline" em vez de "Disponível" porque a pílula é o que se lê de relance. Manter
"Disponível" e escrever o problema no corpo do cartão contaria com uma leitura que ninguém faz num balcão
com fila.

### Manutenção continua liberada, encerramento também

Estar offline impede uma coisa só: a estação receber a ordem de abrir a tela. Nada mais.

Mandar para manutenção é justamente o desfecho natural de encontrar uma máquina muda, e é operação de
banco. Encerrar uma sessão de máquina offline também funciona — a sessão morre e a cota volta —; o que não
acontece é a tela dela limpar. Como isso é invisível de quem está no balcão, o cartão avisa em vez de
esconder o botão: encerrar continua sendo a ação certa, e a máquina precisará de reinício quando voltar.

### As livres e mudas saem da contagem de disponíveis

O contador do topo responde a uma pergunta só: "tem máquina livre?". Somar as mudas ao verde faria a
resposta ser sim quando a resposta é não. A pílula âmbar só aparece quando houver alguma — sala inteira
ligada não ganha um zero para ler.
