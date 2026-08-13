'use client'

import { Toaster } from 'sonner'

type ClientProvidersProps = {
  children: React.ReactNode
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <>
      <Toaster position="top-center" richColors closeButton duration={5000} />
      {children}
    </>
  )
}
