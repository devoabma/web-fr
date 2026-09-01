## 1. Cascas das telas (concluída)

- [x] 1.1 `src/app/(private)/downloads/page.tsx` com cabeçalho, `metadata.title` e bloco tracejado
- [x] 1.2 `downloads-notice.tsx` com o expurgo de sexta às 23:59 e o recorte por salas vinculadas
- [x] 1.3 `src/app/(private)/admin/reports/page.tsx` no mesmo molde
- [x] 1.4 `reports-notice.tsx` com o escopo de `ADMIN` e o registro excluído que segue no histórico

## 2. Navegação (concluída)

- [x] 2.1 `Métricas` e `Downloads` na seção do painel de `nav-items.tsx`
- [x] 2.2 `Relatórios` na seção de administração, que já é renderizada só para `ADMIN`

## 3. Guarda de rota (concluída)

- [x] 3.1 Conferir que `/downloads` nasce protegida sem entrar em `PUBLIC_ROUTES` — a política é
      negar por padrão
- [x] 3.2 Conferir que `/admin/reports` é coberta pelo prefixo `/admin` de `ADMIN_ROUTES`, sem
      registro próprio

## 4. Verificação (concluída)

- [x] 4.1 `tsc --noEmit` sem erros
- [x] 4.2 `biome check src` sem issues
- [x] 4.3 `next build` sem erros, com `/downloads` e `/admin/reports` na lista de rotas
