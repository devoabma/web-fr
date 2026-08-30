import type { MetadataRoute } from 'next'
import { PANEL_ROUTE } from '@/lib/auth/routes'

/**
 * Manifesto do PWA — é ele que transforma o painel em "app instalado" no celular.
 *
 * O Next publica este arquivo em `/manifest.webmanifest` e injeta a `<link rel="manifest">` sozinho.
 * O `proxy.ts` ignora caminhos com extensão, então o manifesto é lido sem passar pela guarda de
 * sessão — importante, porque o navegador busca o manifesto sem credenciais.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    // `id` fixo: é a identidade da instalação. Mudar isso depois faz o Android tratar como outro app
    // e o usuário acaba com dois ícones na gaveta.
    id: '/',
    name: 'Sala Livre',
    short_name: 'Sala Livre',
    description: 'Uma plataforma de gestão inteligente das salas da advocacia.',
    lang: 'pt-BR',
    dir: 'ltr',
    // Abre direto no painel: sem sessão, o `proxy` desvia para o login e devolve o usuário aqui depois.
    start_url: PANEL_ROUTE,
    scope: '/',
    display: 'standalone',
    theme_color: '#16213e',
    background_color: '#f4f5f8',
    categories: ['business', 'productivity'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      // O `maskable` tem fundo até a borda e marca menor: o Android recorta o ícone no formato do
      // launcher e só respeita os 80% centrais.
      { src: '/icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Painel', short_name: 'Painel', url: PANEL_ROUTE },
      { name: 'Liberações', short_name: 'Liberações', url: '/releases' },
      { name: 'Impressões', short_name: 'Impressões', url: '/printers' },
    ],
  }
}
