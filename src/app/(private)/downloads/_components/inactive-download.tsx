'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2Icon, ToggleRightIcon, TriangleAlertIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { DOWNLOAD_KIND_LABELS } from '@/constants/download-kinds'
import { queryKeys } from '@/constants/query-keys'
import { formatWaitTime, getApiErrorMessage, getRetryAfterInSeconds } from '@/lib/http/api-error'
import type { DownloadProps } from '@/server/downloads/get-all'
import { deactivateDownload } from '@/server/downloads/inactive'

type InactiveDownloadProps = {
  download: DownloadProps
}

/**
 * Inativar é o único jeito de tirar um link do ar — a api-fr não oferece exclusão física, e o
 * registro fica no banco respondendo para onde aquele endereço apontava.
 *
 * É também o passo obrigatório antes de publicar outro arquivo do mesmo tipo, e por isso a
 * confirmação diz isso: quem chega aqui costuma estar no meio de uma troca de versão, não removendo
 * o download de vez.
 */
export function InactiveDownload({ download }: InactiveDownloadProps) {
  const [open, setOpen] = useState(false)

  const queryClient = useQueryClient()

  const kindLabel = DOWNLOAD_KIND_LABELS[download.kind]

  const { mutateAsync: deactivateDownloadMutation, isPending: isDeactivating } = useMutation({
    mutationFn: deactivateDownload,
  })

  /** Fechar no meio da chamada esconderia o contexto: o toast de erro chegaria sem o arquivo na tela. */
  function handleOpenChange(value: boolean) {
    if (!value && isDeactivating) return

    setOpen(value)
  }

  async function handleDeactivateDownload() {
    try {
      await deactivateDownloadMutation(download.id)

      await queryClient.invalidateQueries({ queryKey: queryKeys.getDownloads() })

      toast.success(`${kindLabel} retirado do ar.`, {
        description: 'Ele sai da lista dos colaboradores e continua no histórico, pronto para ser reativado.',
      })

      setOpen(false)
    } catch (err) {
      const retryAfterInSeconds = getRetryAfterInSeconds(err)

      toast.error(
        retryAfterInSeconds
          ? `Muitas tentativas. Tente novamente em ${formatWaitTime(retryAfterInSeconds)}.`
          : getApiErrorMessage(err, 'Não foi possível inativar o arquivo. Verifique sua conexão e tente novamente.')
      )
    }
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="outline"
              size="icon"
              aria-label={`Inativar ${download.name}`}
              className="text-emerald-600"
              onClick={() => setOpen(true)}
            />
          }
        >
          <ToggleRightIcon />
        </TooltipTrigger>

        <TooltipContent>Tirar do ar</TooltipContent>
      </Tooltip>

      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <TriangleAlertIcon />
            </AlertDialogMedia>

            <AlertDialogTitle>Tirar {download.name} do ar?</AlertDialogTitle>

            <AlertDialogDescription>
              O {kindLabel.toLowerCase()} deixa de aparecer para os colaboradores e esta tela fica sem nenhum arquivo deste tipo
              até você publicar outro. Nada é apagado: o registro vai para o histórico e pode voltar a valer.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeactivating}>Cancelar</AlertDialogCancel>

            {/* Sem `disabled`, o duplo clique dispara dois PATCH: o segundo volta como "já está
                inativo" e o usuário vê um erro para uma ação que acabou de dar certo. */}
            <AlertDialogAction variant="destructive" disabled={isDeactivating} onClick={handleDeactivateDownload}>
              {isDeactivating ? (
                <>
                  <Loader2Icon data-icon="inline-start" className="animate-spin" /> Tirando do ar
                </>
              ) : (
                'Tirar do ar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
