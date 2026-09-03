'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2Icon, PlusIcon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { DOWNLOAD_KIND_HINTS, DOWNLOAD_KIND_LABELS, type DownloadKind } from '@/constants/download-kinds'
import { queryKeys } from '@/constants/query-keys'
import { formatWaitTime, getApiErrorMessage, getRetryAfterInSeconds } from '@/lib/http/api-error'
import { createDownload } from '@/server/downloads/create'
import { type NewDownloadFormType, useNewDownloadForm } from './new-download-schema'

type NewDownloadProps = {
  kind: DownloadKind
}

/**
 * O tipo vem de fora, do slot vazio que renderizou este botão — não há `select` de `kind` no
 * formulário. É a regra "um ativo por tipo" desenhada na tela: só existe "cadastrar instalador"
 * enquanto não há instalador ativo. Com um seletor livre, o ADMIN escolheria um tipo já ocupado e
 * descobriria o problema só no `400` da api-fr.
 */
export function NewDownload({ kind }: NewDownloadProps) {
  const [open, setOpen] = useState(false)

  const queryClient = useQueryClient()

  const kindLabel = DOWNLOAD_KIND_LABELS[kind]

  const {
    register,
    reset,
    setFocus,
    handleSubmit,
    formState: { errors },
  } = useNewDownloadForm()

  const { mutateAsync: createDownloadMutation, isPending: isCreating } = useMutation({
    mutationFn: createDownload,
  })

  function closeDrawer() {
    setOpen(false)
    reset()
  }

  /** Só o que o usuário dispara (ESC, clique fora, arrasto, botão de fechar). O sucesso fecha por `closeDrawer`. */
  function handleOpenChange(value: boolean) {
    if (value) {
      setOpen(true)
      return
    }

    // Fechar no meio da chamada limparia o formulário com a requisição ainda de pé: o toast de erro
    // chegaria depois, sem a URL na tela para corrigir e tentar de novo — e ela é longa de recolar.
    if (isCreating) return

    closeDrawer()
  }

  async function handleCreateDownload({ name, url, version, description }: NewDownloadFormType) {
    try {
      await createDownloadMutation({
        kind,
        name,
        url,
        // Campo vazio não é valor: `undefined` some do corpo e a api-fr grava `null` em vez de `''`.
        version: version || undefined,
        description: description || undefined,
      })

      await queryClient.invalidateQueries({ queryKey: queryKeys.getDownloads() })

      toast.success(`${kindLabel} publicado.`, {
        description: `${name} já aparece para os colaboradores baixarem.`,
      })

      closeDrawer()
    } catch (err) {
      setFocus('name')

      const retryAfterInSeconds = getRetryAfterInSeconds(err)

      toast.error(
        retryAfterInSeconds
          ? `Muitas tentativas. Tente novamente em ${formatWaitTime(retryAfterInSeconds)}.`
          : // A mensagem de "já existe um ativo deste tipo" nomeia o registro que está no caminho:
            // repassá-la crua é mais útil que qualquer texto genérico escrito aqui.
            getApiErrorMessage(err, `Não foi possível publicar o ${kindLabel.toLowerCase()}. Verifique sua conexão.`)
      )
    }
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange} swipeDirection="right">
      <DrawerTrigger render={<Button variant="outline" size="sm" />}>
        <PlusIcon data-icon="inline-start" /> Cadastrar {kindLabel.toLowerCase()}
      </DrawerTrigger>

      <DrawerContent className="rounded-xl border shadow-lg [--drawer-bleed-background:transparent] [--drawer-inset:0.75rem] sm:[--drawer-content-width:30rem]!">
        <DrawerHeader className="relative pb-4">
          <DrawerTitle>Novo {kindLabel.toLowerCase()}</DrawerTitle>

          <DrawerDescription>{DOWNLOAD_KIND_HINTS[kind]}</DrawerDescription>

          <DrawerClose render={<Button variant="ghost" size="icon-sm" className="absolute top-3 right-3" />}>
            <XIcon />
            <span className="sr-only">Fechar</span>
          </DrawerClose>
        </DrawerHeader>

        <form
          noValidate
          id="new-download-form"
          onSubmit={handleSubmit(handleCreateDownload)}
          className="flex-1 overflow-y-auto px-4"
        >
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="new-download-name">Nome do arquivo</FieldLabel>

              <Input
                id="new-download-name"
                placeholder={kind === 'INSTALLER' ? 'Sala Livre 1.0.12' : 'Desinstalador do Sala Livre'}
                autoComplete="off"
                aria-invalid={!!errors.name}
                className="h-10"
                {...register('name')}
              />

              {errors.name ? (
                <FieldError errors={[errors.name]} />
              ) : (
                <FieldDescription>É o texto que o colaborador lê no botão desta tela.</FieldDescription>
              )}
            </Field>

            <Field data-invalid={!!errors.url}>
              <FieldLabel htmlFor="new-download-url">Endereço do arquivo</FieldLabel>

              <Input
                id="new-download-url"
                type="url"
                inputMode="url"
                placeholder="https://arquivos.oabma.org.br/SalaLivreSetup.exe"
                autoComplete="off"
                spellCheck={false}
                aria-invalid={!!errors.url}
                className="h-10"
                {...register('url')}
              />

              {/* O link tem de ser direto: um endereço de pasta compartilhada abre uma tela de login
                  e o colaborador do balcão não passa dela. */}
              {errors.url ? (
                <FieldError errors={[errors.url]} />
              ) : (
                <FieldDescription>Cole o link direto do arquivo, o mesmo que o desenvolvedor entregou.</FieldDescription>
              )}
            </Field>

            <Field data-invalid={!!errors.version}>
              <FieldLabel htmlFor="new-download-version">Versão</FieldLabel>

              <Input
                id="new-download-version"
                placeholder="1.0.12"
                autoComplete="off"
                aria-invalid={!!errors.version}
                className="h-10 tabular-nums"
                {...register('version')}
              />

              {/* O Painel mostra a versão que cada estação informou, mas a régua dele é a maior versão
                  vista na própria sala — ele não sabe o que foi publicado. Preencher aqui é o que dá ao
                  operador o número oficial para comparar com o que está na tela dele. */}
              {errors.version ? (
                <FieldError errors={[errors.version]} />
              ) : (
                <FieldDescription>Opcional. É o número que se compara com o que cada estação mostra no Painel.</FieldDescription>
              )}
            </Field>

            <Field data-invalid={!!errors.description}>
              <FieldLabel htmlFor="new-download-description">Observação</FieldLabel>

              <Textarea
                id="new-download-description"
                rows={3}
                placeholder="Instale com a máquina fora de uso e reinicie ao terminar."
                aria-invalid={!!errors.description}
                className="resize-none"
                {...register('description')}
              />

              <FieldError errors={[errors.description]} />
            </Field>
          </FieldGroup>
        </form>

        <DrawerFooter className="flex w-full flex-row items-center justify-end border-t pt-4">
          {/* Sem `disabled`, o duplo clique dispara dois POST: o primeiro publica e o segundo volta
              como "já existe um ativo deste tipo" — erro para um cadastro que acabou de dar certo. */}
          <Button type="submit" form="new-download-form" className="w-full" disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2Icon data-icon="inline-start" className="animate-spin" /> Publicando
              </>
            ) : (
              <>
                <PlusIcon data-icon="inline-start" /> Publicar {kindLabel.toLowerCase()}
              </>
            )}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
