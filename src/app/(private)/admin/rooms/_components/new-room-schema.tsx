import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { DEFAULT_UF, UFS } from '@/constants/ufs'

const newRoomFormSchema = z.object({
  name: z.string().trim().min(3, 'Nome da sala obrigatório.').max(60, 'Nome muito longo (máx. 60 caracteres).'),
  // O `select` já limita as opções às 27 siglas; o enum aqui é a rede que impede o formulário de
  // enviar um estado inválido caso o campo chegue vazio por reset ou rascunho antigo.
  uf: z.enum(UFS, 'Selecione o estado da sala.'),
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
      uf: DEFAULT_UF,
      standardTime: 180,
      description: '',
    },
  })
}
