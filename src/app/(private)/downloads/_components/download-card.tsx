'use client'

import { format, isValid, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { DownloadIcon, LinkIcon, PackageIcon, Trash2Icon, TriangleAlertIcon } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { DOWNLOAD_KIND_HINTS, DOWNLOAD_KIND_LABELS } from '@/constants/download-kinds'
import { cn } from '@/lib/utils'
import type { DownloadProps } from '@/server/downloads/get-all'
import { parseDownloadLink } from '../_data/download-link'
import { InactiveDownload } from './inactive-download'
import { UpdateDownload } from './update-download'

type DownloadCardProps = {
  download: DownloadProps
  /** Liga as ações de gestão. O papel vem do cookie no servidor — aqui ele só decide o que desenhar. */
  isAdmin: boolean
}

export function DownloadCard({ download, isAdmin }: DownloadCardProps) {
  const { kind, name, description, version, url, createdAt } = download

  // Verde e cinza são os mesmos do Painel de Liberações ("disponível" e "manutenção"), e não uma
  // paleta nova: o instalador é o arquivo que põe a estação em operação, o desinstalador é o que se
  // usa quando ela sai. A cor repete a leitura que o operador já faz na outra tela.
  const isInstaller = kind === 'INSTALLER'

  const link = parseDownloadLink(url)

  const publishedAt = parseISO(createdAt)

  return (
    <article
      className={cn(
        'relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-xs transition-shadow hover:shadow-md',
        isInstaller ? 'border-green-600/25' : 'border-slate-500/30'
      )}
    >
      <span aria-hidden className={cn('absolute inset-y-0 left-0 w-1', isInstaller ? 'bg-green-600' : 'bg-slate-500')} />

      <header className="flex items-start justify-between gap-3 p-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-lg border',
              isInstaller
                ? 'border-green-600/25 bg-green-600/10 text-green-600'
                : 'border-slate-500/25 bg-slate-500/10 text-slate-500'
            )}
          >
            {isInstaller ? <PackageIcon className="size-4.5" /> : <Trash2Icon className="size-4.5" />}
          </span>

          <div className="min-w-0">
            <h3 className="truncate font-semibold text-base text-primary leading-tight">{name}</h3>

            <p className="text-muted-foreground text-xs">{DOWNLOAD_KIND_LABELS[kind]}</p>
          </div>
        </div>

        {/* Mesmo `tabular-nums` da versão que cada estação mostra no Painel, de propósito: a régua de
            lá é a sala, não o que foi publicado, então quem responde "esta máquina está atrasada em
            relação ao oficial?" é o operador comparando os dois números a olho. */}
        {version && (
          <span
            className={cn(
              'shrink-0 rounded-full border px-2.5 py-1 font-medium text-[11px] tabular-nums',
              isInstaller
                ? 'border-green-600/25 bg-green-600/10 text-green-600'
                : 'border-slate-500/25 bg-slate-500/10 text-slate-500'
            )}
          >
            v{version}
          </span>
        )}
      </header>

      <div className="flex flex-1 flex-col gap-2.5 px-4 pb-4">
        <p className="text-muted-foreground text-sm leading-relaxed">{description ?? DOWNLOAD_KIND_HINTS[kind]}</p>

        {link ? (
          <Tooltip>
            <TooltipTrigger
              render={<p className="flex min-w-0 cursor-default items-center gap-2 text-muted-foreground text-xs" />}
            >
              <LinkIcon className="size-3.5 shrink-0" />
              <span className="truncate">{link.fileName ?? link.host}</span>
            </TooltipTrigger>

            {/* O endereço inteiro só no hover: ele é longo e roubaria a linha do nome do arquivo, que
                é o que responde "baixei a coisa certa?" depois do clique. */}
            <TooltipContent className="max-w-xs break-all">{link.href}</TooltipContent>
          </Tooltip>
        ) : (
          <p className="flex items-start gap-2 text-amber-600 text-xs leading-relaxed dark:text-amber-400">
            <TriangleAlertIcon className="mt-px size-3.5 shrink-0" />
            Endereço inválido — este arquivo não pode ser baixado até um administrador corrigir o link.
          </p>
        )}
      </div>

      <footer className="mt-auto flex items-center gap-2 border-t bg-muted/40 p-3">
        {/*
          `rel="noopener noreferrer"` porque o destino é um endereço externo aberto em outra aba: sem
          `noopener` a página do arquivo recebe `window.opener` e pode navegar esta aba para onde
          quiser. O `href` só existe quando o endereço passou pela conferência de protocolo — um
          `javascript:` aqui não seria link quebrado, seria script rodando no navegador de quem
          apenas queria o instalador.
        */}
        {/*
          Âncora de verdade, vestida com `buttonVariants` — e não o `Button` com `render`. O botão do
          base-ui parte de `nativeButton: true` e, ao emprestar a tag para um `<a>`, ou avisa no
          console ou (com `nativeButton={false}`) carimba `role="button"` por cima, fazendo o leitor
          de tela anunciar "botão" onde há navegação. Aqui só o estilo é compartilhado; a semântica
          continua sendo a do link.
        */}
        {link ? (
          <a
            aria-label={`Baixar ${name}`}
            className={cn(buttonVariants(), 'flex-1')}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <DownloadIcon data-icon="inline-start" />
            Baixar
          </a>
        ) : (
          <Button className="flex-1" disabled>
            <DownloadIcon data-icon="inline-start" />
            Link indisponível
          </Button>
        )}

        {isAdmin && (
          <>
            <UpdateDownload download={download} />

            <InactiveDownload download={download} />
          </>
        )}
      </footer>

      {isAdmin && isValid(publishedAt) && (
        <p className="border-t px-3 py-2 text-[11px] text-muted-foreground">
          Publicado em {format(publishedAt, "dd MMM. yyyy 'às' HH:mm", { locale: ptBR })}
        </p>
      )}
    </article>
  )
}
