import Image from 'next/image'
import Link from 'next/link'

export function Header() {
  return (
    <header className="relative mx-auto flex max-w-310 items-center justify-between gap-4 px-4 py-6 sm:px-6 sm:py-10">
      <Link href="/" className="flex items-center gap-2.5 sm:gap-3">
        <Image src="/logo.svg" alt="Sala Livre" width={36} height={36} className="size-8 sm:size-9" priority />
        <div className="flex flex-col leading-tight">
          <h1 className="font-bold text-base text-primary tracking-tight sm:text-lg">Sala Livre</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest sm:text-xs">Gestão de Salas</p>
        </div>
      </Link>

      <Image
        src="/assets/logo-oabma.png"
        alt="OAB Maranhão"
        width={749}
        height={206}
        priority
        className="h-auto w-24 sm:w-32 lg:w-40"
      />
    </header>
  )
}
