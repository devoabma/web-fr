## 1. Fundação do projeto (concluída)

- [x] 1.1 Configurar Tailwind CSS v4 e mover `src/app/globals.css` para `src/app/styles/globals.css`
- [x] 1.2 Definir tokens do tema em `oklch` (`:root` e `.dark`), incluindo `--primary` (azul-marinho) e o token custom `--grid-line`
- [x] 1.3 Inicializar shadcn no estilo `base-nova` sobre `@base-ui/react` (`components.json`, `baseColor: zinc`, `iconLibrary: lucide`)
- [x] 1.4 Criar `src/lib/utils.ts` com o helper `cn()` (clsx + tailwind-merge)
- [x] 1.5 Adicionar as primitivas `src/components/ui/button.tsx` e `src/components/ui/badge.tsx`
- [x] 1.6 Endurecer o `biome.json`: largura 130, aspas simples no TS e duplas no JSX, sem ponto e vírgula, `organizeImports` e `useSortedClasses` como erro

## 2. Layout raiz (concluída)

- [x] 2.1 Carregar Space Grotesk via `next/font/google` expondo a variável `--font-sans`
- [x] 2.2 Definir a metadata do produto com template de título `%s | Sala Livre`, descrição e favicon `/fr.svg`
- [x] 2.3 Criar `ClientProviders` com o `Toaster` do sonner, isolando o que precisa rodar no cliente
- [x] 2.4 Adicionar `GridOverlay` como fundo decorativo com máscara radial e `aria-hidden`

## 3. Seções da landing (concluída)

- [x] 3.1 `header.tsx` — marca do produto e logo da OAB-MA no lugar do botão "Acessar painel" do design
- [x] 3.2 `hero-content.tsx` — badge com indicador pulsante, título com quebra explícita, subtítulo e CTA para `/painel`
- [x] 3.3 `dashboard-preview.tsx` — mockup do painel com barra de janela, sidebar de salas e grade de computadores
- [x] 3.4 `features.tsx` — quatro cards com ícones lucide substituindo os glifos do design original
- [x] 3.5 `footer.tsx` — copyright com ano dinâmico e links de navegação
- [x] 3.6 Compor as cinco seções em `src/app/page.tsx` mantendo tudo como Server Component

## 4. Modelagem dos dados do mockup (concluída)

- [x] 4.1 Tipar `ComputerStatus` e `Computer` em `dashboard-preview.tsx`
- [x] 4.2 Centralizar as variações visuais de cada estado no mapa `statusStyles`
- [x] 4.3 Derivar os contadores de status e o total de computadores do array `computers`, em vez de literais

## 5. Responsividade (concluída)

- [x] 5.1 Header: logo da OAB escalando `w-24 → w-32 → w-40` e espaçamentos progressivos
- [x] 5.2 Hero: título `text-4xl → text-5xl → text-[64px]` com `tracking` proporcional; CTA `w-full` travando em `max-w-55.25`
- [x] 5.3 Painel: corpo `flex-col` até `md`; sidebar vira faixa com scroll horizontal; atalhos ocultos abaixo de `md`
- [x] 5.4 Painel: grade de computadores `grid-cols-2 → 3 → 4` e pills de status com `flex-wrap`
- [x] 5.5 Features: `grid-cols-1 → 2 → 4`
- [x] 5.6 Footer: empilhado e centralizado, virando linha com `justify-between` em `lg`
- [x] 5.7 Remover a classe `container` do header, que conflitava com `max-w-310` na definição de `max-width`

## 6. Correções aplicadas durante a construção (concluída)

- [x] 6.1 Passar `nativeButton={false}` no CTA renderizado como `Link`, eliminando o erro de console do `@base-ui/react`
- [x] 6.2 Trocar `shadow-[…--theme(…)]` por valor literal, evitando sintaxe não suportada em `arbitrary value`
- [x] 6.3 Reverter o badge do hero para `px-3 py-4 text-xs` conforme decisão do usuário

## 7. Ferramental (concluída)

- [x] 7.1 Inicializar o OpenSpec no repositório (`openspec init --tools claude`)
- [x] 7.2 Confirmar o RTK ativo pelo hook global `PreToolUse` em `~/.claude/settings.json`
- [x] 7.3 Criar `.claude/settings.local.json` com o allowlist de comandos, espelhando a `api-fr`

## 8. Verificação

- [x] 8.1 `pnpm exec tsc --noEmit` sem erros
- [x] 8.2 `pnpm biome check` sem issues
- [x] 8.3 `pnpm build` gerando `/` e `/_not-found` como estáticas
- [ ] 8.4 Conferir a landing em viewport real de 320px, 768px e 1440px
- [ ] 8.5 Validar contraste dos estados (verde/rose/slate) contra o fundo dos cards

## 9. Próximos passos (fora desta change)

- [ ] 9.1 Criar a rota `/painel` para a qual o CTA do hero aponta
- [ ] 9.2 Criar as rotas `/privacidade`, `/suporte` e `/status` do rodapé
- [ ] 9.3 Definir o cliente HTTP da `api-fr`, incluindo o tratamento de `429` com `retryAfterInSeconds`
- [ ] 9.4 Implementar a autenticação do funcionário (`POST /employees/session/auth`)
