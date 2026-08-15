import type { Metadata } from 'next'
import '@/styles/globals.css'
import { Space_Grotesk } from 'next/font/google'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { ClientProviders } from './_components/shared/client-providers'

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

export default function PrivateLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={cn('font-sans antialiased', spaceGrotesk.variable)}>
      <body className="relative isolate min-h-svh">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}
