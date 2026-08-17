/**
 * Política de acesso aos endereços do painel.
 *
 * A regra é **negar por padrão**: só é público o que estiver listado aqui. Assim, uma rota nova do
 * painel nasce protegida sem ninguém precisar lembrar de registrá-la.
 */

/** Alcançáveis sem sessão. Casam por segmento: `/support` cobre `/support/contato`. */
export const PUBLIC_ROUTES = ['/', '/privacy', '/support', '/status'] as const

/** Fluxo de autenticação — exclusivo de quem NÃO tem sessão (`/auth/sign-in`, `/auth/forgot-password`, ...). */
export const AUTH_ROUTES = ['/auth'] as const

/** Áreas restritas ao papel `ADMIN` (inventário: salas, computadores, colaboradores). */
export const ADMIN_ROUTES = ['/admin'] as const

export const SIGN_IN_ROUTE = '/auth/sign-in'

/** Destino de quem já tem sessão e da primeira tela do painel. */
export const PANEL_ROUTE = '/panel'

/** Query param onde o proxy guarda a rota original para o login devolver o usuário depois. */
export const REDIRECT_PARAM = 'redirect'

export function matchesRoute(pathname: string, routes: readonly string[]) {
  // `startsWith` com a barra evita o falso positivo clássico: `/administrativo` casando com `/admin`.
  return routes.some(route => pathname === route || pathname.startsWith(`${route}/`))
}
