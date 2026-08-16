## 1. Reorganização de rotas e estilos (concluída)

- [x] 1.1 Renomear o grupo `(internal-layout)` para `(private)` e atualizar o import do `ClientProviders`
- [x] 1.2 Criar o grupo `(public)` para as rotas sem sessão
- [x] 1.3 Mover `src/app/styles/globals.css` para `src/styles/globals.css` e ajustar o import para `@/styles/globals.css`
- [x] 1.4 Tirar o `GridOverlay` do layout raiz e passá-lo para a landing
- [x] 1.5 Corrigir `lang="en"` para `lang="pt-BR"` no `<html>`

## 2. Primitivas de UI (concluída)

- [x] 2.1 Adicionar `src/components/ui/input.tsx`
- [x] 2.2 Adicionar `src/components/ui/label.tsx`
- [x] 2.3 Adicionar `src/components/ui/field.tsx` com `Field`, `FieldGroup`, `FieldLabel` e `FieldError`
- [x] 2.4 Adicionar `src/components/ui/checkbox.tsx`
- [x] 2.5 Adicionar `src/components/ui/separator.tsx`
- [x] 2.6 Criar `src/components/app/brand-mark.tsx` com `currentColor` e `accentClassName`

## 3. Validação e máscara de CPF (concluída)

- [x] 3.1 `src/utils/schemas/cpf.ts` — normalizar para dígitos e validar os dois dígitos verificadores
- [x] 3.2 Rejeitar sequências de dígitos repetidos (`111.111.111-11`)
- [x] 3.3 `src/utils/masks/cpf.ts` — máscara progressiva `000.000.000-00` limitada a 11 dígitos

## 4. Tela de login (concluída)

- [x] 4.1 `(public)/auth/layout.tsx` — split com painel de marca e área de formulário
- [x] 4.2 Painel de marca: logo Sala Livre, logo da OAB-MA invertida, proposta de valor e copyright
- [x] 4.3 Marca d'água do `BrandMark` e brilho radial no canto do painel
- [x] 4.4 `(public)/auth/sign-in/page.tsx` — título, subtítulo e composição do formulário
- [x] 4.5 `form-auth-schema.tsx` — schema Zod e hook `useLoginForm` com `zodResolver`
- [x] 4.6 `form-auth.tsx` — campos, estados e submit
- [x] 4.7 Campo de CPF com `Controller` aplicando a máscara no `onChange`
- [x] 4.8 Campo de senha com alternância de visibilidade e `aria-pressed`
- [x] 4.9 Checkbox "Manter-me conectado" ligado por `Controller`
- [x] 4.10 Bloco de alerta lendo `errors.root?.message` com `role="alert"`
- [x] 4.11 Botão de envio com `disabled={isSubmitting}` e indicador de progresso
- [x] 4.12 Placeholder de `(public)/auth/sign-up`

## 5. Responsividade (concluída)

- [x] 5.1 Grid `grid-rows-[1fr_1fr]` empilhado até `md`, virando `grid-cols-2` a partir de `md`
- [x] 5.2 `order-1`/`order-2` colocando o formulário acima do painel de marca no mobile
- [x] 5.3 Marcas do painel com `truncate`/`shrink-0` para não quebrarem em telas estreitas
- [x] 5.4 Tipografia do painel escalando `text-3xl → text-4xl → text-5xl`

## 6. Ferramental (concluída)

- [x] 6.1 Adicionar `react-hook-form`, `zod` e `@hookform/resolvers`
- [x] 6.2 Adicionar `axios` (uso na change de integração)

## 7. Verificação

- [x] 7.1 `pnpm exec tsc --noEmit` sem erros
- [x] 7.2 `pnpm biome check` sem issues
- [x] 7.3 `pnpm build` gerando `/auth/sign-in` e `/auth/sign-up` como estáticas
- [ ] 7.4 Conferir a tela em viewport real de 320px, 768px e 1440px
- [ ] 7.5 Validar navegação por teclado e leitura do formulário por leitor de tela

## 8. Próximos passos (fora desta change)

- [ ] 8.1 Cliente HTTP da `api-fr` com base URL por env e tratamento de `400`/`401`/`429`
- [ ] 8.2 Integrar `POST /employees/session/auth` ao `handleSignIn`, que hoje só faz `console.log`
- [ ] 8.3 Exibir o tempo de espera do `429` (`retryAfterInSeconds`) no bloco de erro geral
- [ ] 8.4 Persistir a sessão e proteger o grupo `(private)`
- [ ] 8.5 Implementar `/auth/forgot-password`, hoje linkada e inexistente
- [x] 8.6 Decidir o destino de `/auth/sign-up` — **removida** na change `shell-do-painel`: não há
      auto-cadastro no produto, o cadastro de funcionário é ação de `ADMIN` dentro do painel
