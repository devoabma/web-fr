import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { cpfSchema } from '@/utils/schemas/cpf'

const loginFormSchema = z.object({
  cpf: cpfSchema,
  password: z.string('Senha obrigatória').trim().min(8, 'Senha mínima de 8 caracteres'),
  remember: z.boolean(),
})

export type LoginFormType = z.infer<typeof loginFormSchema>

export function useLoginForm({ cpf, password, remember }: LoginFormType) {
  return useForm<LoginFormType>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      cpf,
      password,
      remember,
    },
  })
}
