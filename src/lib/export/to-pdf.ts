import { formatDayTime } from '@/utils/day-key'
import { drawBrandMark } from './brand-mark-pdf'
import { assertExportable, buildFileName, type ExportColumn, type ExportDocument } from './document'

const numberFormatter = new Intl.NumberFormat('pt-BR')
const percentFormatter = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

/** Margens em pontos. A superior abre espaço para o cabeçalho que se repete a cada página. */
const MARGIN = { top: 122, right: 32, bottom: 40, left: 32 }

/** Lado da marca no cabeçalho, em pontos. */
const BRAND_SIZE = 30

/** Azul-marinho da marca (`--primary`, `#16213e`) em RGB, que é o que o jsPDF aceita. */
const PRIMARY: [number, number, number] = [22, 33, 62]

const MUTED: [number, number, number] = [110, 116, 130]

/** O texto de cada célula no papel. O PDF é leitura, então aqui tudo vira string formatada. */
function formatValue<Row>(column: ExportColumn<Row>, row: Row) {
  const value = column.value(row)

  if (value === null || value === '') return '—'

  if (column.kind === 'date') return formatDayTime(value as string | Date)
  if (column.kind === 'number') return numberFormatter.format(Number(value))
  if (column.kind === 'percent') return `${percentFormatter.format(Number(value))}%`

  return String(value)
}

/**
 * Gera e baixa o PDF do relatório.
 *
 * O documento é montado a partir do **modelo**, nunca do DOM. Imprimir a tela pareceria mais barato
 * e sairia errado: a tabela é paginada, então o papel teria só a página visível; não haveria como
 * repetir o cabeçalho a cada quebra; e o navegador carimba URL e data nas margens de uma folha que
 * vai para a diretoria.
 *
 * As bibliotecas entram por `await import()` — `jspdf` embute fontes e é o maior dos três pacotes da
 * change. Quem só lê a tela não baixa nada disso.
 */
export async function exportToPdf<Row>(document: ExportDocument<Row>) {
  assertExportable(document)

  const [{ jsPDF }, { autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')])

  // Paisagem porque os relatórios têm de sete a nove colunas; em retrato as datas quebrariam em duas
  // linhas e a folha dobraria de tamanho.
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()

  const head = [document.columns.map(column => column.header)]
  const body = document.rows.map(row => document.columns.map(column => formatValue(column, row)))

  autoTable(doc, {
    head,
    body,
    margin: MARGIN,
    styles: { font: 'helvetica', fontSize: 8, cellPadding: 4, overflow: 'linebreak' },
    // `fillColor` no cabeçalho é o que o mantém reconhecível quando ele reaparece na página 7.
    headStyles: { fillColor: PRIMARY, textColor: 255, fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: [246, 247, 249] },
    columnStyles: Object.fromEntries(
      document.columns.map((column, index) => [
        index,
        { halign: column.kind === 'number' || column.kind === 'percent' ? 'right' : 'left' },
      ])
    ),
    // `showHead: 'everyPage'` é o que cumpre a exigência de repetir o cabeçalho a cada quebra.
    showHead: 'everyPage',
    didDrawPage: () => drawHeader(doc, document, pageWidth),
  })

  drawFooters(doc, document, pageWidth)

  doc.save(buildFileName(document, 'pdf'))
}

/**
 * Cabeçalho institucional, redesenhado a cada página.
 *
 * Sem período e sala impressos, uma folha solta entregue à diretoria não diz de que trata — e é
 * exatamente assim que ela circula: impressa, sem o arquivo ao lado.
 */
function drawHeader<Row>(doc: JsPdfDocument, document: ExportDocument<Row>, pageWidth: number) {
  // A marca vem primeiro porque ela define a coluna de texto: tudo à direita dela se alinha pelo
  // mesmo `textLeft`, e o cabeçalho não se desmonta se o logo mudar de tamanho.
  drawBrandMark(doc, MARGIN.left, 22, BRAND_SIZE)

  const textLeft = MARGIN.left + BRAND_SIZE + 10

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...PRIMARY)
  doc.text('Sala Livre', textLeft, 34)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...MUTED)
  doc.text('Gestão de Salas', textLeft, 45)

  const issuedAt = `Emitido em ${formatDayTime(document.issuedAt)}`
  doc.setFontSize(9)
  doc.text(issuedAt, pageWidth - MARGIN.right - doc.getTextWidth(issuedAt), 34)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(...PRIMARY)
  doc.text(document.title, MARGIN.left, 74)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  doc.text(`${document.periodLabel}  ·  ${document.roomLabel}`, MARGIN.left, 88)

  if (document.summary.length > 0) {
    const summary = document.summary.map(entry => `${entry.label}: ${entry.value}`).join('   ·   ')

    doc.setTextColor(...PRIMARY)
    doc.text(summary, MARGIN.left, 102, { maxWidth: pageWidth - MARGIN.left - MARGIN.right })
  }

  doc.setDrawColor(220, 223, 228)
  doc.setLineWidth(0.5)
  doc.line(MARGIN.left, 110, pageWidth - MARGIN.right, 110)
}

/**
 * Rodapé com a paginação, escrito depois da tabela.
 *
 * "Página 3 de 12" só pode ser escrito quando o total é conhecido, e ele só é conhecido depois que a
 * última linha caiu no papel — por isso este passe separado, e não um `didDrawPage`. Num documento
 * que se anexa a processo, a folha avulsa precisa dizer de quantas ela é.
 */
function drawFooters<Row>(doc: JsPdfDocument, document: ExportDocument<Row>, pageWidth: number) {
  const pageHeight = doc.internal.pageSize.getHeight()
  const total = doc.getNumberOfPages()

  for (let page = 1; page <= total; page++) {
    doc.setPage(page)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)

    if (document.footnote) {
      doc.text(document.footnote, MARGIN.left, pageHeight - 20, { maxWidth: pageWidth - 200 })
    }

    const label = `Página ${page} de ${total}`
    doc.text(label, pageWidth - MARGIN.right - doc.getTextWidth(label), pageHeight - 20)
  }
}

/**
 * O documento do jsPDF, tipado pelo próprio pacote.
 *
 * Vem por `Awaited<ReturnType<...>>` porque o `import()` é dinâmico: importar o tipo no topo do
 * arquivo com `import type` seria seguro (tipo some na compilação), mas deixaria o nome do pacote
 * escrito num `import` estático, que é justamente o que a revisão procura para provar o carregamento
 * sob demanda.
 */
type JsPdfDocument = InstanceType<Awaited<typeof import('jspdf')>['jsPDF']>
