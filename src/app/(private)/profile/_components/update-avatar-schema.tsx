import { z } from 'zod'

const MAX_FILE_SIZE_IN_MEGABYTES = 5
const MAX_FILE_SIZE_IN_BYTES = MAX_FILE_SIZE_IN_MEGABYTES * 1024 * 1024

const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const

export const ACCEPTED_IMAGE_TYPES_ATTRIBUTE = ACCEPTED_IMAGE_TYPES.join(',')

export const MAX_AVATAR_SIZE_LABEL = `${MAX_FILE_SIZE_IN_MEGABYTES} MB`

const avatarFileSchema = z
  .custom<File>(value => value instanceof File, 'Selecione uma imagem para enviar.')
  .refine(
    file => ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number]),
    'Formato não suportado. Envie um arquivo PNG, JPG ou WEBP.'
  )
  .refine(file => file.size > 0, 'O arquivo está vazio. Escolha outra imagem.')
  .refine(file => file.size <= MAX_FILE_SIZE_IN_BYTES, `A imagem precisa ter no máximo ${MAX_AVATAR_SIZE_LABEL}.`)

/** Devolve a mensagem do primeiro problema encontrado, ou `null` quando o arquivo serve. */
export function validateAvatarFile(file: File) {
  const result = avatarFileSchema.safeParse(file)

  if (result.success) return null

  return result.error.issues[0]?.message ?? 'Não foi possível usar esta imagem. Escolha outro arquivo.'
}

/** "820 KB", "1.4 MB" — o tamanho ao lado do nome é o que explica uma recusa por peso antes do envio. */
export function formatFileSize(sizeInBytes: number) {
  if (sizeInBytes < 1024) return `${sizeInBytes} B`

  const sizeInKilobytes = sizeInBytes / 1024

  if (sizeInKilobytes < 1024) return `${Math.round(sizeInKilobytes)} KB`

  return `${(sizeInKilobytes / 1024).toFixed(1).replace('.', ',')} MB`
}
