'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CameraIcon, ImageUpIcon, TrashIcon, UploadIcon } from 'lucide-react'
import { type ChangeEvent, type SubmitEvent, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { queryKeys } from '@/constants/query-keys'
import { formatWaitTime, getApiErrorMessage, getRetryAfterInSeconds } from '@/lib/http/api-error'
import type { GetProfileResponse } from '@/server/employees/get-profile'
import { updateImageProfile } from '@/server/employees/update-image-profile'
import { getInitials } from '@/utils'
import { ACCEPTED_IMAGE_TYPES_ATTRIBUTE, formatFileSize, MAX_AVATAR_SIZE_LABEL, validateAvatarFile } from './update-avatar-schema'

type UpdateAvatarDialogProps = {
  name: string
  imageUrl: string | null
}

export function UpdateAvatarDialog({ name, imageUrl }: UpdateAvatarDialogProps) {
  const [isOpen, setIsOpen] = useState(false)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const queryClient = useQueryClient()

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null)
      return
    }

    const objectUrl = URL.createObjectURL(selectedFile)

    setPreviewUrl(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [selectedFile])

  const { mutateAsync: updateProfileImageMutate, isPending } = useMutation({
    mutationFn: updateImageProfile,
  })

  function clearSelection() {
    setSelectedFile(null)
    setErrorMessage(null)

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function closeDialog() {
    setIsOpen(false)

    clearSelection()
  }

  /** Só o que o usuário dispara (ESC, clique fora, botão Cancelar). O sucesso fecha por `closeDialog`. */
  function handleOpenChange(open: boolean) {
    if (open) {
      setIsOpen(true)
      return
    }

    // Fechar no meio do upload descartaria o arquivo com a requisição ainda de pé: o toast de erro chegaria
    // depois, sem a imagem selecionada na tela para tentar de novo.
    if (isPending) return

    closeDialog()
  }

  function handleSelectFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) return

    const validationError = validateAvatarFile(file)

    if (validationError) {
      // O arquivo recusado não fica selecionado: manter o preview de algo que não pode subir só confunde.
      clearSelection()
      setErrorMessage(validationError)

      return
    }

    setSelectedFile(file)
    setErrorMessage(null)
  }

  async function handleUpdateAvatar(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedFile) {
      setErrorMessage('Escolha uma imagem antes de enviar.')
      return
    }

    try {
      const { imageUrl: newImageUrl } = await updateProfileImageMutate({ file: selectedFile })

      queryClient.setQueryData<GetProfileResponse>(queryKeys.getProfile(), previous =>
        previous ? { employee: { ...previous.employee, imageUrl: newImageUrl } } : previous
      )

      closeDialog()

      toast.success('Foto de perfil atualizada.')
    } catch (err) {
      const retryAfterInSeconds = getRetryAfterInSeconds(err)

      // A `message` da api-fr é o que explica a recusa (formato, peso, imagem corrompida). O texto genérico
      // só entra quando não veio resposta nenhuma — queda de rede, 502 respondendo HTML.
      toast.error(
        retryAfterInSeconds
          ? `Muitas tentativas. Tente novamente em ${formatWaitTime(retryAfterInSeconds)}.`
          : getApiErrorMessage(err, 'Não foi possível atualizar a foto. Verifique sua conexão e tente novamente.')
      )
    }
  }

  const currentImageUrl = previewUrl ?? imageUrl

  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              aria-label="Atualizar foto de perfil"
              onClick={() => setIsOpen(true)}
              className="group relative shrink-0 cursor-pointer rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          }
        >
          <Avatar className="size-14 rounded-xl after:rounded-xl">
            {imageUrl && <AvatarImage src={imageUrl} alt={name} className="rounded-xl" />}

            <AvatarFallback className="rounded-xl text-base">{getInitials(name)}</AvatarFallback>
          </Avatar>

          {/* A câmera só aparece no hover/foco: em repouso o cartão continua sendo o perfil, não um formulário. */}
          <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-primary/60 text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            <CameraIcon className="size-5" />
          </span>
        </TooltipTrigger>

        <TooltipContent>Atualizar foto de perfil</TooltipContent>
      </Tooltip>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Atualizar foto de perfil</DialogTitle>

            <DialogDescription>
              Envie uma imagem PNG, JPG ou WEBP de até {MAX_AVATAR_SIZE_LABEL}. Ela aparece no seu perfil e no menu do painel.
            </DialogDescription>
          </DialogHeader>

          <form noValidate id="update-avatar-form" onSubmit={handleUpdateAvatar}>
            <div className="flex items-center gap-4 rounded-xl border bg-muted/30 p-4">
              <Avatar className="size-20 rounded-xl after:rounded-xl">
                {currentImageUrl && <AvatarImage src={currentImageUrl} alt={name} className="rounded-xl" />}

                <AvatarFallback className="rounded-xl text-xl">{getInitials(name)}</AvatarFallback>
              </Avatar>

              <div className="flex min-w-0 flex-col items-start gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <ImageUpIcon data-icon="inline-start" />
                  {selectedFile ? 'Trocar imagem' : 'Escolher imagem'}
                </Button>

                {selectedFile ? (
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span className="truncate text-muted-foreground text-xs">
                      {selectedFile.name} · {formatFileSize(selectedFile.size)}
                    </span>

                    <button
                      type="button"
                      aria-label="Remover imagem selecionada"
                      onClick={clearSelection}
                      disabled={isPending}
                      className="shrink-0 cursor-pointer text-muted-foreground transition-colors hover:text-destructive disabled:pointer-events-none disabled:opacity-50"
                    >
                      <TrashIcon className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-xs">Nenhuma imagem selecionada.</span>
                )}
              </div>

              {/* O input nativo fica escondido porque seu visual não acompanha o resto do painel — quem
                  abre a janela do sistema é o botão acima, que herda o estilo dos demais. */}
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_IMAGE_TYPES_ATTRIBUTE}
                onChange={handleSelectFile}
                disabled={isPending}
                className="hidden"
              />
            </div>

            {errorMessage && (
              <p role="alert" className="mt-2 text-destructive text-sm">
                {errorMessage}
              </p>
            )}
          </form>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" disabled={isPending} />}>Cancelar</DialogClose>

            <Button type="submit" form="update-avatar-form" disabled={isPending || !selectedFile}>
              <UploadIcon data-icon="inline-start" />
              {isPending ? 'Enviando...' : 'Enviar foto'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
