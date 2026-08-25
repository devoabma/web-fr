import { z } from 'zod'

export const macCodeSchema = z
  .string()
  .trim()
  .min(1, 'MAC obrigatório.')
  .transform(macCode => macCode.replace(/[\s:.-]/g, '').toUpperCase()) // normaliza: mantém só o código
  .refine(macCode => /^[0-9A-F]{12}$/.test(macCode), 'MAC inválido. Use 12 dígitos hexadecimais (ex.: 00-1A-2B-3C-4D-5E).')
  .transform(macCode => macCode.replace(/(..)(..)(..)(..)(..)(..)/, '$1-$2-$3-$4-$5-$6'))
