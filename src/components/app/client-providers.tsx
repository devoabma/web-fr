'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { Toaster } from 'sonner'
import { getQueryClient } from '@/lib/react-query'

type ClientProvidersProps = {
  children: ReactNode
}

export function ClientProviders({ children }: ClientProvidersProps) {
  // Mora no layout raiz porque o login (grupo `(public)`) também usa React Query — o provider não pode
  // ficar restrito ao `(private)`, senão `useMutation` na tela de autenticação quebra por falta de contexto.
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-center" richColors closeButton duration={5000} />
      {children}
    </QueryClientProvider>
  )
}
