## Why

`acoes-na-listagem-de-colaboradores` fechou dizendo, com todas as letras, o que ficava de fora: *"a
alternância ativo/inativo do colaborador continua fora. `PATCH /employees/activate/:id` e
`deactivate/:id` existem e estão registradas nas rotas da API; a coluna Situação segue só exibindo."*

Essa era a última lacuna da tela. A coluna **Situação** mostrava "Ativo" ou "Inativo" desde
`vinculo-e-listagem-de-colaboradores`, mas nada na interface produzia esse estado — um colaborador
desligado continuava entrando no painel até alguém mexer no banco.

Salas já tinham o par completo (`activate-room` / `inactive-room`). Colaboradores não. É a mesma
alternância, sobre a mesma coluna, com o mesmo desenho — faltava só ligar.

## What Changes

- **`server/employees/activate.ts` e `server/employees/inactive.ts`**: encapsulam
  `PATCH /employees/activate/:id` e `PATCH /employees/deactivate/:id`, ambas com resposta `{ message }`.
  Os nomes de arquivo espelham `server/rooms/`, que já tinha esse par.
- **`activate-employee.tsx`**: ação direta, sem confirmação. Reativar é construtivo e reversível pelo
  botão que aparece em seguida.
- **`inactive-employee.tsx`**: confirmação em `AlertDialog`, porque inativar tira o acesso de alguém.
- **A tela impede o administrador de inativar a si mesmo.** A API já recusa com `400`; a interface
  neutraliza o botão antes do clique e explica no tooltip por que ele está fora do ar.
- **O botão neutralizado usa `aria-disabled`, não `disabled`.** Botão `disabled` não dispara hover, e o
  tooltip é justamente o que explica o bloqueio — o mesmo padrão de `delete-computer.tsx`.
- **A confirmação diz o que realmente acontece com a sessão aberta.** O `inactive` é verificado no
  `authenticate`, não no middleware de autenticação: quem já está logado continua navegando até o token
  expirar. O diálogo diz "o bloqueio vale a partir do próximo acesso" em vez de prometer desconexão.
- **`employees-columns.tsx`**: a coluna de ações passa a escolher entre os dois componentes por
  `employee.inactive`, como já fazia `rooms-columns.tsx`.

## Capabilities

### Added Capabilities
- `alternancia-ativo-inativo-do-colaborador`: desligar e religar o acesso de um colaborador ao painel,
  a partir da própria listagem, sem apagar cadastro, vínculos ou histórico.

## Impact

- Novo: `src/server/employees/activate.ts`, `src/server/employees/inactive.ts`,
  `src/app/(private)/admin/employees/_components/activate-employee.tsx`,
  `src/app/(private)/admin/employees/_components/inactive-employee.tsx`.
- Alterado: `src/app/(private)/admin/employees/_components/employees-columns.tsx`.
- **Inativar não encerra sessão em curso.** A `api-fr` só barra o *login* de quem está inativo. Um JWT
  já emitido continua aceito até expirar (1 dia) — a mesma lacuna que o roadmap já registra para o
  logout e para a troca de senha, e que só uma denylist de token na API resolve.
- **A trava de auto-inativação existe nos dois lados**, ao contrário do auto-rebaixamento de papel, que
  é só da interface. Aqui a API também recusa, então outro cliente não consegue burlar.
- **Editar um colaborador inativo continua possível**, pelo contrato e pela tela — corrigir o cadastro
  de quem volta depois é justamente o caso de uso.
- **O soft delete do colaborador não tem contrapartida de exclusão.** Não há `DELETE /employees/:id` na
  `api-fr`, e inativar é o que existe no lugar — diferente de computadores, que apagam de verdade.
