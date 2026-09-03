import { toSpreadsheetDate } from '@/utils/day-key'
import { assertExportable, buildFileName, type ExportColumn, type ExportDocument } from './document'

/**
 * Formatos de número do Excel, escritos na língua do arquivo (o Excel traduz para a do usuário).
 *
 * `#,##0` dá o separador de milhar sem casas decimais — minutos não têm meio minuto aqui, porque o
 * view-model já arredondou na origem para a soma da tabela fechar com o resumo.
 */
const NUMBER_FORMAT = '#,##0'
const PERCENT_FORMAT = '0.0"%"'
const DATE_FORMAT = 'dd/mm/yyyy hh:mm'

/**
 * A célula como `write-excel-file` a espera.
 *
 * O tipo é escrito aqui em vez de importado do pacote de propósito: um `import type` some na
 * compilação, mas deixaria o nome da biblioteca num `import` estático no topo do arquivo — que é
 * exatamente o que a revisão procura para provar que o carregamento é sob demanda.
 *
 * `value` não aceita `null`: no formato da planilha, célula vazia é a **ausência** do valor, e não um
 * nulo escrito. Por isso o vazio devolve `{}`.
 */
type Cell = {
  value?: string | number | Date
  type?: StringConstructor | NumberConstructor | DateConstructor
  format?: string
  fontWeight?: 'bold'
  align?: 'left' | 'center' | 'right'
}

/**
 * Traduz uma célula do modelo para a célula tipada da planilha.
 *
 * O tipo é o ponto inteiro deste arquivo. Uma planilha em que tudo é texto **parece** correta e não
 * é: a coluna de datas ordena alfabeticamente (03/12 antes de 28/03), a de minutos não soma no
 * rodapé, e o filtro de período do Excel nem aparece. É o oposto do que a diretoria abre a planilha
 * para fazer.
 */
function buildCell<Row>(column: ExportColumn<Row>, row: Row): Cell {
  const value = column.value(row)

  if (value === null || value === '') return {}

  switch (column.kind) {
    case 'date':
      // `toSpreadsheetDate` reancora o instante no fuso da Seccional: a célula de data não guarda
      // fuso, e o valor cru jogaria a liberação das 23h de 31/03 para 1º/04 na planilha.
      return { value: toSpreadsheetDate(value as string | Date), type: Date, format: DATE_FORMAT, align: 'left' }

    case 'number':
      return { value: Number(value), type: Number, format: NUMBER_FORMAT, align: 'right' }

    case 'percent':
      return { value: Number(value), type: Number, format: PERCENT_FORMAT, align: 'right' }

    default:
      // Inclui a inscrição da OAB, e é por isso que ela é `text` no modelo: como número, o Excel
      // comeria o zero à esquerda de "00123" e a inscrição impressa deixaria de ser a do advogado.
      return { value: String(value), type: String, align: 'left' }
  }
}

/**
 * Gera e baixa o `.xlsx` do relatório.
 *
 * A biblioteca entra por `await import()`: quem só **abre** a tela de relatórios não deve pagar o
 * download de um gerador de planilha que só serve a quem **exporta**.
 */
export async function exportToXlsx<Row>(document: ExportDocument<Row>) {
  assertExportable(document)

  const { default: writeXlsxFile } = await import('write-excel-file/browser')

  const header = document.columns.map<Cell>(column => ({ value: column.header, type: String, fontWeight: 'bold' }))
  const body = document.rows.map(row => document.columns.map(column => buildCell(column, row)))

  /**
   * Os dados ficam sozinhos na primeira aba, começando na linha 1.
   *
   * Pôr título e período acima da tabela — como se faz no papel — quebraria justamente o uso da
   * planilha: ao ordenar uma coluna, o Excel arrastaria as linhas de cabeçalho junto com os dados.
   * A identificação do documento, que a spec exige, vai inteira na segunda aba.
   */
  const dataSheet = {
    sheet: 'Relatório',
    data: [header, ...body],
    columns: document.columns.map(column => ({ width: column.width })),
    // Congela o cabeçalho: numa folha de centenas de advogados, rolar sem ele é ler números sem rótulo.
    stickyRowsCount: 1,
  }

  const label = (text: string): Cell => ({ value: text, type: String, fontWeight: 'bold' })
  const text = (value: string): Cell => ({ value, type: String })

  const infoSheet = {
    sheet: 'Informações',
    data: [
      [label('Relatório'), text(document.title)],
      [label('Período'), text(document.periodLabel)],
      [label('Sala'), text(document.roomLabel)],
      [label('Emitido em'), { value: toSpreadsheetDate(document.issuedAt), type: Date, format: DATE_FORMAT }],
      [],
      ...document.summary.map(entry => [label(entry.label), text(entry.value)]),
      ...(document.footnote ? [[], [text(document.footnote)]] : []),
    ],
    columns: [{ width: 28 }, { width: 60 }],
  }

  await writeXlsxFile([dataSheet, infoSheet]).toFile(buildFileName(document, 'xlsx'))
}
