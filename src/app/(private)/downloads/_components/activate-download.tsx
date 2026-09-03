'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2Icon, ToggleLeftIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { DOWNLOAD_KIND_LABELS } from '@/constants/download-kinds'
import { queryKeys } from '@/constants/query-keys'
import { formatWaitTime, getApiErrorMessage, getRetryAfterInSeconds } from '@/lib/http/api-error'
import { activateDownload } from '@/server/downloads/activate'
import type { DownloadProps } from '@/server/downloads/get-all'

type ActivateDownloadProps = {
  download: DownloadProps
  /**
   * Se já existe um ativo do mesmo tipo. A api-fr recusaria a reativação com `400`, então em vez do
   * botão a linha explica o que fazer antes — clique que só devolve erro não é ação, é armadilha.
   */
  hasActiveOfSameKind: boolean
}

/** Voltar atrás: o link novo saiu quebrado e o anterior precisa valer de novo. */
export function ActivateDownload({ download, hasActiveOfSameKind }: ActivateDownloadProps) {
  const queryClient = useQueryClient()

  const kindLabel = DOWNLOAD_KIND_LABELS[download.kind]

  const { mutateAsync: activateDownloadMutation, isPending: isActivating } = useMutation({
    mutationFn: activateDownload,
  })

  async function handleActivateDownload() {
    try {
      await activateDownloadMutation(download.id)

      await queryClient.invalidateQueries({ queryKey: queryKeys.getDownloads() })

      toast.success(`${download.name} voltou ao ar.`, {
        description: `É este o ${kindLabel.toLowerCase()} que os colaboradores passam a baixar.`,
      })
    } catch (err) {
      const retryAfterInSeconds = getRetryAfterInSeconds(err)

      toast.error(
        retryAfterInSeconds
          ? `Muitas tentativas. Tente novamente em ${formatWaitTime(retryAfterInSeconds)}.`
          : getApiErrorMessage(err, 'Não foi possível reativar o arquivo. Verifique sua conexão e tente novamente.')
      )
    }
  }

  // Fora de um tooltip de propósito: botão desabilitado não recebe evento de ponteiro na maior parte
  // dos navegadores, e a explicação de por que ele está desabilitado nunca apareceria.
  if (hasActiveOfSameKind) {
    return (
      <span className="text-muted-foreground text-xs leading-snug">
        Tire o {kindLabel.toLowerCase()} atual do ar para reativar este.
      </span>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      aria-label={`Reativar ${download.name}`}
      disabled={isActivating}
      onClick={handleActivateDownload}
    >
      {isActivating ? (
        <>
          <Loader2Icon data-icon="inline-start" className="animate-spin" /> Reativando
        </>
      ) : (
        <>
          <ToggleLeftIcon data-icon="inline-start" /> Reativar
        </>
      )}
    </Button>
  )
}
