import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.url().default('http://localhost:25600'),
  /** Domínio em que a `api-fr` grava o cookie de sessão (`DOMAIN_URL` lá). Precisa casar, senão o logout não apaga nada. */
  NEXT_PUBLIC_DOMAIN: z.string().min(1).default('localhost'),
})

/**
 * O Next substitui apenas referências **literais** a `process.env.NEXT_PUBLIC_*` no bundle do cliente — ele
 * não serializa o objeto `process.env` inteiro. Entregar `process.env` direto ao schema validaria no
 * servidor e cairia calado nos defaults no navegador, então cada variável é citada pelo nome aqui.
 */
export const env = envSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_DOMAIN: process.env.NEXT_PUBLIC_DOMAIN,
})
