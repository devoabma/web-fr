## Why

A change `painel-operacao-das-maquinas` entregou o cartão em uso com o saldo da sessão, e o saldo vem
calculado na `api-fr`: `usedMinutes` e `remainingMinutes` valem para o instante da resposta e envelhecem no
segundo seguinte. A solução registrada lá foi polling de 30s nas liberações — a tela repetia a requisição
só para o número mexer.

Duas coisas estavam erradas nesse arranjo:

**O relógio andava aos saltos e mentia no intervalo.** Trinta segundos parado num número medido em minutos
é aceitável; o problema é o custo de manter isso. A rota devolve o **histórico inteiro** da sala a cada
ciclo — a resposta cresce o ano todo, e o painel a pedia 120 vezes por hora, por funcionário com a tela
aberta, para descobrir uma subtração que o próprio navegador sabe fazer.

**O relógio não precisa da rede para andar.** O saldo é uma função do tempo: vale `remainingMinutes` menos
os minutos passados desde a resposta. Contar isso na tela deixa o cartão correto **entre** os refetches, em
vez de correto duas vezes por minuto.

Nesta change o saldo passa a ser envelhecido no cliente e o polling sai. A revalidação continua acontecendo
em toda ação do balcão (`refreshBoard()`), na montagem e ao voltar o foco para a aba.

## What Changes

- **`src/hooks/use-elapsed-minutes.ts` (novo)**: conta os minutos inteiros decorridos desde um instante,
  com tique de 30s. Devolve `0` enquanto a origem não existir.
- **`_data/computer-view.ts`**: `buildComputerViews` recebe `elapsedMinutes` e desconta do saldo de cada
  sessão em curso. A montagem da sessão saiu para `buildSessionView`.
- **`_components/releases-board.tsx`**: `refetchInterval` de 30s substituído por `staleTime: 0` +
  `refetchOnWindowFocus`, nas duas consultas da tela. O `dataUpdatedAt` das liberações vira a âncora da
  contagem.
- **Cota zerada na tela vale como esgotada**: `usedAllTime` passa a ser verdadeiro também quando o saldo
  descontado chega a zero.
- **Formato do relógio**: `01h:12min` no lugar de `01:12` — sem a unidade, o número era lido como hora do
  dia no balcão.
- **Ponto do estado pulsa** (`animate-pulse`), para a pílula de estado ser percebida como leitura viva.
- **Correção de texto no aviso da tela**: o parágrafo da cota emendava a frase anterior sem espaço, depois
  de um ponto final duplicado.

## Capabilities

### Modified Capabilities
- `operacao-das-maquinas`: o saldo da sessão deixa de depender de uma requisição para mudar de valor.

## Impact

- Código novo: `src/hooks/use-elapsed-minutes.ts`.
- Alterado: `_data/computer-view.ts`, `_components/{releases-board,computer-card,releases-notice}.tsx`,
  `panel/page.tsx` (comentário obsoleto).
- **O tráfego da tela cai a quase zero em repouso.** Sem polling, a rota que devolve o histórico da sala só
  é chamada na montagem, ao voltar o foco e depois de cada ação.
- **A grade não vê mais mudança externa em tempo de aba focada.** Um advogado que se libera sozinho na
  máquina aparece no próximo refetch — foco, ação ou recarga —, não em até 30s. As ações continuam seguras:
  a `api-fr` recusa liberar máquina ocupada e encerrar sessão inexistente, e o erro chega em toast.
- **O relógio da tela pode adiantar-se ao servidor em até um minuto**, pelo arredondamento para baixo dos
  minutos decorridos. O refetch seguinte corrige.
- **Continua sem tempo real.** Vale o mesmo bloqueio de sempre: a `api-fr` não emite eventos de negócio no
  WebSocket.
