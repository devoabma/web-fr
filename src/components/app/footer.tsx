import Link from 'next/link'

// URLs em inglês, rótulos em português — a convenção do repositório. Estes caminhos precisam casar
// com `PUBLIC_ROUTES`: sob a regra de negar por padrão do `proxy.ts`, um link de rodapé fora da lista
// manda o visitante para o login em vez de mostrar a 404.
const links = [
  { label: 'Privacidade', href: '/privacy' },
  { label: 'Suporte', href: '/support' },
]

export function Footer() {
  return (
    <footer className="relative mx-auto mt-14 flex max-w-295 flex-col items-center gap-4 border-t px-4 pt-6 pb-10 text-center text-muted-foreground text-sm sm:mt-18 sm:px-7 sm:pt-7.5 sm:pb-12 lg:mt-21.5 lg:flex-row lg:justify-between lg:text-left">
      <p className="text-balance">&copy; {new Date().getFullYear()} - Sala Livre · Todos os direitos reservados.</p>

      <nav className="flex gap-6">
        {links.map(link => (
          <Link key={link.href} href={link.href} className="transition-colors hover:text-primary">
            {link.label}
          </Link>
        ))}
      </nav>
    </footer>
  )
}
