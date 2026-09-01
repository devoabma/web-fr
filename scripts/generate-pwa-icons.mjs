/**
 * Gera os PNGs do PWA a partir da marca do Sala Livre.
 *
 * Os arquivos ficam versionados em `public/icons/` — este script só precisa rodar quando a marca
 * mudar. Como `sharp` não faz parte das dependências do painel (seria peso de build para um trabalho
 * pontual), rode com o pacote emprestado:
 *
 *   pnpm dlx --package=sharp node scripts/generate-pwa-icons.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const sharp = require('sharp')

const OUTPUT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons')

/** Azul da marca — mesmo tom da sidebar do painel. */
const BRAND = '#16213e'
/** Traço da marca sobre fundo escuro (o `fr-icon.svg` usa este tom no modo escuro). */
const STROKE = '#e8eaf2'
/** Vermelho do detalhe (o "cabo" que sai do quadro). */
const ACCENT = '#c0392b'

/** Marca no viewBox 100x100: o desenho ocupa de 24 a 76, mais 3 de meia espessura de traço em cada lado. */
const MARK_CENTER = 50
const MARK_EXTENT = 58

/**
 * Monta o SVG do ícone.
 *
 * @param size lado do quadrado, em px
 * @param coverage fração do lado que a marca deve ocupar — menor no maskable, porque o Android
 *   recorta o ícone em círculo/squircle e só garante os 80% centrais
 * @param radius raio dos cantos, em px (0 = quadrado cheio, que é o que maskable e iOS esperam)
 */
function iconSvg({ size, coverage, radius }) {
  const scale = (coverage * size) / MARK_EXTENT
  const offset = size / 2 - MARK_CENTER * scale

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="${BRAND}"/>
  <g transform="translate(${offset} ${offset}) scale(${scale})" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M24 60 L24 64 A12 12 0 0 0 36 76 L64 76 A12 12 0 0 0 76 64 L76 36 A12 12 0 0 0 64 24 L36 24 A12 12 0 0 0 24 36 L24 40" stroke="${STROKE}" stroke-width="6"/>
    <path d="M24 40 L45 53" stroke="${ACCENT}" stroke-width="6"/>
    <circle cx="45" cy="53" r="3.4" fill="${ACCENT}"/>
  </g>
</svg>`
}

const ICONS = [
  // Ícone comum: cantos arredondados por conta própria, porque nem todo launcher aplica máscara.
  { file: 'icon-192.png', size: 192, coverage: 0.62, radius: 43 },
  { file: 'icon-512.png', size: 512, coverage: 0.62, radius: 114 },
  // Maskable: fundo até a borda e marca menor, para sobreviver a qualquer recorte.
  { file: 'icon-maskable-192.png', size: 192, coverage: 0.5, radius: 0 },
  { file: 'icon-maskable-512.png', size: 512, coverage: 0.5, radius: 0 },
  // iOS arredonda sozinho e não respeita transparência: fundo sólido, sempre.
  { file: 'apple-touch-icon.png', size: 180, coverage: 0.58, radius: 0 },
]

await mkdir(OUTPUT_DIR, { recursive: true })

for (const { file, size, coverage, radius } of ICONS) {
  const png = await sharp(Buffer.from(iconSvg({ size, coverage, radius })))
    .png({ compressionLevel: 9 })
    .toBuffer()

  await writeFile(resolve(OUTPUT_DIR, file), png)

  console.log(`✓ public/icons/${file} (${size}×${size})`)
}
