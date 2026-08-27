## 1. Integração com a `api-fr` (concluída)

- [x] 1.1 Abrir o repositório da `api-fr` e ler `GET /employees/get-all` antes de tipar o cliente
- [x] 1.2 Registrar que a rota é ADMIN-only, não pagina e não aceita filtro — a busca fica no cliente
- [x] 1.3 Confirmar que o CPF chega **sem máscara**, só os 11 dígitos
- [x] 1.4 Propor e acompanhar a change `list-employee-linked-rooms` na `api-fr` (`employeesRooms` na listagem)
- [x] 1.5 Confirmar que `link-with-rooms` recusa o lote com `400` em vínculo repetido — é o que exige conhecer o estado atual
- [x] 1.6 `server/employees/get-all.ts` com os campos públicos e as salas vinculadas
- [x] 1.7 `server/employees/link-with-rooms.ts` e `server/employees/unlink-with-rooms.ts`

## 2. Vínculo com salas no cadastro (concluída)

- [x] 2.1 `roomIds` no schema do formulário, opcional, `[]` por padrão
- [x] 2.2 Combobox de seleção múltipla das salas ativas
- [x] 2.3 Encadear `link-with-rooms` com o `employeeId` devolvido pelo `201`, sem reconsultar a listagem
- [x] 2.4 Não disparar a segunda requisição quando nenhuma sala foi escolhida

## 3. Listagem (concluída)

- [x] 3.1 `employees-table.tsx` com `useQuery` em `queryKeys.getEmployees()`
- [x] 3.2 Busca no cliente por nome **ou** CPF, tirando a pontuação da busca antes de comparar
- [x] 3.3 `employees-columns.tsx`: colaborador (avatar + nome + e-mail), CPF, papel, situação, data, ações
- [x] 3.4 Descomentar `<EmployeesTable />` em `page.tsx`
- [x] 3.5 Tratar o erro de carregamento com aviso na tela, no padrão de salas e computadores

## 4. Invólucro dos cadastros (concluída)

- [x] 4.1 Migrar o cadastro de colaborador de `Sheet` para `Drawer`
- [x] 4.2 Migrar os cadastros de sala e de computador, para as três áreas não divergirem

## 5. Verificação

- [x] 5.1 `pnpm exec tsc --noEmit` sem erros
- [x] 5.2 `pnpm exec biome check --write` sem issues
- [x] 5.3 `pnpm build` concluindo
- [ ] 5.4 Validar manualmente: cadastrar com e sem salas, conferir a lista e a busca por CPF pontuado

## 6. Próximo passo

- [ ] 6.1 Diálogo de atualização do colaborador (`PATCH /employees/update/:id` — aceita `name`, `email`, `role`)
- [ ] 6.2 Diálogo de gerenciamento de salas, calculando o delta contra `employeesRooms` antes de chamar link/unlink
- [ ] 6.3 Alternar situação do colaborador na listagem (`activate` / `deactivate`)
