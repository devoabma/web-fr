'use client'

import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { Button } from '../ui/button'

type BackButtonProps = Omit<React.ComponentProps<typeof Button>, 'onClick'> & {
  children: ReactNode
  fallbackHref?: string
}

export function BackButton({ children, fallbackHref = '/', ...props }: BackButtonProps) {
  const router = useRouter()

  function handleBack() {
    // `history.length <= 1` significa aba aberta direto na URL: não há para onde voltar.
    if (window.history.length > 1) {
      router.back()

      return
    }

    router.push(fallbackHref)
  }

  return (
    <Button onClick={handleBack} {...props}>
      {children}
    </Button>
  )
}
