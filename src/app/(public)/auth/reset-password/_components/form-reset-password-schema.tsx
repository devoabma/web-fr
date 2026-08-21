import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { isRecoveryCode, RECOVERY_CODE_LENGTH } from '@/utils/masks/recovery-code'

const resetPasswordFormSchema = z
  .object({
    // A busca do token é `findUnique({ code })`, ou seja, sensível a maiúsculas: um código digitado em
    // minúsculo bateria em "código inválido" sem o usuário entender o motivo. Normalizamos antes de enviar.
    code: z
      .string('Código obrigatório')
      .trim()
      .toUpperCase()
      .refine(isRecoveryCode, `Código de ${RECOVERY_CODE_LENGTH} caracteres (letras e números).`),
    password: z.string('Nova senha obrigatória').trim().min(8, 'Senha mínima de 8 caracteres'),
    confirmPassword: z.string('Confirmação obrigatória').trim().min(8, 'Senha mínima de 8 caracteres'),
  })
  // O `path` é o que faz o erro aparecer embaixo do campo certo: sem ele o zod devolve o problema na
  // raiz do objeto e o `FieldError` de cada campo fica mudo — o usuário só veria o botão não funcionar.
  .refine(data => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não conferem.',
  })

export type ResetPasswordFormType = z.infer<typeof resetPasswordFormSchema>

export function useResetPasswordForm({ code, password, confirmPassword }: ResetPasswordFormType) {
  return useForm<ResetPasswordFormType>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      code,
      password,
      confirmPassword,
    },
  })
}
