## 1. Integração com a `api-fr` (concluída)

- [x] 1.1 Confirmar no repositório da `api-fr` que `PATCH /employees/update/:id` existe e o que ela aceita
- [x] 1.2 `server/employees/update.ts` com corpo parcial (`name`, `email`, `role`)
- [x] 1.3 Registrar no módulo que o CPF **não** é aceito pela rota
- [x] 1.4 Confirmar o comportamento de `link-with-rooms` (400 em sala já vinculada, 400 em sala inativa) e de
      `unlink-with-rooms` (404 quando nenhum vínculo bate); ambos exigem ao menos um id

## 2. Edição do colaborador (concluída)

- [x] 2.1 `update-employee-schema.tsx` com nome, e-mail e papel
- [x] 2.2 `update-employee.tsx` como painel lateral, no desenho do cadastro
- [x] 2.3 Recarregar o formulário do colaborador a cada abertura
- [x] 2.4 Salvar desabilitado por `isDirty` e durante a chamada
- [x] 2.5 Bloquear o fechamento enquanto a requisição está de pé
- [x] 2.6 Montar o corpo a partir de `dirtyFields`
- [x] 2.7 CPF visível e bloqueado, com a explicação no próprio campo
- [x] 2.8 Travar o papel quando o colaborador editado é o administrador logado, explicando o motivo
- [x] 2.9 Devolver o erro de e-mail duplicado ao campo, com foco, em vez de só no aviso
- [x] 2.10 Invalidar `getProfile()` quando o administrador edita a si mesmo — nome e e-mail dele estão no
      cabeçalho do painel

## 3. Salas do colaborador (concluída)

- [x] 3.1 `manage-employee-rooms.tsx` com o campo de seleção múltipla do cadastro
- [x] 3.2 Estado inicial a partir de `employeesRooms` do próprio colaborador
- [x] 3.3 Recomeçar da listagem a cada abertura, para não herdar seleção abandonada
- [x] 3.4 Calcular `roomIdsToLink` e `roomIdsToUnlink` contra os vínculos atuais
- [x] 3.5 Chamar `link` antes de `unlink`
- [x] 3.6 Tratar o sucesso parcial (link ok, unlink falhou) com aviso e invalidação
- [x] 3.7 Manter as salas inativas já vinculadas na lista, identificadas como inativas
- [x] 3.8 Nome das salas vindo da listagem enquanto o catálogo carrega
- [x] 3.9 Salvar desabilitado sem mudança — as duas rotas exigem ao menos um id
- [x] 3.10 Resumo do que vai acontecer ("2 salas a vincular · 1 a desvincular") antes de salvar

## 4. Listagem (concluída)

- [x] 4.1 `<UpdateEmployee />` e `<ManageEmployeeRooms />` na coluna de ações, no lugar dos botões desabilitados
- [x] 4.2 Invalidar `getEmployees()` e `getRooms()` — o vínculo aparece nas duas telas

## 5. Verificação

- [x] 5.1 `pnpm exec tsc --noEmit` sem erros
- [x] 5.2 `pnpm biome check` sem issues
- [x] 5.3 `pnpm build` — `/admin/employees` continua registrada como rota dinâmica
- [ ] 5.4 Editar o nome de um colaborador com um `ADMIN` real e conferir a tabela
- [ ] 5.5 Repetir o e-mail de outro colaborador e conferir a mensagem da API no campo, com foco
- [ ] 5.6 Editar a si mesmo e conferir que o papel está travado, com a explicação
- [ ] 5.7 Editar a si mesmo e conferir que o cabeçalho do painel acompanha o nome novo
- [ ] 5.8 Vincular salas a quem não tinha nenhuma e conferir a listagem
- [ ] 5.9 Desmarcar todas as salas e conferir que o salvamento usa só o `unlink`
- [ ] 5.10 Marcar e desmarcar na mesma passagem e conferir que as duas chamadas acontecem na ordem certa
- [ ] 5.11 Desativar uma sala vinculada em `/admin/rooms`, abrir o painel de salas do colaborador e conferir
      que ela aparece marcada como inativa e pode ser desmarcada
- [ ] 5.12 Conferir que Salvar só habilita depois de alguma mudança
- [ ] 5.13 Abrir, mexer, fechar e reabrir: a seleção volta ao que está gravado
- [ ] 5.14 Conferir os dois painéis abaixo de 768px

## 6. Próximos passos (fora desta change)

- [ ] 6.1 Ligar `PATCH /employees/activate/:id` e `deactivate/:id` na coluna Situação
- [ ] 6.2 Avaliar uma rota de sincronização de salas na `api-fr`, que tornaria o ajuste atômico
- [ ] 6.3 Decidir se a `api-fr` deve recusar o auto-rebaixamento de papel
- [ ] 6.4 Decidir se o CPF ganha caminho de correção
