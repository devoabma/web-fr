/**
 * Leitura defensiva do endereço do arquivo.
 *
 * A api-fr já fecha o protocolo em http/https na entrada, e é lá que a regra tem de morar — mas o
 * valor gravado antes de ela existir, ou colado direto no banco, continuaria virando `href` nesta
 * tela. Um `javascript:` num `href` não é link quebrado: é script rodando no navegador de quem só
 * queria baixar o instalador. Por isso a tela confere de novo antes de desenhar o botão.
 *
 * Devolve `null` quando o endereço não é utilizável — e é o `null` que faz a tela mostrar o aviso em
 * vez de um botão que leva a lugar nenhum.
 */
export type DownloadLink = {
  href: string
  /** Domínio de onde o arquivo vem — é o que responde "isto veio de quem?" antes do clique. */
  host: string
  /** Último segmento do caminho ("SalaLivreSetup.exe"), quando existe. */
  fileName: string | null
}

export function parseDownloadLink(url: string): DownloadLink | null {
  try {
    const parsed = new URL(url)

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null

    const lastSegment = parsed.pathname.split('/').filter(Boolean).at(-1) ?? null

    return {
      href: parsed.toString(),
      host: parsed.host,
      // `decodeURIComponent` porque o nome viaja escapado ("Sala%20Livre.exe") e é lido por gente.
      fileName: lastSegment ? decodeURIComponent(lastSegment) : null,
    }
  } catch {
    // Endereço malformado — tratado como "sem link", igual ao protocolo recusado.
    return null
  }
}
