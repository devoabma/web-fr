import { InfoIcon } from 'lucide-react'

export function ReportsNotice() {
  return (
    <div className="hidden shrink-0 items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/8 p-3 sm:flex">
      <InfoIcon className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />

      <div className="flex flex-col gap-1 text-muted-foreground text-sm leading-relaxed">
        <p>
          O <strong className="font-medium text-foreground">tempo é somado apenas sobre sessões encerradas</strong>; as que ainda
          estavam em andamento contam como acesso. Registros excluídos continuam no histórico.
        </p>

        <p>
          Os números podem divergir de <strong className="font-medium text-foreground">Métricas</strong>, que recorta por ano e
          mostra a cada pessoa apenas as salas em que ela atua.
        </p>
      </div>
    </div>
  )
}
