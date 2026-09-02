## Context

Até aqui o painel só olhava para o parque. A versão instalada era informação passiva: aparecia na grade e na
tabela, e o que fazer com ela era problema de quem ia até a máquina. A `api-fr` fechou o circuito ao expor o
canal que já existia — o Desktop fica pendurado no WebSocket, ninguém alcança a estação por IP —, e agora o
painel pode pedir.

A pergunta desta change não é como disparar o pedido; é **quando oferecer o botão**. Uma ação que aparece em
toda linha e falha na maioria delas ensina o funcionário a não clicar. Uma ação que some sem explicação
ensina que o painel é instável. O desenho todo gira em torno de três estados que a `api-fr` já resolveu
(`outdated`, `up-to-date`, `unknown`) mais um quarto sinal ortogonal (`isOnline`).

## Goals / Non-Goals

**Goals**
- Botão só onde o clique tem sentido, e travado — com o motivo à mão — onde o pedido seria recusado.
- O funcionário sabendo, antes de confirmar, de que versão para qual, o que muda e o que vai acontecer com
  quem estiver na máquina.
- Recusas da API chegando como frase em português, não como código.

**Non-Goals**
- Atualizar o parque inteiro de uma vez. Ver o teto por máquina no proposal.
- Acompanhar o progresso da troca. O canal não devolve progresso, e inventar barra seria mentir.
- Publicar, promover ou reverter versão. Quem publica é o time do Desktop; o painel só encaminha.
- Reimplementar a comparação de versões no cliente. Ela mora na `api-fr` de propósito.

## Decisions

### A comparação de versões fica no servidor, e o painel só lê o veredito

O front poderia comparar `computer.appVersion` com `latestVersion.version` — tem os dois em mãos. Não vai
comparar. `'1.0.10' < '1.0.9'` é verdadeiro em ordem alfabética, e esse erro só aparece na décima
publicação, quando ninguém mais lembra por que aquela função existe. Pior: ele apareceria de novo em cada
tela que precisasse do mesmo julgamento.

`updateStatus` chega pronto do servidor com três valores, e o painel os trata como fatos. Isso também cala
a tentação de "consertar" o `unknown` no cliente: as três origens dele — nunca informou, informou algo
ilegível, a API ainda não sabe qual é a publicada — dão no mesmo para quem olha a tela, e nenhuma delas é
"está em dia".

### Quem ganha botão: `outdated` sempre, `unknown` só se estiver no ar

`up-to-date` não ganha botão. Oferecer ali seria oferecer uma ação que a `api-fr` recusa com `400`, e a
coluna Desktop já diz em que versão a máquina está.

`outdated` ganha botão sempre, inclusive desconectada — travado, mas presente. É o caso em que existe algo
concreto a comunicar ("há versão nova, e ela vai pegar sozinha quando ligar"), e sumir com o botão apagaria
justamente essa informação.

`unknown` só ganha botão quando `isOnline`. Máquina conectada que não diz a versão é exatamente a que o
suporte quer sacudir, e a `api-fr` aceita o pedido nesse caso — o comentário da rota é explícito. Já a
desconectada e sem versão conhecida não oferece nada: não se sabe se está atrasada, e ela não ouviria.

### `aria-disabled` em vez de `disabled`

Botão desabilitado de verdade não dispara `hover` em navegador nenhum, e o tooltip é justamente o que
explica por que ele está travado. Trocar o motivo por um botão mudo transformaria a trava em bug aparente.

`aria-disabled` mantém o elemento focável e anunciado como indisponível pelo leitor de tela, o `onClick`
guarda a condição, e a opacidade dá o sinal visual. As duas travas espelhadas — `inUse` e `!isOnline` — são
as mesmas que a API aplica antes de gastar o canal, e estão aqui só para o botão não acender prometendo o
que já se sabe que vira erro.

### A bolinha pulsa, mas só quando o clique tem para onde ir

`animate-ping` num anel verde é o único elemento da tabela que chama atenção sem ninguém pedir. Ele se paga
porque a pergunta "alguma máquina precisa de mim?" passa a ser respondida pela varredura da coluna Ações, e
não pela leitura de dez números de versão.

Por isso ele só acende com `outdated` **e** o botão liberado. Pulsar numa máquina desconectada seria chamar
o funcionário para um botão que não faz nada — o custo de credibilidade não compensa.

Embaixo do anel que se expande há um ponto sólido. `animate-ping` respeita `prefers-reduced-motion`; o ponto
não depende de animação nenhuma, então o aviso continua legível para quem desligou movimento no sistema.

### A ação vem primeiro na coluna, antes de editar e excluir

É a única ação da linha que **aparece e some sozinha**, conforme o estado da máquina. Colocada no fim, ela
empurraria editar e excluir de posição toda vez que surgisse ou desaparecesse, e o alvo de "excluir" mudaria
de lugar entre uma linha e a seguinte. Vindo antes, as outras duas ficam ancoradas à direita e o olho
encontra a novidade sempre no mesmo ponto.

### A versão publicada vem da cache, não de props

`latestVersion` é do envelope da listagem, não do computador. Descê-la até a célula exigiria atravessar a
definição de colunas — que hoje não recebe nada além da linha — e faria a coluna Ações saber que existe uma
versão publicada no mundo.

O componente da célula assina a **mesma `queryKey`** com `useQuery`. É a chave que a tabela já buscou:
nenhuma requisição nova, dedupe do React Query, e o envelope chega inteiro onde é usado. O preço é uma
assinatura por linha; o ganho é a coluna continuar ignorando o assunto.

### O diálogo mostra de onde para onde, e o que muda

Confirmar sem contexto viraria um "tem certeza?" que ninguém lê. O diálogo carrega três coisas, nessa ordem:
a transição `v instalada → v nova`, as notas do manifesto (já em português, escritas pelo time do Desktop
para o funcionário ler) com a data de publicação, e a promessa de que a troca espera a sessão do advogado.

Sem `latestVersion` em mãos o pedido continua válido — vira um "vá conferir agora" —, e a tela diz isso em
texto em vez de inventar um número. O mesmo vale para a coluna Instalada, que mostra `—` quando a estação
nunca informou.

### O toast confirma o envio, e diz que a troca demora

`result.version` vem da API quando ela sabe qual publicou, e vira `"Ela vai buscar a v1.2.0 agora"`. Sem
ele, o texto cai para `"vai consultar o servidor de atualizações agora"`. Em ambos, a frase seguinte diz que
leva alguns minutos e que a estação reinicia sozinha — porque a expectativa errada aqui é achar que a coluna
Desktop muda no refetch seguinte.

A invalidação acontece mesmo assim: a listagem carrega três coisas que o disparo mexe — quem está online, em
que versão cada um está e qual é a publicada. Vale reler, ainda que a versão nova só apareça minutos depois.

### O `429` é lido, nunca retentado

O teto é por máquina (10 a cada 5 minutos) e existe para proteger o link da unidade. A tela lê
`retryAfterInSeconds` do corpo e diz em quanto tempo tentar de novo, com `formatWaitTime`. Nenhum retry
automático — laço em cima de rate limit é como se transforma uma proteção em incidente.

### Fechar o diálogo no meio da chamada é bloqueado

`handleOpenChange` recusa o fechamento enquanto `isUpdating`. Não é zelo pela requisição — ela seguiria
igual. É que o toast chegaria com a tela já sem o contexto da máquina, e o funcionário leria "Pedido enviado
para COMPUTADOR 03" sem saber mais de onde aquilo veio.
