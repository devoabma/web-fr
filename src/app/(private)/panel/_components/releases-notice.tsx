import { InfoIcon } from 'lucide-react'

export function ReleasesNotice() {
  return (
    <div className="hidden items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/8 p-4 sm:flex">
      <InfoIcon className="mt-0.5 size-4.5 shrink-0 text-amber-600 dark:text-amber-400" />

      <div className="flex flex-col gap-1.5 text-muted-foreground text-sm leading-relaxed">
        <p>
          O próprio advogado realiza sua liberação diretamente no computador. Esta tela deve ser usada pelo responsável pela sala
          apenas em <strong className="font-semibold text-foreground">casos especiais</strong>, quando o advogado não conseguir se
          liberar sozinho.
        </p>

        <p>
          O acesso é permitido{' '}
          <strong className="font-semibold text-foreground">
            somente aos advogados inscritos regularmente no quadro da sua Seccional.
          </strong>{' '}
          O tempo é definido por sala e <strong className="font-semibold text-foreground">compartilhado por dia</strong> — o
          advogado retoma o saldo em qualquer máquina, até a cota acabar.
        </p>
      </div>
    </div>
  )
}
