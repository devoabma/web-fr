import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

/**
 * O protocolo fechado em http/https repete a regra da api-fr de propósito.
 *
 * Não é validação duplicada por descuido: aqui ela existe para o ADMIN descobrir o endereço errado
 * enquanto ainda está com ele na tela, em vez de tomar um `400` depois de enviar. Quem manda de
 * verdade continua sendo o servidor — este schema não é a garantia, é o aviso antecipado.
 */
const newDownloadFormSchema = z.object({
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

export type NewDownloadFormType = z.infer<typeof newDownloadFormSchema>

export function useNewDownloadForm() {
  return useForm<NewDownloadFormType>({
    resolver: zodResolver(newDownloadFormSchema),
    defaultValues: {
      name: '',
      url: '',
      version: '',
      description: '',
    },
  })
}
