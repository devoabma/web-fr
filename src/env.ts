import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.url().default('http://localhost:25600'),
  NEXT_PUBLIC_DOMAIN: z.string().min(1).default('localhost'),
})

export const env = envSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_DOMAIN: process.env.NEXT_PUBLIC_DOMAIN,
})
