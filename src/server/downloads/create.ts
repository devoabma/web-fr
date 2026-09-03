import type { DownloadKind } from '@/constants/download-kinds'
import { API } from '@/lib/axios'

interface CreateDownloadRequest {
  kind: DownloadKind
  name: string
  url: string
  /** Opcional na api-fr — omitir grava o registro sem descrição em vez de uma string vazia. */
  description?: string
  version?: string
}

interface CreateDownloadResponse {
  downloadId: string
}

/**
 * Só ADMIN. A api-fr responde `400` quando já existe um ativo do mesmo tipo — a mensagem nomeia o
 * registro que está no caminho, então ela é repassada ao usuário como está.
 */
export async function createDownload({
  kind,
  name,
  url,
  description,
  version,
}: CreateDownloadRequest): Promise<CreateDownloadResponse> {
  const response = await API.post<CreateDownloadResponse>('/downloads/create', {
    kind,
    name,
    url,
    description,
    version,
  })

  return response.data
}
