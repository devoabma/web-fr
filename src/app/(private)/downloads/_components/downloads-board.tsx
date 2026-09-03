'use client'

import { useQuery } from '@tanstack/react-query'
import { PackageIcon, Trash2Icon, TriangleAlertIcon } from 'lucide-react'
import { useMemo } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { DOWNLOAD_KIND_HINTS, DOWNLOAD_KIND_LABELS, DOWNLOAD_KINDS, type DownloadKind } from '@/constants/download-kinds'
import { queryKeys } from '@/constants/query-keys'
import { type DownloadProps, getAllDownloads } from '@/server/downloads/get-all'
import { DownloadCard } from './download-card'
import { DownloadsHistory } from './downloads-history'
import { NewDownload } from './new-download'

type DownloadsBoardProps = {
  isAdmin: boolean
}

/**
 * A tela é desenhada como **um slot por tipo**, e não como uma lista.
 *
 * É a regra "um ativo por tipo" da api-fr virada em layout: cada tipo tem exatamente um lugar, que
 * está ocupado ou vazio. Numa lista solta, dois instaladores ativos (o que a api-fr impede, mas que
 * uma corrida entre dois ADMIN ainda poderia produzir) apareceriam como duas linhas igualmente
 * plausíveis — aqui o segundo simplesmente não teria onde caber, e a duplicidade fica visível.
 *
 * O botão de cadastrar mora no slot vazio pelo mesmo motivo: só se oferece publicar o que não
 * esbarra em nada.
 */
export function DownloadsBoard({ isAdmin }: DownloadsBoardProps) {
  const { data, isPending, isError } = useQuery({
    queryKey: queryKeys.getDownloads(),
    queryFn: getAllDownloads,
  })

  const { activeByKind, inactiveDownloads, activeKinds } = useMemo(() => {
    const downloads = data?.downloads ?? []

    // A api-fr já devolve o mais recente primeiro dentro de cada tipo, então o `find` pega o ativo
    // certo mesmo no caso patológico de haver mais de um.
    const activeByKind = Object.fromEntries(
      DOWNLOAD_KINDS.map(kind => [kind, downloads.find(download => download.kind === kind && !download.inactive)])
    ) as Record<DownloadKind, DownloadProps | undefined>

    return {
      activeByKind,
      // Só o ADMIN recebe inativos da api-fr; para os demais esta lista nasce vazia e a seção some.
      inactiveDownloads: downloads.filter(download => download.inactive),
      activeKinds: DOWNLOAD_KINDS.filter(kind => !!activeByKind[kind]),
    }
  }, [data])

  if (isError) {
    return (
      <div
        role="alert"
        className="flex items-start gap-2.5 rounded-xl border border-destructive/25 bg-destructive/6 px-4 py-3.5 text-destructive"
      >
        <TriangleAlertIcon className="mt-px size-4 shrink-0" />

        <span className="text-sm leading-snug">
          Não foi possível carregar os arquivos agora. Recarregue a página e, se continuar assim, verifique sua conexão.
        </span>
      </div>
    )
  }

  if (isPending) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {DOWNLOAD_KINDS.map(kind => (
          <Skeleton key={kind} className="h-52 rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {DOWNLOAD_KINDS.map(kind => {
          const download = activeByKind[kind]

          if (download) {
            return <DownloadCard key={kind} download={download} isAdmin={isAdmin} />
          }

          const isInstaller = kind === 'INSTALLER'

          return (
            <div
              key={kind}
              className="flex min-h-52 flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-6 text-center"
            >
              <span className="flex size-9 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                {isInstaller ? <PackageIcon className="size-4.5" /> : <Trash2Icon className="size-4.5" />}
              </span>

              <p className="font-medium text-primary text-sm">Nenhum {DOWNLOAD_KIND_LABELS[kind].toLowerCase()} publicado</p>

              <p className="max-w-xs text-muted-foreground text-xs leading-relaxed">
                {isAdmin
                  ? DOWNLOAD_KIND_HINTS[kind]
                  : 'Assim que a administração publicar o arquivo, ele aparece aqui para download.'}
              </p>

              {isAdmin && <NewDownload kind={kind} />}
            </div>
          )
        })}
      </div>

      {isAdmin && <DownloadsHistory downloads={inactiveDownloads} activeKinds={activeKinds} />}
    </>
  )
}
