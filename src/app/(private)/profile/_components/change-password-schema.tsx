import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const changePasswordFormSchema = z
  .object({
    currentPassword: z.string('Senha atual obrigatória').trim().min(8, 'Senha mínima de 8 caracteres'),
    newPassword: z.string('Nova senha obrigatória').trim().min(8, 'Senha mínima de 8 caracteres'),
    confirmPassword: z.string('Confirmação obrigatória').trim().min(8, 'Senha mínima de 8 caracteres'),
  })
  // O `path` é o que faz o erro aparecer embaixo do campo certo: sem ele o zod devolve o problema na
  // raiz do objeto e o `FieldError` de cada campo fica mudo — o usuário só veria o botão não funcionar.
  .refine(data => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não conferem.',
  })
  .refine(data => data.newPassword !== data.currentPassword, {
    path: ['newPassword'],
    message: 'A nova senha precisa ser diferente da atual.',
  })

export type ChangePasswordFormType = z.infer<typeof changePasswordFormSchema>

export function useChangePasswordForm() {
  return useForm<ChangePasswordFormType>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })
}
