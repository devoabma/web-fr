import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { cpfSchema } from '@/utils/schemas/cpf'

const forgotPasswordFormSchema = z.object({
  cpf: cpfSchema,
  // A API cruza CPF **e** e-mail para achar o funcionário: um par que não bate volta como 400.
  //
  // Sem `.toLowerCase()` de propósito: a `api-fr` grava o e-mail como foi digitado no cadastro (só `.trim()`)
  // e busca com `findUnique`, comparação sensível a maiúsculas no Postgres. Normalizar aqui quebraria
  // justamente quem foi cadastrado com maiúscula — o par certo voltaria como "credenciais inválidas".
  email: z.email('E-mail inválido').trim(),
})

export type ForgotPasswordFormType = z.infer<typeof forgotPasswordFormSchema>

export function useForgotPasswordForm({ cpf, email }: ForgotPasswordFormType) {
  return useForm<ForgotPasswordFormType>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: {
      cpf,
      email,
    },
  })
}
