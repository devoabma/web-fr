import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const updateEmployeeFormSchema = z.object({
  name: z.string().trim().min(3, 'Nome do colaborador obrigatório.').max(60, 'Nome muito longo (máx. 60 caracteres).'),
  email: z.email('E-mail inválido.').trim().toLowerCase(),
  role: z.enum(['MEMBER', 'ADMIN'], 'Selecione o papel do colaborador.'),
})

export type UpdateEmployeeFormType = z.infer<typeof updateEmployeeFormSchema>

export function useUpdateEmployeeForm(defaultValues: UpdateEmployeeFormType) {
  return useForm<UpdateEmployeeFormType>({
    resolver: zodResolver(updateEmployeeFormSchema),
    defaultValues,
  })
}
