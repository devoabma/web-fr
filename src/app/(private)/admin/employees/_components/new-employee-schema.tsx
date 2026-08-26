import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { cpfSchema } from '@/utils/schemas/cpf'

const newEmployeeFormSchema = z.object({
  name: z.string().trim().min(3, 'Nome do colaborador obrigatório.').max(60, 'Nome muito longo (máx. 60 caracteres).'),
  cpf: cpfSchema,
  email: z.email('E-mail inválido.').trim().toLowerCase(),
  password: z.string('Senha obrigatória').trim().min(8, 'Senha mínima de 8 caracteres'),
})

export type NewEmployeeFormType = z.infer<typeof newEmployeeFormSchema>

export function useNewEmployeeForm() {
  return useForm<NewEmployeeFormType>({
    resolver: zodResolver(newEmployeeFormSchema),
    defaultValues: {
      name: '',
      cpf: '',
      email: '',
      password: '',
    },
  })
}
