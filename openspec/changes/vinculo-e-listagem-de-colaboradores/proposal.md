## Why

`cadastro-de-colaboradores` entregou a tela com o formulário e deixou duas pontas soltas, ambas registradas
como pendência dela mesma:

- **A listagem não existia.** `page.tsx` tinha `{/* <EmployeesTable /> */}` comentado. Quem cadastrava um
  colaborador não tinha como conferir o resultado, nem saber quem já existia — a única defesa contra o
  cadastro repetido era a recusa da `api-fr` por CPF ou e-mail duplicado.
- **O vínculo com salas ficou de fora**, e a tarefa 7.5 daquela change registrou o motivo como decisão em
  aberto: `POST /employees/create-account` respondia `{ message }` sem `id`, então não havia como encadear
  `POST /employees/link-with-rooms` logo após criar. Sem o `id`, vincular exigia recarregar a listagem
  inteira e procurar a pessoa pelo CPF.

As duas pontas foram fechadas do lado do servidor, em duas changes da `api-fr` desta mesma leva:

- `atomic-employee-account-creation` → o `201` passou a devolver `employeeId`.
- `list-employee-linked-rooms` → `GET /employees/get-all` passou a devolver `employeesRooms` com as salas de
  cada colaborador.

Esta change consome as duas no painel.

## What Changes

- **Listagem de colaboradores** em `/admin/employees`: `server/employees/get-all.ts`, `employees-table.tsx`
  (busca no cliente por nome ou CPF) e `employees-columns.tsx` (colaborador, CPF, papel, situação, data,
  ações).
- **Vínculo com salas no próprio cadastro**: o formulário ganha `roomIds` (opcional, `[]` por padrão) e um
  combobox de seleção múltipla. Concluído o `201`, o `employeeId` da resposta encadeia
  `POST /employees/link-with-rooms` sem reconsultar nada.
- **`server/employees/link-with-rooms.ts` e `unlink-with-rooms.ts`** para as duas direções do vínculo.
- **Diálogos de cadastro migrados de `Sheet` para `Drawer`** (colaborador, sala e computador), para o
  formulário longo caber em tela pequena e fechar por arrasto.
- **Ações da listagem ficam desenhadas e inertes** nesta etapa — atualizar e gerenciar salas entram em
  change própria, com os diálogos.

## Impact

- Telas: `/admin/employees` passa a listar; `/admin/rooms` e `/admin/computers` só trocam o invólucro do
  cadastro (`Sheet` → `Drawer`), sem mudança de comportamento.
- Contrato: nenhuma mudança de rota. Consome campos que a `api-fr` já devolve.
- `cadastro-de-colaboradores`: o requisito "Papel e vínculo com salas fora do cadastro" é **substituído em
  parte** — o papel continua fora (não há rota que promova a `ADMIN`), o vínculo com salas entra.
- Pendente: os dois diálogos das ações da listagem.
