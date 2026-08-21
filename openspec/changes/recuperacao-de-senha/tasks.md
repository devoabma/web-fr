## 1. Camada de dados e utilidades (concluída)

- [x] 1.1 `src/server/employees/request-password-recovery.ts` — `POST /employees/password-recovery` pelo
      cliente axios, corpo `{ cpf, email }`, resposta `{ message: string }`
- [x] 1.2 `src/server/employees/reset-password.ts` — `POST /employees/reset-password`, corpo
      `{ code, password, confirmPassword }` espelhando o schema Zod da API
- [x] 1.3 `src/utils/masks/recovery-code.ts` com `RECOVERY_CODE_LENGTH = 6`
- [x] 1.4 `maskRecoveryCode` — caixa-alta, só `[A-Z0-9]`, corte em 6 caracteres
- [x] 1.5 `isRecoveryCode` fora do arquivo de schema, para o Server Component poder importá-la sem
      arrastar o `react-hook-form`

## 2. Tela "Esqueci minha senha" (concluída)

- [x] 2.1 `src/app/(public)/auth/forgot-password/page.tsx` com `metadata.title = 'Esqueci minha senha'`
- [x] 2.2 Cabeçalho no mesmo padrão do login (`text-3xl text-primary` + descrição em `text-sm`)
- [x] 2.3 `_components/form-forgot-password-schema.tsx` reaproveitando o `cpfSchema` do login
- [x] 2.4 E-mail validado com `z.email().trim()`, **sem** `.toLowerCase()` — a API compara caixa a caixa
- [x] 2.5 Campo de CPF com `maskCpf` via `Controller`, `inputMode="numeric"`
- [x] 2.6 Aviso geral em `errors.root` com `role="alert"`, no padrão da tela de login
- [x] 2.7 `429` traduzido com `getRetryAfterInSeconds` + `formatWaitTime`
- [x] 2.8 Sucesso troca o formulário pelo painel de confirmação, com o e-mail de destino e o prazo de
      5 minutos
- [x] 2.9 `sentTo` guarda o par enviado, para o reenvio não depender do formulário desmontado
- [x] 2.10 Cooldown de 60s derivado de `cooldownEndsAt` absoluto, recalculado a cada tique
- [x] 2.11 Botão de reenvio rotulado com o restante ("Reenviar em 42s") e desabilitado durante a espera
- [x] 2.12 Falha no reenvio avisa por toast e **não** derruba o painel de confirmação
- [x] 2.13 Atalhos "Já tenho o código" e "Voltar para o login"

## 3. Tela "Redefinir senha" (concluída)

- [x] 3.1 `src/app/(public)/auth/reset-password/page.tsx` com `metadata.title = 'Redefinir senha'`
- [x] 3.2 `searchParams` aguardado e `?code=` higienizado por `sanitizeCode` antes de virar valor inicial
- [x] 3.3 `_components/form-reset-password-schema.tsx` com `toUpperCase()` + `refine(isRecoveryCode)`
- [x] 3.4 `min(8)` nas duas senhas e `refine` de igualdade com `path: ['confirmPassword']`
- [x] 3.5 Campo do código via `Controller` com `maskRecoveryCode`, `autoComplete="one-time-code"`,
      `spellCheck={false}` e tipografia `font-mono` com `tracking` largo
- [x] 3.6 `FieldDescription` com o prazo de 5 minutos quando não há erro no campo
- [x] 3.7 `Checkbox` único de "Mostrar senhas" alternando o `type` dos dois campos
- [x] 3.8 Erro da API no aviso de topo, com foco escolhido pela mensagem (código vs. senha)
- [x] 3.9 Sucesso troca o formulário por painel de confirmação com o atalho para o login
- [x] 3.10 Link "Código expirado? Solicitar um novo" de volta para `/auth/forgot-password`

## 4. Layout de autenticação (concluída)

- [x] 4.1 `metadata` sai de `(public)/auth/layout.tsx`
- [x] 4.2 `title: 'Entrar'` passa para `(public)/auth/sign-in/page.tsx`

## 5. Verificação

- [x] 5.1 `pnpm exec tsc --noEmit` sem erros
- [x] 5.2 `pnpm biome check --write` sem issues
- [x] 5.3 `pnpm build` — `/auth/forgot-password` estática, `/auth/reset-password` dinâmica
- [ ] 5.4 Fluxo completo contra a `api-fr` local: pedir código, receber o e-mail, redefinir e entrar com a
      senha nova
- [ ] 5.5 Abrir o link do e-mail e conferir que o campo do código já vem preenchido
- [ ] 5.6 `?code=` inválido, truncado ou com lixo: o campo deve nascer vazio
- [ ] 5.7 Código em minúsculo colado no campo: deve subir para caixa-alta e ser aceito
- [ ] 5.8 CPF e e-mail de funcionários diferentes: conferir a mensagem de credenciais inválidas
- [ ] 5.9 E-mail cadastrado com maiúscula: conferir que o par ainda casa
- [ ] 5.10 Reenvio: conferir a contagem regressiva, o bloqueio durante a espera e a liberação ao zerar
- [ ] 5.11 Deixar a aba em segundo plano durante o cooldown e voltar: o contador deve estar correto
- [ ] 5.12 Estourar as 5 tentativas em 15 minutos: conferir o texto de espera do `429`
- [ ] 5.13 Código expirado (esperar 5 minutos): conferir a mensagem e o foco no campo do código
- [ ] 5.14 Redefinir para a mesma senha anterior: conferir a recusa e o foco no campo de senha
- [ ] 5.15 Confirmação divergente: conferir o erro sob o campo `confirmPassword`
- [ ] 5.16 Tentar abrir `/auth/forgot-password` já logado: o `proxy.ts` deve devolver ao painel
- [ ] 5.17 Conferir as duas telas abaixo de 640px e no tema escuro

## 6. Próximos passos (fora desta change)

- [ ] 6.1 Código de erro no corpo do `400` da `api-fr`, para o front parar de decidir o foco por regex
- [ ] 6.2 Denylist de token na `api-fr` — redefinir a senha ainda não expulsa sessões abertas
- [ ] 6.3 Normalizar o e-mail na escrita da `api-fr` (cadastro e atualização), para acabar de vez com a
      sensibilidade a maiúsculas na busca
