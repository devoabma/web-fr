import { ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'

export function HeroContent() {
  return (
    <div className="relative mx-auto max-w-220 px-4 pt-10 text-center sm:px-6 sm:pt-14 lg:pt-18.5">
      <Badge className="bg-white px-3 py-4 text-muted-foreground text-xs tracking-tight shadow-2xl" variant="outline">
        <div className="mr-1.5 size-1.5 min-w-1.5 animate-pulse rounded-full bg-green-600" />
        Plataforma de gestão de espaços tecnológicos
      </Badge>

      <h1 className="m-0 mt-6 mb-4 text-wrap font-bold text-4xl text-primary leading-[1.08] tracking-[-1px] sm:mt-8 sm:mb-6 sm:text-5xl sm:tracking-[-1.4px] lg:text-[64px] lg:leading-[1.05] lg:tracking-[-1.8px]">
        Gestão inteligente das <br />
        salas da <span className="text-rose-700">advocacia</span>
      </h1>

      <p className="mx-auto mb-7 max-w-150 text-balance font-normal text-base text-muted-foreground sm:mb-9.5 sm:text-lg lg:text-xl">
        Libere computadores, acompanhe o uso em tempo real e gerencie a fila de impressão dos escritórios compartilhados e salas
        de fórum da sua seccional — tudo em um só painel.
      </p>

      <div className="flex items-center justify-center gap-3.25">
        <Button
          className="h-12 w-full max-w-55.25 rounded-full font-bold text-[15.5px] shadow-[0_6px_18px_rgba(22,33,62,0.18)] transition-transform hover:-translate-y-0.5 sm:h-12.5"
          nativeButton={false}
          render={<Link target="_blank" href="/auth/sign-in" />}
        >
          <ExternalLink className="mr-1.5 h-4 w-4" />
          Acessar o painel
        </Button>
      </div>
    </div>
  )
}
