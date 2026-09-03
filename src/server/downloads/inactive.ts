import { API } from '@/lib/axios'

interface DeactivateDownloadResponse {
  message: string
}

/**
 * Inativar não apaga: o registro sai da lista do funcionário e continua no banco como histórico do
 * endereço anterior. Não existe exclusão física nesta capacidade — é também o passo obrigatório
 * antes de cadastrar outro arquivo do mesmo tipo.
 */
export async function deactivateDownload(downloadId: string): Promise<DeactivateDownloadResponse> {
  const response = await API.patch<DeactivateDownloadResponse>(`/downloads/deactivate/${downloadId}`)

  return response.data
}
