import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { UFS } from '@/constants/ufs'

const updateRoomFormSchema = z.object({
  name: z.string().trim().min(3, 'Nome da sala obrigatório.').max(60, 'Nome muito longo (máx. 60 caracteres).'),
  uf: z.enum(UFS, 'Selecione o estado da sala.'),
  standardTime: z
    .number({ error: 'Informe o tempo padrão em minutos.' })
    .int('Use minutos inteiros.')
    .min(15, 'Mínimo de 15 minutos.')
    .max(480, 'Máximo de 480 minutos (8 horas).'),
  description: z.string().trim().max(200, 'Descrição muito longa (máx. 200 caracteres).'),
})

export type UpdateRoomFormType = z.infer<typeof updateRoomFormSchema>

export function useUpdateRoomForm(defaultValues: UpdateRoomFormType) {
  return useForm<UpdateRoomFormType>({
    resolver: zodResolver(updateRoomFormSchema),
    defaultValues,
  })
}
