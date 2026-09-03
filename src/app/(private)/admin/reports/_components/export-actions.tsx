'use client'

import { FileSpreadsheetIcon, FileTextIcon, Loader2Icon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { type ExportDocument, exportToPdf, exportToXlsx } from '@/lib/export'

type ExportFormat = 'xlsx' | 'pdf'

type ExportActionsProps<Row> = {
  /** `null` quando o recorte está vazio: sem linhas, não há documento a oferecer. */
  document: ExportDocument<Row> | null
}

export function ExportActions<Row>({ document }: ExportActionsProps<Row>) {
  // Guarda **qual** formato está gerando, e não um booleano: com dois botões, um `isLoading` único
  // deixaria os dois girando quando só um foi clicado.
  const [pending, setPending] = useState<ExportFormat | null>(null)

  /**
   * Documento vazio não vira botão desabilitado, e sim ausência de botão.
   *
   * Um botão apagado convida a clicar e a procurar o motivo; e a folha timbrada com zero linhas que
   * ele geraria circularia como se fosse resposta — "não houve movimento" é afirmação forte demais
   * para sair de um recorte que talvez só esteja mal filtrado.
   */
  if (!document) return null

  async function handleExport(format: ExportFormat) {
    if (!document || pending) return

    setPending(format)

    try {
      await (format === 'xlsx' ? exportToXlsx(document) : exportToPdf(document))
    } catch {
      // A falha aqui é de geração no navegador (biblioteca que não chegou, memória, permissão de
      // download). O aviso é do mesmo tipo que o resto do painel usa; derrubar a tela por causa de
      // uma exportação perderia o relatório que já está calculado na frente do usuário.
      toast.error(`Não foi possível gerar o ${format === 'xlsx' ? 'Excel' : 'PDF'}. Tente novamente.`)
    } finally {
      setPending(null)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport('xlsx')}
        disabled={pending !== null}
        aria-label="Exportar em Excel"
      >
        {pending === 'xlsx' ? <Loader2Icon className="animate-spin" /> : <FileSpreadsheetIcon />}
        Excel
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport('pdf')}
        disabled={pending !== null}
        aria-label="Exportar em PDF"
      >
        {pending === 'pdf' ? <Loader2Icon className="animate-spin" /> : <FileTextIcon />}
        PDF
      </Button>
    </div>
  )
}
