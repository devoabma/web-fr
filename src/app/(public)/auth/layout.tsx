import Image from 'next/image'
import Link from 'next/link'
import { BrandMark } from '@/components/app/brand-mark'
import { cn } from '@/lib/utils'

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="grid min-h-dvh grid-cols-1 grid-rows-[1fr_1fr] md:grid-cols-2 md:grid-rows-1">
      <div
        className={cn(
          'relative order-2 flex h-full flex-col justify-between gap-10 overflow-hidden border-foreground/10 border-t',
          'bg-primary p-6 text-primary-foreground shadow-lg sm:p-10 md:order-1 md:gap-0 md:border-t-0 md:border-r lg:p-14'
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_60%_at_15%_-10%,rgba(255,255,255,0.09),transparent_70%)]"
        />

        <BrandMark
          aria-hidden
          accentClassName="text-current"
          className="pointer-events-none absolute -right-12 -bottom-16 size-64 text-white/4 sm:-right-16 sm:-bottom-24 sm:size-96"
        />

        <div className="relative flex flex-row items-center justify-between gap-3 sm:gap-4">
          <Link href="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <BrandMark className="size-8 shrink-0 text-white sm:size-9" />
            <div className="flex min-w-0 flex-col leading-tight">
              <h1 className="truncate font-bold text-base text-white tracking-tight sm:text-lg">Sala Livre</h1>
              <p className="truncate text-[10px] text-primary-foreground/55 uppercase tracking-widest sm:text-xs">
                Gestão de Salas
              </p>
            </div>
          </Link>

          {/* Mesmo espaço de marca branca do cabeçalho público. O PNG tem fundo transparente de propósito:
              `brightness-0 invert` pinta o traço de branco sobre o painel escuro — com fundo opaco viraria
              um retângulo branco sólido. */}
          <Image
            src="/assets/logo-cliente.png"
            alt="Logo da instituição"
            width={900}
            height={428}
            priority
            className="h-8 w-auto shrink-0 opacity-80 brightness-0 invert sm:h-10 lg:h-11"
          />
        </div>

        <div className="relative max-w-150">
          <div className="flex items-center gap-2">
            <span className="size-1.5 min-w-1.5 animate-pulse rounded-full bg-green-600" />
            <span className="text-primary-foreground/70 text-xs tracking-tight">
              Plataforma de gestão de espaços da advocacia
            </span>
          </div>
          <h2 className="mt-4 text-balance font-bold text-3xl text-white leading-[1.1] tracking-[-1px] sm:mt-5 sm:text-4xl sm:leading-[1.08] sm:tracking-[-1.2px] lg:text-5xl lg:leading-[1.05] lg:tracking-[-1.6px]">
            Gestão inteligente das salas da <span className="text-rose-700">advocacia</span>
          </h2>

          <p className="mt-4 text-balance text-primary-foreground/60 text-sm sm:mt-5 sm:text-base">
            Libere computadores, acompanhe o uso em tempo real e gerencie a fila de impressão dos escritórios compartilhados e
            salas de fórum da sua seccional — tudo em um só painel.
          </p>
        </div>

        <div className="relative">
          <div className="mb-4 h-px w-full max-w-70 bg-white/12 sm:mb-6" />

          <p className="mt-4 text-balance text-primary-foreground/35 text-xs sm:text-sm">
            &copy; {new Date().getFullYear()} - Sala Livre · Todos os direitos reservados.
          </p>
        </div>
      </div>

      <div className="relative order-1 flex flex-col items-center justify-center px-6 py-12 sm:px-8 sm:py-16 md:order-2 md:px-10">
        <div className="w-full max-w-118">{children}</div>
      </div>
    </div>
  )
}
