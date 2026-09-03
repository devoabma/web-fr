import { InfoIcon } from 'lucide-react'

type DownloadsNoticeProps = {
  isAdmin: boolean
}

export function DownloadsNotice({ isAdmin }: DownloadsNoticeProps) {
  return (
    <div className="hidden items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/8 p-4 sm:flex">
      <InfoIcon className="mt-0.5 size-4.5 shrink-0 text-amber-600 dark:text-amber-400" />

      <div className="flex flex-col gap-1.5 text-muted-foreground text-sm leading-relaxed">
        <p>
          Instale com a estação <strong className="font-semibold text-foreground">fora de uso</strong>: a instalação fecha o Sala
          Livre, e uma liberação em andamento fica sem a tela que a controla.
        </p>

        {isAdmin ? (
          <p>
            Fica no ar <strong className="font-semibold text-foreground">um arquivo de cada tipo</strong>. Para publicar uma
            versão nova, tire a atual do ar — ela vai para o histórico com o endereço que usava, e é de lá que você a traz de
            volta se o link novo sair quebrado.
          </p>
        ) : (
          <p>
            Estes são os arquivos <strong className="font-semibold text-foreground">publicados pela administração</strong>. Se
            algum link não abrir, avise em vez de procurar o instalador em outro lugar.
          </p>
        )}
      </div>
    </div>
  )
}
