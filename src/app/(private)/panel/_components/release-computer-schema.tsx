import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { cpfSchema } from '@/utils/schemas/cpf'

/**
 * `dd/mm/aaaa` só com regex passaria 31/02/2000.
 * O `Date` normaliza o dia inválido para o mês seguinte, então comparar os campos de volta
 * é o que separa uma data que existe de uma que só tem o formato certo.
 */
const birthDateSchema = z
  .string()
  .trim()
  .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Use o formato dd/mm/aaaa.')
  .refine(value => {
    const [day, month, year] = value.split('/').map(Number)

    const date = new Date(year, month - 1, day)

    const isRealDate = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day

    return isRealDate && date <= new Date()
  }, 'Data de nascimento inválida.')

const releaseComputerFormSchema = z.object({
  cpf: cpfSchema,
  oab: z
    .string()
    .trim()
    .min(3, 'Número da OAB obrigatório.')
    .transform(oab => oab.toUpperCase()),
  birth: birthDateSchema,
})

export type ReleaseComputerFormType = z.infer<typeof releaseComputerFormSchema>

export function useReleaseComputerForm() {
  return useForm<ReleaseComputerFormType>({
    resolver: zodResolver(releaseComputerFormSchema),
    defaultValues: {
      cpf: '',
      oab: '',
      birth: '',
    },
  })
}
