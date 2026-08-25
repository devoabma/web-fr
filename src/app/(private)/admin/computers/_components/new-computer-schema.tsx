import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { macCodeSchema } from '@/utils/schemas/mac-code'

const newComputerFormSchema = z.object({
  macCode: macCodeSchema,
  number: z
    .number({ error: 'Informe o número do computador.' })
    .int('Use números inteiros.')
    .min(1, 'Número deve ser maior que zero.'),
  description: z.string().trim().min(1, 'Descrição obrigatória.').max(50, 'Descrição muito longa (máx. 50 caracteres).'),
  roomId: z.cuid2('Selecione uma sala.'),
})

export type NewComputerFormType = z.infer<typeof newComputerFormSchema>

export function useNewComputerForm() {
  return useForm<NewComputerFormType>({
    resolver: zodResolver(newComputerFormSchema),
    defaultValues: {
      macCode: '',
      number: 1,
      description: '',
      roomId: '',
    },
  })
}
