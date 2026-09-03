import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const updateDownloadFormSchema = z.object({
  name: z.string().trim().min(3, 'Nome do arquivo obrigatório.').max(80, 'Nome muito longo (máx. 80 caracteres).'),
  url: z
    .url({
      protocol: /^https?$/,
      error: 'Endereço inválido. Informe a URL completa, começando com https://',
    })
    .trim()
    .max(2048, 'Endereço longo demais (máx. 2048 caracteres).'),
  version: z.string().trim().max(40, 'Versão muito longa (máx. 40 caracteres).'),
  description: z.string().trim().max(200, 'Descrição muito longa (máx. 200 caracteres).'),
})

export type UpdateDownloadFormType = z.infer<typeof updateDownloadFormSchema>

export function useUpdateDownloadForm(defaultValues: UpdateDownloadFormType) {
  return useForm<UpdateDownloadFormType>({
    resolver: zodResolver(updateDownloadFormSchema),
    defaultValues,
  })
}
