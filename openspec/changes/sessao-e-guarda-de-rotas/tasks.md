## 1. Ambiente e cliente HTTP (concluída)

- [x] 1.1 `src/env.ts` — schema Zod para `NEXT_PUBLIC_API_URL` e `NEXT_PUBLIC_DOMAIN`
- [x] 1.2 Citar cada variável nominalmente, já que o Next só substitui referências literais no bundle
- [x] 1.3 `src/lib/axios.ts` — instância única com `baseURL` do ambiente e `withCredentials: true`
- [x] 1.4 `src/lib/http/api-error.ts` — leitura defensiva de `message`, `status` e `retryAfterInSeconds`
- [x] 1.5 `formatWaitTime` — segundos em texto corrente ("2 minutos", "1 minuto e 30 segundos")

## 2. React Query (concluída)

- [x] 2.1 Adicionar `@tanstack/react-query`
- [x] 2.2 `src/lib/react-query.ts` — `getQueryClient()` com instância por requisição no servidor
- [x] 2.3 Desligar retentativa para `4xx`, mantendo-a para falha de transporte
- [x] 2.4 Montar o `QueryClientProvider` no `ClientProviders`
- [x] 2.5 Mover `client-providers.tsx` para `src/components/app/` — é montado pelo layout raiz e serve
      também o grupo `(public)`, onde o login usa React Query
- [x] 2.6 `src/constants/query-keys.ts` — chaves centralizadas

## 3. Leitura de sessão (concluída)

- [x] 3.1 `src/lib/auth/session.ts` — nome do cookie e enum de papéis (`ADMIN`, `MEMBER`)
- [x] 3.2 Decodificar base64url do payload do JWT, com `TextDecoder` para não corromper acentos
- [x] 3.3 Validar o payload com Zod (`sub`, `role`, `exp`)
- [x] 3.4 `isSessionExpired` — token sem `exp` é tratado como expirado
- [x] 3.5 `readSession` — retorna a sessão só quando bem formada, com papel conhecido e dentro da validade

## 4. Política e guarda de rotas (concluída)

- [x] 4.1 `src/lib/auth/routes.ts` — `PUBLIC_ROUTES`, `AUTH_ROUTES`, `ADMIN_ROUTES` e destinos
- [x] 4.2 `matchesRoute` casando por segmento, evitando `/administrativo` casar com `/admin`
- [x] 4.3 `src/proxy.ts` — rota pública liberada com ou sem sessão
- [x] 4.4 Fluxo de autenticação devolve ao painel quem já tem sessão
- [x] 4.5 Negar por padrão: sem sessão, redirecionar ao login preservando o destino em `?redirect=`
- [x] 4.6 Corte por papel: `/admin/*` só para `ADMIN`; `MEMBER` volta ao painel
- [x] 4.7 `clearSession` repetindo `domain` e `path` usados pela API na gravação
- [x] 4.8 `matcher` excluindo `api`, artefatos do `_next` e qualquer caminho com extensão

## 5. Login integrado (concluída)

- [x] 5.1 `src/server/employees/sign-in.ts` — `POST /employees/session/auth`
- [x] 5.2 `handleSignIn` chamando a API por `useMutation`, no lugar do `console.log`
- [x] 5.3 Mensagem do servidor na área de erro geral (`errors.root`), com fallback próprio
- [x] 5.4 `429` traduzido para tempo de espera legível
- [x] 5.5 `resetField('password')` e foco de volta na senha, preservando o CPF
- [x] 5.6 `queryClient.clear()` após autenticar, para não herdar o perfil da sessão anterior
- [x] 5.7 Retorno ao `?redirect=`, lido de `window.location` para manter `/auth/sign-in` estática
- [x] 5.8 Recusar destino não interno (`//evil.com`, `https://…`) para não virar open redirect

## 6. Perfil na barra superior (concluída)

- [x] 6.1 `src/server/employees/get-profile.ts` — `GET /employees/profile`
- [x] 6.2 Tipar `imageUrl` como `string | null` e `role` reutilizando o enum de `lib/auth/session`
- [x] 6.3 `panel-user.tsx` — ilha cliente com a consulta e `staleTime` infinito
- [x] 6.4 `skeleton` do tamanho final enquanto o perfil não chega
- [x] 6.5 Iniciais do nome quando não há foto
- [x] 6.6 `PanelHeader` volta a Server Component, com a marca e o gatilho sempre montados
- [x] 6.7 Restaurar o brilho radial da barra, perdido na primeira integração — **superado**: removido de vez
      por decisão de design na change `menu-do-usuario-e-logout`
- [x] 6.8 `next.config.ts` — liberar o host do Supabase em `images.remotePatterns`

## 7. Verificação

- [x] 7.1 `pnpm exec tsc --noEmit` sem erros
- [x] 7.2 `pnpm biome check` sem issues
- [x] 7.3 `pnpm build` com `/auth/sign-in` ainda estática e o proxy registrado
- [ ] 7.4 Login real contra a `api-fr` local: credenciais válidas, inválidas e teto de 429
- [ ] 7.5 Conferir o retorno ao `?redirect=` abrindo `/panel` sem sessão
- [ ] 7.6 Conferir o corte de `/admin/*` com um funcionário `MEMBER`
- [ ] 7.7 Conferir a barra superior com funcionário sem foto e em conexão lenta

## 8. Próximos passos (fora desta change)

- [x] 8.1 Logout — resolvido pela change `menu-do-usuario-e-logout`: a `api-fr` passou a expor
      `POST /employees/session/logout` em 2026-08-17
- [ ] 8.2 Esconder a seção "Administração" da sidebar para `MEMBER`
- [ ] 8.3 "Manter-me conectado" — decorativo: a API aceita só `{ cpf, password }` e fixa o cookie em 1 dia.
      Decidir entre remover o campo ou pedir suporte na `api-fr`
- [ ] 8.4 `/auth/forgot-password` e redefinição de senha com o código de 6 caracteres
- [ ] 8.5 `PATCH /employees/change-password` para o funcionário logado
- [ ] 8.6 Revisar `Domain`/`SameSite` do cookie quando painel e API forem para domínios de produção
