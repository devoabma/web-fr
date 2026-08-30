'use client'

import { useEffect } from 'react'

/**
 * Liga (e desliga) o service worker do painel.
 *
 * Registrar é o que habilita a instalação no celular. O caminho inverso importa tanto quanto: em
 * desenvolvimento o worker é **removido**, senão quem rodou um build de produção no `localhost` fica
 * com um worker antigo servindo asset velho por cima do dev server — bug caro de diagnosticar,
 * porque a tela quebra sem erro nenhum no terminal.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    if (process.env.NODE_ENV !== 'production') {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        for (const registration of registrations) registration.unregister()
      })

      return
    }

    // Espera o `load` para o registro não disputar banda com o carregamento da primeira tela.
    const register = () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
        // Falhar aqui não pode derrubar o painel: sem worker, o app continua funcionando online.
      })
    }

    if (document.readyState === 'complete') {
      register()

      return
    }

    window.addEventListener('load', register)

    return () => window.removeEventListener('load', register)
  }, [])

  return null
}
