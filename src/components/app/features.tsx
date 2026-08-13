import { Clock, LayoutGrid, Printer, Unlock } from 'lucide-react'

const features = [
  {
    icon: Unlock,
    title: 'Liberação de máquinas',
    description: 'Valide adimplência e libere o computador para o advogado em segundos, direto do painel.',
  },
  {
    icon: Clock,
    title: 'Sessões em tempo real',
    description: 'Acompanhe quem está usando cada máquina e o tempo restante de cada sessão.',
  },
  {
    icon: Printer,
    title: 'Fila de impressão',
    description: 'Receba os arquivos enviados pelos advogados e baixe para impressão física.',
  },
  {
    icon: LayoutGrid,
    title: 'Salas & relatórios',
    description: 'Gerencie salas, computadores e gere relatórios de uso por sala e advogado.',
  },
]

export function Features() {
  return (
    <section className="relative mx-auto mt-14 max-w-295 px-4 sm:mt-18 sm:px-7 lg:mt-23">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4.5 lg:grid-cols-4">
        {features.map(feature => (
          <article
            key={feature.title}
            className="rounded-2xl border bg-card px-5.5 py-6.5 transition-all hover:-translate-y-0.5 hover:border-primary/20"
          >
            <div className="mb-4 flex size-10 items-center justify-center rounded-xl border bg-muted text-rose-700">
              <feature.icon className="size-4.5" />
            </div>

            <h3 className="mb-1.75 font-semibold text-primary">{feature.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
