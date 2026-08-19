## Context

O saldo da sessão é calculado na `api-fr` a cada requisição. No painel ele chega pronto e imediatamente
começa a envelhecer. A change anterior tratou isso como problema de frescor de dado — e frescor de dado se
resolve com polling. Mas o saldo não é um dado que **muda no servidor**: é um dado que **decai com o
relógio**. A distinção decide a solução.

## Goals / Non-Goals

**Goals**
- O relógio do cartão andando sozinho, sem requisição por minuto.
- A tela continuar correta depois de qualquer ação do balcão.
- Nada de erro de hidratação por ler o relógio durante a renderização.

**Non-Goals**
- Tempo real. Continua bloqueado na `api-fr` (nenhum evento de negócio no WebSocket).
- Recalcular a cota no cliente. O cliente **só** subtrai tempo; quem decide quota, bloqueio e encerramento
  é a API.

## Decisions

### O tempo decorrido é contado no cliente, não pedido ao servidor

`remainingMinutes` é verdadeiro no instante `dataUpdatedAt` e falso a partir dali por uma quantidade
conhecida: os minutos passados. Subtrair essa quantidade na tela dá o mesmo número que uma nova requisição
daria — sem a requisição. O polling de 30s existia para descobrir uma subtração.

A âncora é `dataUpdatedAt` do React Query, não um `useState` no componente: ela já é o carimbo exato da
resposta que produziu os dados na tela, e **zera a contagem sozinha** a cada refetch bem-sucedido. Guardar
o instante à mão duplicaria esse estado e abriria a chance de os dois discordarem.

### Tique de 30s para um valor lido em minutos

O que aparece no cartão são minutos. Um tique de um minuto exato pode cair logo depois da virada e atrasar
a tela em quase um minuto inteiro; meio minuto limita o atraso visível a 30s, ao custo de dois `setState`
por minuto num componente que já é barato. Um tique de segundo seria uma re-renderização da grade inteira
por segundo, para mexer num dígito que só muda a cada 60.

### A primeira contagem acontece no efeito, não no estado inicial

`useState(() => Date.now())` gravaria um instante durante o render — que no servidor é um e no cliente é
outro. O React trata a diferença como erro de hidratação. O hook começa em `0` e conta pela primeira vez
dentro do `useEffect`, que só roda no cliente. É a mesma razão pela qual `formatDateTime` fixa
`timeZone: 'America/Fortaleza'` no cartão.

### O decorrido é travado em zero

Se o relógio do balcão estiver atrasado em relação ao do servidor, `Date.now() - since` sai negativo — e o
saldo **cresceria** na tela em vez de diminuir, que é o pior erro possível para este número. `Math.max(0, …)`
elimina o caso: no pior cenário a tela fica parada até o relógio local alcançar a resposta.

### Cota zerada na tela vale como esgotada

Quando o saldo descontado chega a zero, o cartão passa a sinalizar cota esgotada mesmo que a resposta
carregada ainda trouxesse `usedAllTime: false`. Não é o painel decidindo pela API: a `api-fr` encerra a
sessão sozinha quando o `expiresAt` chega, e o refetch seguinte apenas confirma o que o cartão já mostrava.
O contrário — relógio em `00h:00min` e nenhum aviso — leria como tela travada.

### `staleTime: 0` com revalidação no foco, em lugar do intervalo

O `QueryClient` do projeto tem `staleTime` global de 60s, pensado para dado de cadastro. Para esta tela o
dado nasce velho, então as duas consultas o zeram: qualquer remontagem ou volta de foco traz o estado atual
da sala. O que se perde em relação ao intervalo de 30s é a mudança feita **fora** deste painel enquanto a
aba está em foco — um advogado que se libera sozinho na máquina.

O risco é aceitável e falha para o lado seguro: se o funcionário agir sobre um cartão desatualizado, a
`api-fr` recusa (máquina em uso não é liberada duas vezes, sessão encerrada não é encerrada de novo) e o
`refreshBoard()` da ação já traz a grade correta. Se a operação mostrar que a defasagem incomoda, o passo
seguinte é reintroduzir um `refetchInterval` folgado (60s ou mais) — agora como sincronismo de estado, não
como motor do relógio.

### `buildSessionView` separada

A montagem da sessão virou função própria porque deixou de ser cópia de campos: passou a ter aritmética e
duas decisões (travar em zero, esgotar a cota). Dentro do `map` da grade, isso ficaria enterrado.
