import { API } from '@/lib/axios'

interface ActivateDownloadResponse {
  message: string
}

/**
 * Volta atrás: o link novo saiu quebrado e o anterior precisa valer de novo. A api-fr recusa com
 * `400` se já houver outro ativo do mesmo tipo — inative o atual antes.
 */
export async function activateDownload(downloadId: string): Promise<ActivateDownloadResponse> {
  const response = await API.patch<ActivateDownloadResponse>(`/downloads/activate/${downloadId}`)

  return response.data
}
