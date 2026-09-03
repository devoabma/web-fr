'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2Icon, SaveIcon, SquarePen } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { DOWNLOAD_KIND_LABELS } from '@/constants/download-kinds'
import { queryKeys } from '@/constants/query-keys'
import { formatWaitTime, getApiErrorMessage, getRetryAfterInSeconds } from '@/lib/http/api-error'
import type { DownloadProps } from '@/server/downloads/get-all'
import { updateDownload } from '@/server/downloads/update'
import { type UpdateDownloadFormType, useUpdateDownloadForm } from './update-download-schema'

type UpdateDownloadProps = {
  download: DownloadProps
}

/**
 * O tipo não aparece no formulário porque não é editável na api-fr: trocar o `kind` de um registro
 * é, na prática, cadastrar outro — e obrigaria a repetir aqui a checagem de "um ativo por tipo".
 * Para mudar de tipo, inative este e cadastre o novo.
 */
export function UpdateDownload({ download }: UpdateDownloadProps) {
  const [open, setOpen] = useState(false)

  const queryClient = useQueryClient()

  const kindLabel = DOWNLOAD_KIND_LABELS[download.kind]

  const downloadFormValues: UpdateDownloadFormType = {
    name: download.name,
    url: download.url,
    version: download.version ?? '',
    description: download.description ?? '',
  }

  const {
    register,
    reset,
    setFocus,
    handleSubmit,
    formState: { errors, isDirty },
  } = useUpdateDownloadForm(downloadFormValues)

  const { mutateAsync: updateDownloadMutation, isPending: isUpdating } = useMutation({
    mutationFn: updateDownload,
  })

  function handleOpenChange(value: boolean) {
    if (value) {
      // O `reset` na abertura, e não no fechamento: entre uma edição e outra o registro pode ter
      // mudado no servidor, e o formulário precisa abrir com o que está valendo agora.
      reset(downloadFormValues)
      setOpen(true)

      return
    }

    if (isUpdating) return

    setOpen(false)
  }

  async function handleUpdateDownload({ name, url, version, description }: UpdateDownloadFormType) {
    try {
      await updateDownloadMutation({
        downloadId: download.id,
        name,
        url,
        // `null` limpa o campo na api-fr, `undefined` o manteria: apagar a versão de um link é
        // edição legítima, e é isso que o campo esvaziado quer dizer.
        version: version || null,
        description: description || null,
      })

      await queryClient.invalidateQueries({ queryKey: queryKeys.getDownloads() })

      toast.success(`${kindLabel} atualizado.`, {
        description: 'O botão desta tela já aponta para o novo endereço.',
      })

      setOpen(false)
    } catch (err) {
      setFocus('name')

      const retryAfterInSeconds = getRetryAfterInSeconds(err)

      toast.error(
        retryAfterInSeconds
          ? `Muitas tentativas. Tente novamente em ${formatWaitTime(retryAfterInSeconds)}.`
          : getApiErrorMessage(err, 'Não foi possível salvar as alterações. Verifique sua conexão e tente novamente.')
      )
    }
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button variant="outline" size="icon" aria-label={`Editar ${download.name}`} onClick={() => handleOpenChange(true)} />
          }
        >
          <SquarePen />
        </TooltipTrigger>

        <TooltipContent>Editar {kindLabel.toLowerCase()}</TooltipContent>
      </Tooltip>

      <Dialog open={open} onOpenChange={handleOpenChange} disablePointerDismissal>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar {kindLabel.toLowerCase()}</DialogTitle>

            <DialogDescription>
              A troca vale na hora para quem abrir a tela depois de salvar. O tipo não muda aqui: para isso, inative este registro
              e cadastre outro.
            </DialogDescription>
          </DialogHeader>

          <form noValidate id="update-download-form" onSubmit={handleSubmit(handleUpdateDownload)}>
            <FieldGroup>
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="update-download-name">Nome do arquivo</FieldLabel>

                <Input
                  id="update-download-name"
                  autoComplete="off"
                  aria-invalid={!!errors.name}
                  className="h-10"
                  {...register('name')}
                />

                <FieldError errors={[errors.name]} />
              </Field>

              <Field data-invalid={!!errors.url}>
                <FieldLabel htmlFor="update-download-url">Endereço do arquivo</FieldLabel>

                <Input
                  id="update-download-url"
                  type="url"
                  inputMode="url"
                  autoComplete="off"
                  spellCheck={false}
                  aria-invalid={!!errors.url}
                  className="h-10"
                  {...register('url')}
                />

                {errors.url ? (
                  <FieldError errors={[errors.url]} />
                ) : (
                  <FieldDescription>Link direto do arquivo, começando com https://</FieldDescription>
                )}
              </Field>

              <Field data-invalid={!!errors.version}>
                <FieldLabel htmlFor="update-download-version">Versão</FieldLabel>

                <Input
                  id="update-download-version"
                  placeholder="1.0.12"
                  autoComplete="off"
                  aria-invalid={!!errors.version}
                  className="h-10 tabular-nums"
                  {...register('version')}
                />

                {errors.version ? (
                  <FieldError errors={[errors.version]} />
                ) : (
                  <FieldDescription>Deixe em branco para apagar a versão deste registro.</FieldDescription>
                )}
              </Field>

              <Field data-invalid={!!errors.description}>
                <FieldLabel htmlFor="update-download-description">Observação</FieldLabel>

                <Textarea
                  id="update-download-description"
                  rows={3}
                  aria-invalid={!!errors.description}
                  className="resize-none"
                  {...register('description')}
                />

                <FieldError errors={[errors.description]} />
              </Field>
            </FieldGroup>
          </form>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" disabled={isUpdating} />}>Cancelar</DialogClose>

            <Button type="submit" form="update-download-form" disabled={!isDirty || isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2Icon data-icon="inline-start" className="animate-spin" /> Salvando
                </>
              ) : (
                <>
                  <SaveIcon data-icon="inline-start" /> Salvar alterações
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
