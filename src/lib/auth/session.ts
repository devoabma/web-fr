import { z } from 'zod'

export const SESSION_COOKIE_NAME = '@fr-auth-token'

export const ROLES = ['ADMIN', 'MEMBER'] as const

export type Role = (typeof ROLES)[number]

const sessionPayloadSchema = z.object({
  sub: z.string().min(1),
  role: z.enum(ROLES),
  exp: z.number().optional(),
})

export type SessionPayload = z.infer<typeof sessionPayloadSchema>

function decodeBase64Url(value: string) {
  const base64 = value.replaceAll('-', '+').replaceAll('_', '/')
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
  const binary = atob(padded)

  // `atob` devolve bytes como caracteres latin-1; sem este passo qualquer acento no payload vira lixo.
  return new TextDecoder().decode(Uint8Array.from(binary, char => char.charCodeAt(0)))
}

export function decodeSessionToken(token: string): SessionPayload | null {
  const payload = token.split('.')[1]

  if (!payload) return null

  try {
    const parsed = sessionPayloadSchema.safeParse(JSON.parse(decodeBase64Url(payload)))

    return parsed.success ? parsed.data : null
  } catch {
    // Token truncado, base64 inválido ou JSON quebrado — tratado como "sem sessão".
    return null
  }
}

export function isSessionExpired(session: SessionPayload, now = Date.now()) {
  if (!session.exp) return true

  return session.exp * 1000 <= now
}

/** Sessão utilizável: token bem formado, com papel conhecido e dentro da validade. */
export function readSession(token: string | undefined): SessionPayload | null {
  if (!token) return null

  const session = decodeSessionToken(token)

  if (!session || isSessionExpired(session)) return null

  return session
}
