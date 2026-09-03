/**
 * A marca do Sala Livre desenhada direto no PDF, em vetor.
 *
 * Poderia ser um PNG embutido em base64, e seria pior: o logo escala sem perda em qualquer zoom ou
 * impressão, e não há asset binário para versionar, converter e manter em dia com `public/logo.svg`.
 *
 * A geometria é a mesma do `BrandMark` da tela e do `public/logo.svg` — um quadrado arredondado com
 * uma abertura no lado esquerdo (a sala aberta), atravessado pela diagonal com o ponto na ponta.
 */

/** O SVG original é desenhado numa caixa de 100×100; tudo aqui é escalado a partir dela. */
const VIEWBOX = 100

/**
 * Constante de aproximação de um arco de 90° por curva de Bézier cúbica: `r * 4/3 * (√2 − 1)`.
 *
 * O SVG descreve os cantos com `A12 12` (arco puro), e o jsPDF só desenha retas e Béziers. Com o
 * raio 12 do original, o deslocamento das alças é este — é o mesmo número que qualquer conversor de
 * SVG para PDF usaria no lugar.
 */
const ARC = 12 * 0.5522847498

/**
 * O contorno, em coordenadas **relativas**, partindo de (24, 60).
 *
 * Cada entrada é uma reta `[dx, dy]` ou uma Bézier `[c1x, c1y, c2x, c2y, dx, dy]`, que é o formato
 * que `doc.lines()` espera. O traço começa e termina no lado esquerdo sem se fechar: é justamente o
 * vão entre y=40 e y=60 que faz a marca ler como "aberta".
 */
const OUTLINE: number[][] = [
  [0, 4],
  [0, ARC, 12 - ARC, 12, 12, 12],
  [28, 0],
  [ARC, 0, 12, -(12 - ARC), 12, -12],
  [0, -28],
  [0, -ARC, -(12 - ARC), -12, -12, -12],
  [-28, 0],
  [-ARC, 0, -12, 12 - ARC, -12, 12],
  [0, 4],
]

/** Azul-marinho da marca (`--primary`, `#16213e`). */
const MARK: [number, number, number] = [22, 33, 62]

/** O vermelho do acento (`#c0392b`), o mesmo do `logo.svg`. */
const ACCENT: [number, number, number] = [192, 57, 43]

type PdfDocument = {
  setDrawColor: (r: number, g: number, b: number) => unknown
  setFillColor: (r: number, g: number, b: number) => unknown
  setLineWidth: (width: number) => unknown
  setLineCap: (style: string | number) => unknown
  setLineJoin: (style: string | number) => unknown
  lines: (lines: number[][], x: number, y: number, scale: [number, number], style?: string | null) => unknown
  line: (x1: number, y1: number, x2: number, y2: number) => unknown
  circle: (x: number, y: number, r: number, style?: string) => unknown
}

/**
 * Desenha a marca com o canto superior esquerdo em (`x`, `y`), ocupando `size` pontos.
 *
 * Não restaura cor nem espessura de linha: quem chama desenha o cabeçalho inteiro em seguida e já
 * define as suas. Fica registrado aqui para não virar surpresa.
 */
export function drawBrandMark(doc: PdfDocument, x: number, y: number, size: number) {
  const scale = size / VIEWBOX

  doc.setDrawColor(...MARK)
  doc.setLineWidth(6 * scale)
  doc.setLineCap('round')
  doc.setLineJoin('round')

  // `doc.lines` recebe o ponto inicial em coordenadas absolutas e o resto em relativas já escaladas.
  doc.lines(OUTLINE, x + 24 * scale, y + 60 * scale, [scale, scale], 'S')

  doc.setDrawColor(...ACCENT)
  doc.line(x + 24 * scale, y + 40 * scale, x + 45 * scale, y + 53 * scale)

  doc.setFillColor(...ACCENT)
  doc.circle(x + 45 * scale, y + 53 * scale, 3.4 * scale, 'F')
}
