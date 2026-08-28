## 1. Acesso às rotas (concluída)

- [x] 1.1 `activateEmployee(employeeId)` em `src/server/employees/activate.ts`
- [x] 1.2 `deactivateEmployee(employeeId)` em `src/server/employees/inactive.ts`
- [x] 1.3 Nomes de arquivo espelhando `src/server/rooms/` (`activate.ts` / `inactive.ts`)

## 2. Reativar (concluída)

- [x] 2.1 `ActivateEmployee` com ação direta, sem diálogo
- [x] 2.2 Botão em `Tooltip`, com `aria-label` nomeando o colaborador
- [x] 2.3 Indicador de carregamento no lugar do ícone durante a chamada
- [x] 2.4 Invalidação de `getEmployees` no sucesso
- [x] 2.5 Toast de sucesso dizendo que o acesso ao painel voltou

## 3. Inativar (concluída)

- [x] 3.1 `InactiveEmployee` com confirmação em `AlertDialog`
- [x] 3.2 Diálogo nomeando o colaborador no título
- [x] 3.3 Descrição dizendo que o bloqueio vale a partir do próximo acesso
- [x] 3.4 Descrição contando os vínculos de sala que permanecem
- [x] 3.5 Botão de confirmar desabilitado durante a chamada
- [x] 3.6 Diálogo que não fecha no meio da chamada
- [x] 3.7 Fechamento apenas no sucesso, com toast

## 4. Trava de auto-inativação (concluída)

- [x] 4.1 Comparação do id da linha com o `getProfile()` em cache
- [x] 4.2 `aria-disabled` no botão, com opacidade reduzida
- [x] 4.3 `onClick` guardado, para o `aria-disabled` não ser só visual
- [x] 4.4 Tooltip explicando o motivo no lugar do rótulo normal

## 5. Listagem (concluída)

- [x] 5.1 Coluna de ações escolhendo o componente por `employee.inactive`
- [x] 5.2 Ordem das ações: editar, salas, alternância

## 6. Tratamento de erro (concluída)

- [x] 6.1 `429` lido com `getRetryAfterInSeconds` e tempo por extenso
- [x] 6.2 Demais falhas com `getApiErrorMessage` e mensagem de reserva

## 7. Verificação

- [x] 7.1 `pnpm exec tsc --noEmit` sem erros
- [x] 7.2 `pnpm biome check` sem issues
- [x] 7.3 `pnpm build` sem erros
- [ ] 7.4 Inativar um colaborador e conferir que ele não consegue mais fazer login
- [ ] 7.5 Conferir que o colaborador inativado com sessão aberta continua navegando até o token expirar
- [ ] 7.6 Reativar o mesmo colaborador e conferir que o login volta com a senha antiga
- [ ] 7.7 Passar o mouse no próprio cadastro e conferir o tooltip da trava
- [ ] 7.8 Clicar no próprio cadastro e conferir que o diálogo não abre
- [ ] 7.9 Conferir que os vínculos de sala continuam após inativar e reativar
- [ ] 7.10 Dar duplo clique no confirmar e conferir que só um `PATCH` sai

## 8. Próximos passos (fora desta change)

- [ ] 8.1 Denylist de token na `api-fr`, para inativar derrubar a sessão em curso
- [ ] 8.2 Filtro por situação na listagem de colaboradores, se a lista crescer
