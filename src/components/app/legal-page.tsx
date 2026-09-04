import { Mail } from 'lucide-react'
import type { ReactNode } from 'react'
import { SUPPORT_EMAIL } from '@/constants/contact'
import { Badge } from '../ui/badge'
import { Footer } from './footer'
import { GridOverlay } from './grid-overlay'
import { Header } from './header'

type LegalPageProps = {
  badge: string
  title: string
  description: string
  /** Só a política de privacidade versiona a data; o suporte é um guia vivo e não carrega esse selo. */
  updatedAt?: string
  children: ReactNode
}

/**
 * Casca das páginas de texto corrido (privacidade, suporte). Mantém o mesmo cabeçalho, rodapé e ritmo
 * tipográfico da landing — quem chega pelo rodapé continua dentro do site, não numa página solta.
 */
export function LegalPage({ badge, title, description, updatedAt, children }: LegalPageProps) {
  return (
    <>
      <GridOverlay />
      <Header />

      <main className="relative mx-auto w-full max-w-220 px-4 pt-8 sm:px-7 sm:pt-12 lg:pt-16">
        <div className="text-center">
          <Badge className="bg-white px-3 py-4 text-muted-foreground text-xs tracking-tight shadow-2xl" variant="outline">
            <div className="mr-1.5 size-1.5 min-w-1.5 rounded-full bg-rose-700" />
            {badge}
          </Badge>

          <h1 className="mt-6 mb-4 text-balance font-bold text-3xl text-primary leading-[1.08] tracking-[-1.2px] sm:text-4xl sm:tracking-[-1.6px] lg:text-5xl">
            {title}
          </h1>

          <p className="mx-auto max-w-150 text-balance text-base text-muted-foreground sm:text-lg">{description}</p>

          {updatedAt ? <p className="mt-4 text-muted-foreground text-xs uppercase tracking-widest">{updatedAt}</p> : null}
        </div>

        <article className="mt-9 flex flex-col gap-8 rounded-2xl border bg-card px-5 py-7 sm:mt-12 sm:gap-9 sm:px-9 sm:py-10">
          {children}
        </article>
      </main>

      <Footer />
    </>
  )
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-semibold text-lg text-primary tracking-tight sm:text-xl">{title}</h2>
      {children}
    </section>
  )
}

export function LegalSubsection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-2 flex flex-col gap-2.5 border-l-2 border-l-rose-700/20 pl-4">
      <h3 className="font-semibold text-primary text-sm sm:text-base">{title}</h3>
      {children}
    </div>
  )
}

export function LegalText({ children }: { children: ReactNode }) {
  return <p className="text-[15px] text-muted-foreground leading-relaxed">{children}</p>
}

export function LegalStrong({ children }: { children: ReactNode }) {
  return <strong className="font-semibold text-primary">{children}</strong>
}

/**
 * Canal oficial de atendimento. Fica num bloco próprio, e não solto no meio do texto, porque é a única
 * ação concreta destas páginas — a LGPD espera que o titular ache o contato sem ter que ler tudo.
 */
export function LegalContact({ description }: { description: string }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-muted/40 px-4 py-4.5 sm:flex-row sm:items-center sm:gap-4 sm:px-5">
      <div className="flex size-10 min-w-10 items-center justify-center rounded-xl border bg-card text-rose-700">
        <Mail className="size-4.5" />
      </div>

      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="text-muted-foreground text-sm">{description}</p>

        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="w-fit break-all font-semibold text-base text-primary underline underline-offset-4 transition-colors hover:text-rose-700"
        >
          {SUPPORT_EMAIL}
        </a>
      </div>
    </div>
  )
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map(item => (
        <li key={item} className="flex gap-2.5 text-[15px] text-muted-foreground leading-relaxed">
          <span aria-hidden className="mt-2.25 size-1.5 min-w-1.5 rounded-full bg-rose-700/50" />
          {item}
        </li>
      ))}
    </ul>
  )
}
