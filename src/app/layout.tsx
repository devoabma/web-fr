import type { Metadata, Viewport } from 'next'
import '@/styles/globals.css'
import { Space_Grotesk } from 'next/font/google'
import { ClientProviders } from '@/components/app/client-providers'
import { ServiceWorkerRegistrar } from '@/components/app/service-worker-registrar'
import { cn } from '@/lib/utils'

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: {
    template: '%s • Sala Livre',
    default: 'Sala Livre',
  },
  description: 'Uma plataforma de gestão inteligente das salas da advocacia.',
  applicationName: 'Sala Livre',
  icons: {
    icon: [
      { url: '/fr-icon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    // O iOS ignora os ícones do manifesto: quem vira o ícone da tela de início é este aqui.
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  // Sem isso o atalho do iPhone abre no Safari com barra de endereço, em vez de em tela cheia.
  appleWebApp: {
    capable: true,
    title: 'Sala Livre',
    statusBarStyle: 'default',
  },
  other: {
    // O `appleWebApp.capable` do Next emite só a meta moderna (`mobile-web-app-capable`), que o
    // Safari passou a entender no iOS 17.4. Em iPhone mais antigo o atalho abre com a barra do
    // navegador se a versão prefixada não vier junto.
    'apple-mobile-web-app-capable': 'yes',
  },
}

export const viewport: Viewport = {
  // Pinta a barra de status do app instalado com o azul da marca.
  themeColor: '#16213e',
  // O painel só tem tema claro; declarar isso evita o sistema escurecer campos e controles nativos.
  colorScheme: 'light',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="pt-BR" className={cn('font-sans antialiased', spaceGrotesk.variable)}>
      <body className="relative isolate min-h-svh">
        <ClientProviders>{children}</ClientProviders>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  )
}
