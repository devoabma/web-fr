## Context

O painel já sabe tudo o que interessa sobre a **operação** de cada estação: se está livre, ocupada, em
manutenção, conectada. O que ele nunca soube é o que está **instalado** nela. Essa informação existia só
dentro do próprio Desktop, escrita no canto da tela da máquina, legível apenas por quem está de pé na
frente dela.

A `api-fr` passou a persistir o que a estação informa ao conectar, e os campos vêm embutidos nos
computadores de `GET /rooms/get-all`. A pergunta desta change não é como obter o dado — é como mostrá-lo de
um jeito que responda à pergunta real do balcão, que não é "qual a versão desta máquina?" e sim "alguma
máquina desta sala está diferente das outras?".

## Goals / Non-Goals

**Goals**
- A versão de cada estação legível na grade, sem clique e sem caminhada.
- A máquina que ficou para trás se destacando sozinha, sem que ninguém precise comparar dez números.
- Ausência de informação dita como ausência, não escondida.

**Non-Goals**
- Atualizar, disparar ou agendar atualização de estação. O painel mostra; quem atualiza é quem vai à
  máquina.
- Saber qual é a versão "certa". O painel não conhece o que foi publicado — ver a decisão da régua.
- Usar o carimbo como "vista por último". Esse papel é de `GET /computers/online/:roomId`.
- Mexer nas contagens do topo. Versão atrasada não muda o estado operacional da máquina.

## Decisions

### A régua é a maior versão da própria sala

A alternativa óbvia seria comparar com uma versão oficial. O painel não tem como saber qual é: não existe
rota que diga qual release está publicada, e cravar o número no código do front criaria uma constante que
envelhece em silêncio — a cada release alguém precisaria lembrar de mexer aqui, e no dia em que
esquecessem a grade acusaria o parque inteiro de estar atrasado.

A sala sabe de si. Se nove máquinas rodam `1.0.7` e uma roda `1.0.6`, não importa qual é a versão
publicada: aquela uma está diferente das vizinhas, e é exatamente essa a anomalia que se quer enxergar.
Pega inclusive o caso que mais interessa, o da máquina que voltou sozinha para a versão anterior depois de
uma atualização falhar.

O preço é honesto e está no proposal: sala inteira parada numa versão antiga não destaca ninguém. Isso é
aceitável porque esse caso é visível de outro jeito — todos os cartões mostram o mesmo número, e quem
acompanha as releases lê isso de relance. O caso invisível sem esta change é justamente o que ela cobre.

### Comparação numérica segmento a segmento

`'1.0.10' < '1.0.7'` é verdadeiro em ordem alfabética. Comparar como texto elegeria `1.0.7` como topo da
sala e marcaria a máquina **mais atualizada** como atrasada — pior que não mostrar nada, porque manda o
técnico para o computador errado.

A comparação quebra em pontos e compara número a número. Segmento faltando vale zero, então `1.0` e `1.0.0`
empatam. Segmento não numérico — um sufixo `-beta`, por exemplo — também vale zero, e essa escolha é
deliberada: o campo é texto livre do lado do cliente, e o pior desfecho aceitável é o destaque não
aparecer. Destacar a máquina errada, não.

### O número fica na grade, não dentro de um tooltip

Havia a opção barata de pendurar a versão no tooltip do MAC, que já existe no cartão. Não serve: o que se
quer é varrer a sala inteira de olho e achar a destoante, e informação que só aparece no hover exige um
hover por cartão — dez interações para responder uma pergunta.

O número fica abaixo da pílula de estado, alinhado à direita, em `tabular-nums` para que os dígitos caiam
na mesma coluna entre cartões vizinhos. Com fonte tabular, dez cartões empilhados viram uma coluna de
números conferível de relance; sem ela, os números dançam e a comparação volta a exigir leitura.

O tooltip continua existindo, mas para o que é secundário: qual dos três casos é aquele e quando a estação
se apresentou.

### Âmbar de novo, e sem conflito

Âmbar já é o tom de "offline" no cartão e o dos avisos de degradação da tela — é o tom que a interface
reserva para "funciona, mas há algo a saber", e versão atrasada é exatamente isso: a máquina opera
normalmente, e ainda assim alguém deveria olhar.

A sobreposição com o offline é aceita conscientemente. Uma estação pode estar muda **e** atrasada, e são
dois avisos legítimos sobre a mesma máquina, cada um no seu lugar: o rótulo ao lado do ponto pulsante diz
"Offline", e a linha de baixo diz `v1.0.6`. Nenhum dos dois some por causa do outro, e não há ambiguidade
sobre qual é qual.

Verde não cabia — não é uma promessa de uso imediato. Vermelho não cabia — não é sessão em andamento nem
erro; a máquina não está quebrada.

### `v—` em vez de esconder o campo

Estação sem versão informada poderia simplesmente não desenhar nada. Ficaria pior: um cartão sem a linha
parece um cartão sem problema, e a leitura de relance da grade dependeria de perceber uma **ausência** —
que é o tipo de coisa que ninguém percebe.

`v—` em cinza mais apagado ocupa o lugar e diz que ali não há informação. O tooltip completa: a estação
nunca informou. Não é erro, e o texto não trata como erro.

### Nada disso muda o que o cartão deixa fazer

Versão atrasada não trava liberação, não trava encerramento, não manda para manutenção. A máquina
desatualizada continua servindo advogado normalmente, e travar a operação por causa de um número seria
inventar um problema maior que o observado. Se o técnico decidir tirar aquela estação para atualizar, a
manutenção já está ali, do jeito que sempre esteve.
