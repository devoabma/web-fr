import type { Metadata } from 'next'
import './styles/globals.css'
import { Space_Grotesk } from 'next/font/google'
import { GridOverlay } from '@/components/app/grid-overlay'
import { cn } from '@/lib/utils'
import { ClientProviders } from './(internal-layout)/_components/shared/client-providers'

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: {
    template: '%s | Sala Livre',
    default: 'Sala Livre',
  },
  description: 'Uma plataforma de gestão inteligente das salas da advocacia.',
  icons: {
    icon: '/fr.svg',
  },
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={cn('font-sans antialiased', spaceGrotesk.variable)}>
      <body className="relative isolate min-h-svh">
        <ClientProviders>
          <GridOverlay />
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}
