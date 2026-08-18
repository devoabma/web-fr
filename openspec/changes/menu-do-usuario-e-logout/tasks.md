## 1. Primitivos de interface (concluída)

- [x] 1.1 `src/components/ui/avatar.tsx` — `Avatar`, `AvatarImage`, `AvatarFallback`, `AvatarBadge`,
      `AvatarGroup` e `AvatarGroupCount` sobre `@base-ui/react/avatar`
- [x] 1.2 `src/components/ui/dropdown-menu.tsx` — `Root`, `Trigger`, `Content` (portal + positioner),
      `Item` com variante destrutiva, `Separator`, `Label`, `Group`, submenu, checkbox e radio
- [x] 1.3 Manter o estilo `base-nova` do `components.json`, sem divergir dos demais primitivos

## 2. Camada de dados (concluída)

- [x] 2.1 `src/server/employees/logout.ts` — `POST /employees/session/logout` pelo cliente axios
- [x] 2.2 Conferir o prefixo `/employees`: `/session/logout` devolve `404`
- [x] 2.3 Documentar a dependência do `withCredentials` — sem ele o `Set-Cookie` de limpeza é descartado
- [x] 2.4 Tipar a resposta como `{ message: string }`, espelhando o schema Zod da API

## 3. Utilitário compartilhado (concluída)

- [x] 3.1 `src/utils/index.ts` — mover `getInitials` para fora do `panel-user.tsx`
- [x] 3.2 Preservar o comportamento: primeira e última inicial, `?` para nome vazio, resultado maiúsculo

## 4. Menu do usuário (concluída)

- [x] 4.1 Trocar o `next/image` do bloco de usuário por `Avatar`/`AvatarImage`/`AvatarFallback`
- [x] 4.2 Arredondamento quadrado no avatar e no pseudo-elemento da borda (`rounded-md after:rounded-md`)
- [x] 4.3 Envolver o avatar em `DropdownMenuTrigger`
- [x] 4.4 `aria-label="Abrir menu do usuário"` — o nome ao lado some abaixo de 640px e as iniciais não
      descrevem a ação
- [x] 4.5 Cabeçalho do menu com nome, e-mail e papel, todos com `truncate`
- [x] 4.6 `ROLE_LABELS: Record<Role, string>` — mapa exaustivo, não ternário
- [x] 4.7 Item "Configurações de Conta", inerte por ora
- [x] 4.8 Item "Sair do sistema" na variante destrutiva
- [x] 4.9 Largura explícita `w-60` — o padrão `w-(--anchor-width)` seguiria o avatar de 32px
- [x] 4.10 Corrigir a sintaxe de variável CSS: `w-[--anchor-width]` é forma do Tailwind v3 e gera
      `width: --anchor-width`, descartado pelo navegador

## 5. Fluxo de saída (concluída)

- [x] 5.1 `useMutation` com `mutationFn: logout`
- [x] 5.2 Ordem: `await logout()` → `queryClient.clear()` → `router.replace(SIGN_IN_ROUTE)` →
      `router.refresh()`
- [x] 5.3 `replace` e não `push`: o painel não deve voltar pelo histórico
- [x] 5.4 `closeOnClick={false}` — o menu só fecha quando a saída se confirma
- [x] 5.5 Item desabilitado e `spinner` no lugar do ícone durante a chamada
- [x] 5.6 `catch` com toast: falha de rede mantém o cookie de pé, então não se navega para o login

## 6. Barra superior (concluída)

- [x] 6.1 Remover o brilho radial (`radial-gradient`) — decisão de design, reverte `d1c853e`
- [x] 6.2 Conferir que o `SidebarTrigger` continua acessível no mobile

## 7. Verificação

- [x] 7.1 `pnpm exec tsc --noEmit` sem erros
- [x] 7.2 `pnpm biome check` sem issues
- [x] 7.3 `pnpm build` — as quatro rotas e o proxy registrados
- [ ] 7.4 Logout real contra a `api-fr` local: confirmar que o cookie some e que `/panel` volta ao login
- [ ] 7.5 Simular falha de rede no logout (devtools offline) e conferir o toast, o menu aberto e a sessão
      preservada
- [ ] 7.6 Conferir o menu por teclado: abrir, navegar entre itens e fechar com `Esc`
- [ ] 7.7 Conferir a largura e o posicionamento do menu abaixo de 640px, sem o nome ao lado do avatar
- [ ] 7.8 Conferir o fallback de iniciais e o caso de `imageUrl` presente mas inacessível
- [ ] 7.9 Conferir os rótulos de papel com um funcionário `MEMBER`

## 8. Próximos passos (fora desta change)

- [ ] 8.1 Tela de configurações de conta, destino do item hoje inerte
- [ ] 8.2 `PATCH /employees/change-password` a partir do menu
- [ ] 8.3 `PATCH /employees/update-image` — trocar foto e invalidar `queryKeys.getProfile()`
- [ ] 8.4 Esconder a seção "Administração" da sidebar para `MEMBER`
- [ ] 8.5 Denylist de token na `api-fr`, para que o logout invalide a credencial e não só o cookie
- [ ] 8.6 Reaproveitar `getInitials` nas listagens de funcionário do inventário
