import type { Metadata } from 'next'
import { DownloadsNotice } from './_components/downloads-notice'

export const metadata: Metadata = {
  title: 'Downloads',
}

export default function DownloadsPage() {
  return (
    <>
      <header className="flex flex-col gap-1">
        <h1 className="font-semibold text-primary text-xl tracking-tight">Downloads</h1>

        <p className="max-w-3xl text-muted-foreground text-sm leading-relaxed">
          Baixe os arquivos enviados para impressão e os extratos das liberações antes que eles saiam do ar.
        </p>
      </header>

      <DownloadsNotice />

      <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed p-6 text-center text-muted-foreground text-sm">
        A lista de arquivos desta tela ainda está sendo construída.
      </div>
    </>
  )
}
