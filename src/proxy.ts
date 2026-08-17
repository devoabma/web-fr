import { type NextRequest, NextResponse } from 'next/server'
import { env } from '@/env'
import {
  ADMIN_ROUTES,
  AUTH_ROUTES,
  matchesRoute,
  PANEL_ROUTE,
  PUBLIC_ROUTES,
  REDIRECT_PARAM,
  SIGN_IN_ROUTE,
} from '@/lib/auth/routes'
import { readSession, SESSION_COOKIE_NAME } from '@/lib/auth/session'

/**
 * Guarda de navegação do painel.
 *
 * É uma checagem **otimista**: só olha o cookie para decidir para onde mandar o visitante, sem falar
 * com a `api-fr` (proxy não é lugar de I/O lento) e sem verificar a assinatura do JWT. A autorização
 * real continua sendo da API — toda tela e toda ação de servidor precisam checar a sessão por conta
 * própria, porque um cookie forjado atravessa este arquivo sem esforço.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
  const session = readSession(token)

  // Cookie presente mas inútil (expirado, corrompido ou com papel desconhecido): some com ele, senão
  // o navegador reenvia o mesmo lixo a cada requisição e o usuário fica preso no laço do login.
  const hasStaleCookie = Boolean(token) && !session

  // 1. Rota pública — sempre liberada, com ou sem sessão.
  if (matchesRoute(pathname, PUBLIC_ROUTES)) {
    return hasStaleCookie ? clearSession(NextResponse.next()) : NextResponse.next()
  }

  // 2. Fluxo de autenticação — quem já entrou não volta para o login.
  if (matchesRoute(pathname, AUTH_ROUTES)) {
    if (session) return NextResponse.redirect(new URL(PANEL_ROUTE, request.url))

    return hasStaleCookie ? clearSession(NextResponse.next()) : NextResponse.next()
  }

  // 3. Daqui para baixo tudo é protegido (`/panel`, `/printers`, `/releases`, `/admin/*`, e o que vier).
  if (!session) {
    const signInUrl = new URL(SIGN_IN_ROUTE, request.url)

    // Guarda o destino original para o login devolver o usuário ao lugar certo depois de autenticar.
    signInUrl.searchParams.set(REDIRECT_PARAM, `${pathname}${search}`)

    return clearSession(NextResponse.redirect(signInUrl))
  }

  // 4. Corte por papel: administração é só de ADMIN. MEMBER volta para o painel em vez de ver um 403 —
  // a sidebar já esconde a seção, então chegar aqui é URL digitada na mão.
  if (matchesRoute(pathname, ADMIN_ROUTES) && session.role !== 'ADMIN') {
    return NextResponse.redirect(new URL(PANEL_ROUTE, request.url))
  }

  return NextResponse.next()
}

function clearSession(response: NextResponse) {
  // `domain` e `path` precisam repetir o que a api-fr usou ao gravar: o navegador casa o cookie a
  // remover por (nome, domínio, caminho). Um delete host-only não apaga um cookie com `Domain=`.
  response.cookies.delete({ name: SESSION_COOKIE_NAME, domain: env.NEXT_PUBLIC_DOMAIN, path: '/' })

  return response
}

export const config = {
  // O `.*\..*` no fim tira do caminho tudo que tem extensão (`/logo.svg`, `/favicon.ico`, `/robots.txt`).
  // Sem isso, com a regra de negar por padrão, os próprios assets seriam redirecionados para o login.
  matcher: '/((?!api|_next/data|_next/static|_next/image|.*\\..*).*)',
}
