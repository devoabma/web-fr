import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

// O `slug` não entra aqui: quem gera é a api-fr, a partir do nome. O formulário só mostra a prévia.
const newRoomFormSchema = z.object({
  name: z.string().trim().min(3, 'Nome da sala obrigatório.').max(60, 'Nome muito longo (máx. 60 caracteres).'),
  // O teto de 480 min existe para o erro de digitação não virar cota do dia inteiro numa sala.
  standardTime: z
    .number({ error: 'Informe o tempo padrão em minutos.' })
    .int('Use minutos inteiros.')
    .min(15, 'Mínimo de 15 minutos.')
    .max(480, 'Máximo de 480 minutos (8 horas).'),
  description: z.string().trim().max(200, 'Descrição muito longa (máx. 200 caracteres).'),
})

export type NewRoomFormType = z.infer<typeof newRoomFormSchema>

export function useNewRoomForm() {
  return useForm<NewRoomFormType>({
    resolver: zodResolver(newRoomFormSchema),
    defaultValues: {
      name: '',
      standardTime: 180,
      description: '',
    },
  })
}
