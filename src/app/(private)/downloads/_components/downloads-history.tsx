'use client'

import { format, isValid, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { HistoryIcon } from 'lucide-react'
import { DOWNLOAD_KIND_LABELS, type DownloadKind } from '@/constants/download-kinds'
import type { DownloadProps } from '@/server/downloads/get-all'
import { parseDownloadLink } from '../_data/download-link'
import { ActivateDownload } from './activate-download'

type DownloadsHistoryProps = {
  downloads: DownloadProps[]
  /** Tipos que já têm um arquivo no ar — quem estiver nesta lista não aceita reativação. */
  activeKinds: DownloadKind[]
}

/**
 * Só o ADMIN chega aqui, porque só a ele a api-fr devolve os registros inativos.
 *
 * Existe para responder "para onde este link apontava antes": quando o executável novo sai
 * quebrado, é neste histórico que está o endereço que funcionava — e o botão de reativar evita o
 * caminho de recolar a URL antiga à mão, que é onde nasce o erro de digitação.
 */
export function DownloadsHistory({ downloads, activeKinds }: DownloadsHistoryProps) {
  if (downloads.length === 0) return null

  return (
    <section className="flex flex-col gap-3">
      <header className="flex items-center gap-2">
        <HistoryIcon className="size-4 text-muted-foreground" />

        <h2 className="font-semibold text-primary text-sm">Histórico</h2>

        <span className="text-muted-foreground text-xs">
          {downloads.length === 1 ? '1 arquivo fora do ar' : `${downloads.length} arquivos fora do ar`}
        </span>
      </header>

      <ul className="flex flex-col divide-y overflow-hidden rounded-xl border bg-card shadow-xs">
        {downloads.map(download => {
          const link = parseDownloadLink(download.url)
          const inactiveSince = download.inactive ? parseISO(download.inactive) : null

          return (
            <li key={download.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="flex items-center gap-1.5 font-medium text-sm leading-tight">
                  {download.name}

                  {download.version && <span className="text-muted-foreground tabular-nums">· v{download.version}</span>}
                </span>

                <span className="truncate text-muted-foreground text-xs">
                  {DOWNLOAD_KIND_LABELS[download.kind]}
                  {link && ` · ${link.fileName ?? link.host}`}
                  {inactiveSince &&
                    isValid(inactiveSince) &&
                    ` · fora do ar desde ${format(inactiveSince, 'dd MMM. yyyy', { locale: ptBR })}`}
                </span>
              </div>

              <div className="flex shrink-0 items-center justify-end">
                <ActivateDownload download={download} hasActiveOfSameKind={activeKinds.includes(download.kind)} />
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
