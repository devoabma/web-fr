import { API } from '@/lib/axios'

interface UpdateImageProfileRequest {
  file: File
}

interface UpdateImageProfileResponse {
  imageUrl: string
}

export async function updateImageProfile({ file }: UpdateImageProfileRequest): Promise<UpdateImageProfileResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await API.patch<UpdateImageProfileResponse>('/employees/update-image', formData)

  return response.data
}
