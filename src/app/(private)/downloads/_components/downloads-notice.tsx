import { InfoIcon } from 'lucide-react'

export function DownloadsNotice() {
  return (
    <div className="hidden items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/8 p-4 sm:flex">
      <InfoIcon className="mt-0.5 size-4.5 shrink-0 text-amber-600 dark:text-amber-400" />

      <div className="flex flex-col gap-1.5 text-muted-foreground text-sm leading-relaxed">
        <p>
          Os arquivos enviados para impressão são apagados{' '}
          <strong className="font-semibold text-foreground">toda sexta-feira às 23:59</strong>. O que precisar ser guardado deve
          ser baixado antes disso.
        </p>

        <p>
          Você enxerga apenas os arquivos das{' '}
          <strong className="font-semibold text-foreground">salas em que está vinculado(a).</strong>
        </p>
      </div>
    </div>
  )
}
