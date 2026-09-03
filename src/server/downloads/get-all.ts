import type { DownloadKind } from '@/constants/download-kinds'
import { API } from '@/lib/axios'

export type DownloadProps = {
  id: string
  /** Instalador ou desinstalador. Não é editável na api-fr: trocar o tipo é cadastrar outro registro. */
  kind: DownloadKind
  /** Rótulo escrito para o funcionário ler ("Sala Livre 1.0.12"), não identificador. */
  name: string
  description: string | null
  /** Endereço http(s) do arquivo. A api-fr recusa outros protocolos — este valor vira `href` na tela. */
  url: string
  version: string | null
  /** Data ISO da inativação — `null` enquanto o link vale. */
  inactive: string | null
  createdAt: string
}

export interface GetAllDownloadsResponse {
  downloads: DownloadProps[]
}

/**
 * Lista os arquivos publicados. O recorte por papel é da api-fr, não do painel: ADMIN recebe também
 * os inativos (é a mesma tela que gerencia os links, e o histórico responde "para onde isto apontava
 * antes"), qualquer outro papel recebe só o que dá para baixar.
 *
 * Já vem ordenado por tipo e, dentro do tipo, do mais recente para o mais antigo.
 */
export async function getAllDownloads(): Promise<GetAllDownloadsResponse> {
  const response = await API.get<GetAllDownloadsResponse>('/downloads/get-all')

  return response.data
}
