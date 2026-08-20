## 1. Camada de dados (concluída)

- [x] 1.1 `src/server/employees/change-password.ts` — `PATCH /employees/change-password` pelo cliente axios
- [x] 1.2 Corpo tipado como `{ currentPassword, newPassword, confirmNewPassword }`, espelhando o schema Zod
      da API — o nome `confirmNewPassword` é o do backend, não o do formulário
- [x] 1.3 Resposta tipada como `{ message: string }`
- [x] 1.4 Reaproveitar `getProfile` e `queryKeys.getProfile()` já existentes, sem chave nova

## 2. Rota e cabeçalho (concluída)

- [x] 2.1 `src/app/(private)/profile/page.tsx` dentro do grupo `(private)` — guarda do `proxy.ts` de graça
- [x] 2.2 `metadata.title = 'Minha conta'`
- [x] 2.3 Cabeçalho no mesmo padrão do `/panel`: título `text-xl` e descrição `max-w-3xl`
- [x] 2.4 Coluna limitada em `max-w-3xl` — no monitor do balcão o cartão viraria uma faixa vazia

## 3. Dados da conta (concluída)

- [x] 3.1 `_components/profile-details.tsx` com `useQuery` em `staleTime: Number.POSITIVE_INFINITY`
- [x] 3.2 Cartão de identificação: avatar quadrado (`rounded-xl after:rounded-xl`), nome e papel
- [x] 3.3 `ROLE_LABELS: Record<Role, string>` — mesmo mapa exaustivo do menu do usuário
- [x] 3.4 `_components/profile-row.tsx` — linha de dado com ícone, rótulo e valor, com `truncate`
- [x] 3.5 CPF mascarado por `maskCpf`, o mesmo do login
- [x] 3.6 Frase explícita de que os dados são do administrador, não editáveis aqui
- [x] 3.7 `Skeleton` no carregamento, nas alturas dos dois cartões
- [x] 3.8 Estado de erro como aviso `role="alert"` na paleta `destructive`, sem derrubar a rota

## 4. Troca de senha (concluída)

- [x] 4.1 `_components/change-password-schema.tsx` — `min(8)` nos três campos
- [x] 4.2 `refine` de igualdade com `path: ['confirmPassword']`
- [x] 4.3 `refine` de senha nova diferente da atual com `path: ['newPassword']` — antecipa a recusa da API
- [x] 4.4 `_components/change-password-dialog.tsx` com `Dialog` controlado
- [x] 4.5 `handleOpenChange` bloqueia o fechamento enquanto `isSubmitting`
- [x] 4.6 `closeDialog` centraliza fechar + `reset()` + desligar "mostrar senhas"
- [x] 4.7 Campos com `autoComplete` correto: `current-password` e `new-password`
- [x] 4.8 `Checkbox` único de "Mostrar senhas" alternando o `type` dos três campos
- [x] 4.9 `FieldDescription` com a regra dos 8 caracteres quando não há erro no campo
- [x] 4.10 Envio pelo rodapé via `form="change-password-form"`, com o `<form>` no corpo do diálogo
- [x] 4.11 Sucesso: `closeDialog()` e toast de confirmação
- [x] 4.12 Erro: `resetField('currentPassword')` + `setFocus`, preservando as senhas novas digitadas
- [x] 4.13 Toast com a `message` da API por `getApiErrorMessage`, com fallback só para falha de rede
- [x] 4.14 `429` tratado com `getRetryAfterInSeconds` + `formatWaitTime`, no padrão do login
- [x] 4.15 Botões desabilitados e rótulo "Salvando..." durante o envio

## 5. Menu do usuário (concluída)

- [x] 5.1 "Configurações de Conta" com `render={<Link href="/profile" />}` — âncora de verdade, não
      `router.push`

## 6. Verificação

- [x] 6.1 `pnpm exec tsc --noEmit` sem erros
- [x] 6.2 `pnpm biome check --write` sem issues
- [x] 6.3 `pnpm build` — `/profile` registrada como rota dinâmica
- [ ] 6.4 Troca de senha real contra a `api-fr` local: sucesso, toast e diálogo fechado
- [ ] 6.5 Senha atual incorreta: conferir que a `message` da API aparece e que as senhas novas continuam
      digitadas, com o foco na senha atual
- [ ] 6.6 Senha nova igual à atual: conferir que a recusa acontece no cliente, sem requisição
- [ ] 6.7 Confirmação divergente: conferir o erro sob o campo `confirmPassword`
- [ ] 6.8 `429` no `change-password`: conferir o texto de espera
- [ ] 6.9 Fechar por `Esc` e por clique fora durante o envio: o diálogo deve resistir
- [ ] 6.10 Reabrir o diálogo depois de fechar: campos limpos e "mostrar senhas" desligado
- [ ] 6.11 Fazer login com a senha nova depois da troca
- [ ] 6.12 Conferir a tela com `MEMBER` e com funcionário sem foto (fallback de iniciais)
- [ ] 6.13 Conferir o estado de erro do `getProfile` com a API fora do ar
- [ ] 6.14 Conferir a tela abaixo de 640px — o cartão de segurança empilha o botão sob o texto

## 7. Próximos passos (fora desta change)

- [ ] 7.1 Trocar foto de perfil (`PATCH /employees/update-image`) a partir desta mesma tela, invalidando
      `queryKeys.getProfile()`
- [ ] 7.2 "Esqueci minha senha" (`POST /employees/password-recovery`) e redefinição com o código de 6
      caracteres (`POST /employees/reset-password`)
- [ ] 7.3 Denylist de token na `api-fr`, para que a troca de senha encerre as sessões anteriores
- [ ] 7.4 Tela de administração de funcionários, destino real do "procure um administrador"
