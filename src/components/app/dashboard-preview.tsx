import { cn } from '@/lib/utils'

type ComputerStatus = 'available' | 'in-use' | 'maintenance'

type Computer = {
  name: string
  status: ComputerStatus
  time?: string
}

const statusStyles: Record<
  ComputerStatus,
  { card: string; dot: string; text: string; pill: string; label: string; summary: string }
> = {
  available: {
    card: 'border-border bg-card',
    dot: 'bg-green-600',
    text: 'text-green-600',
    pill: 'border-green-600/25 bg-green-600/10 text-green-600',
    label: 'Disponível',
    summary: 'disponíveis',
  },
  'in-use': {
    card: 'border-rose-700/30 bg-rose-700/5',
    dot: 'bg-rose-700',
    text: 'text-rose-700',
    pill: 'border-rose-700/25 bg-rose-700/10 text-rose-700',
    label: 'Em uso',
    summary: 'em uso',
  },
  maintenance: {
    card: 'border-slate-500/30 bg-slate-500/5',
    dot: 'bg-slate-500',
    text: 'text-slate-500',
    pill: 'border-slate-500/25 bg-slate-500/10 text-slate-500',
    label: 'Manutenção',
    summary: 'manutenção',
  },
}

const statusOrder: ComputerStatus[] = ['available', 'in-use', 'maintenance']

const rooms = ['Sala de Fórum 01', 'Escritório Compart. A', 'Sala de Fórum 02']

const shortcuts = ['Fila de impressão', 'Relatórios']

const computers: Computer[] = [
  { name: 'PC-01', status: 'available', time: 'Livre' },
  { name: 'PC-02', status: 'in-use', time: '01:12 restante' },
  { name: 'PC-03', status: 'available', time: 'Livre' },
  { name: 'PC-04', status: 'available', time: 'Livre' },
  { name: 'PC-05', status: 'in-use', time: '00:38 restante' },
  { name: 'PC-06', status: 'maintenance', time: 'Bloqueado' },
  { name: 'PC-07', status: 'available', time: 'Livre' },
  { name: 'PC-08', status: 'available', time: 'Livre' },
]

export function DashboardPreview() {
  return (
    <section className="relative mx-auto mt-10 max-w-295 px-4 sm:mt-14 sm:px-7 lg:mt-16.5">
      <div className="overflow-hidden rounded-t-2xl border border-b-0 bg-card shadow-[0_30px_70px_rgba(22,33,62,0.14)]">
        <div className="flex items-center gap-2.5 border-b bg-muted/40 px-3.5 py-3 sm:gap-3.5 sm:px-4.5 sm:py-3.5">
          <div className="hidden gap-1.75 sm:flex">
            <span className="size-2.75 rounded-full bg-border" />
            <span className="size-2.75 rounded-full bg-border" />
            <span className="size-2.75 rounded-full bg-border" />
          </div>

          <p className="flex min-w-0 items-center gap-2 text-muted-foreground text-xs sm:ml-2">
            <span className="size-1.5 min-w-1.5 rounded-full bg-green-600" />
            <span className="truncate">salalivre.suaempresa.com.br</span>
          </p>

          <p className="ml-auto hidden whitespace-nowrap text-muted-foreground text-xs sm:block">Funcionário · Jhon Doe</p>
        </div>

        <div className="flex flex-col md:min-h-107.5 md:flex-row">
          <aside className="w-full border-b bg-muted/40 px-3.5 py-4 md:w-52.5 md:border-r md:border-b-0 md:py-4.5">
            <p className="px-2.5 pb-2 text-[10px] text-muted-foreground uppercase tracking-widest md:pb-3">Salas</p>

            <nav className="-mx-3.5 flex gap-0.75 overflow-x-auto px-3.5 md:mx-0 md:flex-col md:overflow-visible md:px-0">
              {rooms.map((room, index) => (
                <span
                  key={room}
                  className={cn(
                    'flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-2.75 py-2.5 text-muted-foreground text-sm',
                    index === 0 && 'bg-primary font-semibold text-primary-foreground'
                  )}
                >
                  <span className={cn('size-1.75 min-w-1.75 rounded-full bg-border', index === 0 && 'bg-rose-700')} />
                  {room}
                </span>
              ))}
            </nav>

            <div className="mx-1 my-4 hidden h-px bg-border md:block" />

            <nav className="hidden flex-col gap-0.75 md:flex">
              {shortcuts.map(shortcut => (
                <span key={shortcut} className="rounded-lg px-2.75 py-2.25 text-muted-foreground text-sm">
                  {shortcut}
                </span>
              ))}
            </nav>
          </aside>

          <div className="flex-1 bg-card px-4 py-5 sm:px-6 sm:py-5.5">
            <div className="mb-5 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-semibold text-base text-primary sm:text-lg">Sala de Fórum 01</h2>
                <p className="mt-1 text-muted-foreground text-xs">
                  Tempo padrão de sessão · 120 min · {computers.length} computadores
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {statusOrder.map(status => (
                  <span key={status} className={cn('rounded-full border px-3 py-1.5 text-[11.5px]', statusStyles[status].pill)}>
                    {computers.filter(computer => computer.status === status).length} {statusStyles[status].summary}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {computers.map(computer => {
                const status = statusStyles[computer.status]

                return (
                  <div
                    key={computer.name}
                    className={cn('flex min-h-27 flex-col justify-between rounded-xl border p-3.5', status.card)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-primary text-sm">{computer.name}</span>
                      <span className={cn('size-2 min-w-2 rounded-full', status.dot)} />
                    </div>

                    <div>
                      <p className="mb-1.75 text-[11px] text-muted-foreground">{status.label}</p>
                      <p className={cn('font-semibold text-[11.5px]', status.text)}>{computer.time}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
