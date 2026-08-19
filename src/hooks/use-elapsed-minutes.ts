'use client'

import { useEffect, useState } from 'react'

/** Meio minuto: o que se lê na tela são minutos, então a virada aparece com no máximo 30s de atraso. */
const TICK_INTERVAL = 30_000

/**
 * Minutos inteiros passados desde `since` (epoch em ms), recontados sozinhos enquanto a tela fica aberta.
 * `0` desliga a contagem, que é como se pede o valor de uma resposta que ainda não chegou.
 *
 * Serve para envelhecer na tela um número que o servidor calculou: ele veio certo no instante da resposta
 * e só precisa perder o tempo decorrido desde então — sem uma requisição por minuto para descobrir isso.
 */
export function useElapsedMinutes(since: number) {
  const [elapsedMinutes, setElapsedMinutes] = useState(0)

  useEffect(() => {
    if (!since) {
      setElapsedMinutes(0)

      return
    }

    function recount() {
      // Um `since` no futuro — relógio do cliente atrasado em relação ao do servidor — daria negativo,
      // e o saldo *cresceria* na tela em vez de diminuir.
      setElapsedMinutes(Math.max(0, Math.floor((Date.now() - since) / 60_000)))
    }

    // A primeira contagem só acontece aqui, depois da montagem: ler o relógio no estado inicial gravaria
    // um instante no HTML do servidor e outro no do cliente, e o React acusaria erro de hidratação.
    recount()

    const intervalId = setInterval(recount, TICK_INTERVAL)

    return () => clearInterval(intervalId)
  }, [since])

  return elapsedMinutes
}
