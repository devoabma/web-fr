import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { BackButton } from '@/components/app/back-button'
import { BrandMark } from '@/components/app/brand-mark'
import { Footer } from '@/components/app/footer'
import { GridOverlay } from '@/components/app/grid-overlay'
import { Header } from '@/components/app/header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <>
      <GridOverlay />

      <div
        aria-hidden
        className="pointer-events-none absolute top-[12%] left-1/2 -z-10 h-140 w-225 max-w-full -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(192,57,43,0.07),transparent_62%)]"
      />

      <div className="flex min-h-svh flex-col sm:block sm:min-h-0">
        <Header />

        <main className="relative mx-auto flex w-full max-w-190 flex-1 flex-col items-center justify-center px-4 pt-8 pb-16 text-center sm:px-6 sm:pt-12 lg:pt-16">
          <div className="relative mb-8 sm:mb-9.5">
            <BrandMark className="size-30 text-primary/15 sm:size-37.5" accentClassName="text-rose-700/30" />
            <span className="absolute inset-0 flex items-center justify-center font-bold text-5xl text-primary tracking-[-3px] sm:text-6xl">
              404
            </span>
          </div>

          <Badge className="bg-white px-3 py-4 text-muted-foreground text-xs tracking-tight shadow-2xl" variant="outline">
            <div className="mr-1.5 size-1.5 min-w-1.5 animate-pulse rounded-full bg-rose-700" />
            Erro 404 · Página não encontrada
          </Badge>

          <h1 className="mt-6 mb-4 text-balance font-bold text-3xl text-primary leading-[1.08] tracking-[-1.2px] sm:text-4xl sm:tracking-[-1.6px] lg:text-5xl">
            Esta sala não existe por aqui
          </h1>

          <p className="mx-auto mb-8 max-w-130 text-balance text-base text-muted-foreground sm:mb-9 sm:text-lg">
            O endereço que você tentou abrir pode ter sido movido, removido ou digitado incorretamente. Verifique o link ou volte
            para o painel.
          </p>

          <div className="flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
            <Button
              className="h-12 w-full rounded-full px-7.5 font-bold text-[15.5px] shadow-[0_6px_18px_rgba(22,33,62,0.18)] transition-transform hover:-translate-y-0.5 sm:h-12.5 sm:w-auto"
              nativeButton={false}
              render={<Link href="/auth/sign-in" />}
            >
              Voltar ao painel
            </Button>

            <BackButton
              variant="outline"
              className="h-12 w-full rounded-full px-6.5 font-semibold text-[15.5px] sm:h-12.5 sm:w-auto"
            >
              <ArrowLeft className="mr-1.5 size-4" />
              Página anterior
            </BackButton>
          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}
