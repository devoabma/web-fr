import Image from 'next/image'
import Link from 'next/link'

export function Header() {
  return (
    <header className="relative mx-auto flex w-full max-w-310 items-center justify-between gap-4 px-4 py-6 sm:px-6 sm:py-10">
      <Link href="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3">
        <Image src="/logo.svg" alt="Sala Livre" width={36} height={36} className="size-8 shrink-0 sm:size-9" priority />
        <div className="flex min-w-0 flex-col leading-tight">
          <h1 className="font-bold text-base text-primary tracking-tight sm:text-lg">Sala Livre</h1>
          <p className="truncate text-[10px] text-muted-foreground uppercase tracking-widest sm:text-xs">Gestão de Salas</p>
        </div>
      </Link>

      {/* Espaço de marca branca: a seccional que adquire o produto troca só este arquivo. O que está fixo é a
          altura — assim qualquer proporção de logo entra sem esticar o cabeçalho. */}
      <Image
        src="/assets/logo-cliente.png"
        alt="Logo da instituição"
        width={900}
        height={428}
        priority
        className="h-9 w-auto shrink-0 sm:h-11 lg:h-12"
      />
    </header>
  )
}
