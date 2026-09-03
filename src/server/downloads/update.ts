import { API } from '@/lib/axios'

interface UpdateDownloadRequest {
  downloadId: string
  name?: string
  url?: string
  /**
   * Campo ausente mantém o valor atual; `null` limpa. São os dois campos que a api-fr distingue com
   * `!== undefined`, e apagar a versão de um link é edição legítima, não campo esquecido.
   */
  description?: string | null
  version?: string | null
}

interface UpdateDownloadResponse {
  message: string
}

/** Só ADMIN. O `kind` não viaja: ele não é editável na api-fr. */
export async function updateDownload({
  downloadId,
  name,
  url,
  description,
  version,
}: UpdateDownloadRequest): Promise<UpdateDownloadResponse> {
  const response = await API.patch<UpdateDownloadResponse>(`/downloads/update/${downloadId}`, {
    name,
    url,
    description,
    version,
  })

  return response.data
}
