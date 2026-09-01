import { InfoIcon } from 'lucide-react'

export function ReportsNotice() {
  return (
    <div className="hidden items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/8 p-4 sm:flex">
      <InfoIcon className="mt-0.5 size-4.5 shrink-0 text-amber-600 dark:text-amber-400" />

      <div className="flex flex-col gap-1.5 text-muted-foreground text-sm leading-relaxed">
        <p>
          Esta tela é <strong className="font-semibold text-foreground">exclusiva da administração</strong> e enxerga{' '}
          <strong className="font-semibold text-foreground">todas as salas</strong>, inclusive aquelas em que você não está
          vinculado(a).
        </p>

        <p>
          Registros excluídos continuam contando no histórico: a exclusão apenas os tira da operação do dia a dia, não do que já
          aconteceu.
        </p>
      </div>
    </div>
  )
}
