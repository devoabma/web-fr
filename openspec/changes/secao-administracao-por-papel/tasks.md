## 1. Papel resolvido no servidor (concluída)

- [x] 1.1 Ler `@fr-auth-token` no `(private)/layout.tsx` com `readSession`, aproveitando o `cookies()` que
      já resolvia o `defaultOpen` da sidebar
- [x] 1.2 `session?.role ?? 'MEMBER'` — sem sessão utilizável, menor privilégio
- [x] 1.3 Comentar no código por que o papel não vem do `GET /employees/profile`: do cookie, o HTML já sai
      correto e a seção não pisca
- [x] 1.4 Registrar no mesmo comentário que o proxy e a `api-fr` continuam sendo a autorização de verdade

## 2. Navegação filtrada (concluída)

- [x] 2.1 `adminOnly?: boolean` no tipo `NavSection`
- [x] 2.2 Marcar o grupo "Administração" com `adminOnly: true`
- [x] 2.3 `NavItems` passa a receber `role: Role`
- [x] 2.4 Filtro numa expressão só: `NAV_SECTIONS.filter(s => !s.adminOnly || role === 'ADMIN')`
- [x] 2.5 Renderizar `sections` no lugar de `NAV_SECTIONS`
- [x] 2.6 Sem `useMemo` — duas seções e o React Compiler ligado
- [x] 2.7 `PanelSidebar` repassa `role` do layout ao `NavItems`

## 3. Título da aba (concluída)

- [x] 3.1 Remover `export const metadata` do `(private)/layout.tsx` — título é da rota, não da moldura
- [x] 3.2 Declarar `title: 'Painel'` em `(private)/panel/page.tsx`
- [x] 3.3 Manter o template `%s • Sala Livre` no layout raiz
- [x] 3.4 `Minha conta` → `Minha Conta` em `/profile`, alinhando com o rótulo do menu do usuário

## 4. Verificação

- [x] 4.1 `pnpm exec tsc --noEmit` sem erros
- [x] 4.2 `pnpm biome check --write` sem issues
- [x] 4.3 `pnpm build` — quatro rotas e o proxy registrados
- [ ] 4.4 Entrar com um funcionário `MEMBER` real e conferir que o grupo "Administração" some inteiro,
      rótulo e espaçamento do grupo inclusive
- [ ] 4.5 Entrar com um `ADMIN` e conferir que os três itens continuam de pé
- [ ] 4.6 Conferir o HTML servido (view-source, não devtools) de um `MEMBER`: o grupo não pode estar no
      markup inicial
- [ ] 4.7 Conferir a sidebar recolhida à faixa de ícones com `MEMBER` — sem separador órfão nem espaço
      sobrando onde o grupo estava
- [ ] 4.8 Conferir o painel sobreposto abaixo de 768px com `MEMBER`
- [ ] 4.9 Apagar o cookie pelo devtools e recarregar: confirmar que o proxy leva ao login antes de a
      sidebar renderizar
- [ ] 4.10 Conferir o título da aba em `/panel` e `/profile`

## 5. Próximos passos (fora desta change)

- [ ] 5.1 Criar as cinco áreas que a sidebar referencia — `/printers`, `/releases`, `/admin/rooms`,
      `/admin/computers` e `/admin/employees` continuam caindo na 404
- [ ] 5.2 Ao criar cada área `/admin/*`, conferir que o `adminOnly` da seção cobre a rota nova — a marcação
      é opt-in e uma seção administrativa sem ela vazaria para o `MEMBER`
- [ ] 5.3 Derivar `adminOnly` de `ADMIN_ROUTES`, ou o contrário, antes que as duas listas divirjam
- [ ] 5.4 Decidir se o recorte por papel precisa chegar ao item avulso, e não só ao grupo
- [ ] 5.5 Status real do sistema no lugar do badge fixo "All OK"
