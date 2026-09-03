/**
 * O modelo de documento que os dois geradores consomem.
 *
 * Ele existe para que `.xlsx` e PDF saiam do **mesmo** conjunto de linhas. Se cada gerador montasse
 * as suas colunas, a planilha e o papel do mesmo relatório divergiriam com o tempo — e o dia em que
 * divergissem seria o dia em que alguém compara os dois numa reunião.
 *
 * O modelo também não conhece a tela: ele recebe linhas prontas do view-model, e por isso a
 * exportação leva **todas** as linhas do recorte, não a página que a tabela está exibindo.
 */

/** Como a célula deve ser escrita. É o que separa uma planilha que soma de uma que só parece somar. */
export type ExportColumnKind =
  /** Texto puro. Usado também na inscrição da OAB — ver `oab` em `buildDocument`. */
  | 'text'
  /** Número que a planilha soma e ordena. */
  | 'number'
  /** Data real: ordena cronologicamente e aceita filtro de período no Excel. */
  | 'date'
  /** Percentual já em pontos (12.5 = 12,5%). */
  | 'percent'

export type ExportColumn<Row> = {
  header: string
  kind: ExportColumnKind
  /** Largura da coluna, em caracteres. Só a planilha usa; o PDF distribui pelo conteúdo. */
  width: number
  value: (row: Row) => string | number | Date | null
}

/** Uma linha do bloco de resumo impresso acima da tabela. */
export type ExportSummaryEntry = {
  label: string
  value: string
}

export type ExportDocument<Row> = {
  /** "Advogados por sala" — o nome do relatório, como aparece no topo do documento. */
  title: string
  /** O período por extenso, vindo de `ResolvedReportPeriod.label`: "Março de 2025". */
  periodLabel: string
  /** "Sala 2" ou "Todas as salas". */
  roomLabel: string
  issuedAt: Date
  summary: ExportSummaryEntry[]
  columns: ExportColumn<Row>[]
  rows: Row[]
  /** Base do nome do arquivo, sem extensão: `advogados-por-sala-2025-03`. */
  fileBaseName: string
  /**
   * Aviso impresso no rodapé do documento, quando o relatório ignora o filtro de sala ou quando há
   * sessões abertas. Sem ele, uma folha com "todas as salas" sob um filtro de sala parece defeito.
   */
  footnote: string | null
}

/**
 * Recusa de gerar documento vazio.
 *
 * Uma folha timbrada com cabeçalho, período e zero linhas circula como se fosse resposta — e "não
 * houve movimento" é uma afirmação forte demais para sair de um recorte que talvez só esteja mal
 * filtrado. A tela esconde o botão; isto aqui é a segunda tranca, para o caso de alguém chamar o
 * gerador por outro caminho.
 */
export class EmptyReportError extends Error {
  constructor() {
    super('Não há linhas para exportar neste recorte.')
    this.name = 'EmptyReportError'
  }
}

export function assertExportable<Row>(document: ExportDocument<Row>) {
  if (document.rows.length === 0) throw new EmptyReportError()
}

/**
 * Nome do arquivo entregue ao navegador.
 *
 * Leva o relatório e o período porque esses arquivos são anexados a processo e reencontrados meses
 * depois numa pasta de downloads: `relatorio.xlsx` seria o terceiro arquivo com esse nome na máquina
 * de quem baixou.
 */
export function buildFileName<Row>(document: ExportDocument<Row>, extension: 'xlsx' | 'pdf') {
  return `${document.fileBaseName}.${extension}`
}
