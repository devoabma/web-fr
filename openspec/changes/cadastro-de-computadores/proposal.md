## Why

O item 7.5 das tarefas de `cadastro-de-salas` deixou `/admin/computers` registrada como pendência, e a
sidebar já apontava para ela desde `secao-administracao-por-papel` — o link caía na 404. Sala sem computador
é sala vazia: o painel de operação abre a grade sem um único cartão e não há o que liberar.

O computador é o objeto que o Desktop conhece. Ele não pede liberação por número nem por descrição — pede
pelo `macCode`. Um MAC digitado errado não quebra tela nenhuma: a máquina simplesmente nunca aparece no
painel, e o balcão passa a atender uma estação que, para o sistema, não existe. É o campo mais frágil do
cadastro e o que menos avisa quando está errado.

Do lado da `api-fr`, `POST /computers/create` e `DELETE /computers/delete/:id` já existiam, ambos
`ADMIN`-only. Duas regras do servidor moldam esta tela: o `number` é único **por sala** (recusa com `400`
quando repete), e a exclusão **não é soft delete** como a da sala — o registro sai do banco e leva junto, em
cascata, o histórico de sessões e as impressões daquela máquina. A API ainda recusa com `400` a exclusão de
máquina `inUse`, para não derrubar a sessão de um advogado em silêncio.

## What Changes

- **Rota `/admin/computers`** (`(private)/admin/computers/page.tsx`): cabeçalho da área, gatilho de cadastro
  e a listagem — ao contrário de `cadastro-de-salas`, o cadastro já nasce com o resultado visível.
- **Listagem com busca** (`computers-table.tsx` + `computers-columns.tsx`): número apresentado como
  `ESTAÇÃO-01`, descrição, sala vinculada, MAC, situação e data de criação. A busca cobre **sala ou
  descrição** e roda no cliente.
- **Situação em três estados** na coluna de status: manutenção vence `inUse`, porque máquina fora de
  operação não pode aparecer como ocupada.
- **Formulário de novo computador** em painel lateral (`new-computer.tsx` + `new-computer-schema.tsx`):
  sala, número, descrição e MAC.
- **Só salas ativas no seletor**: sala inativa não recebe liberação, e cadastrar máquina nela é criar
  inventário morto.
- **Sugestão do próximo número livre** ao trocar de sala, com a lista dos números já em uso abaixo do campo.
- **Máscara e schema de MAC** (`utils/masks/mac-code.ts`, `utils/schemas/mac-code.ts`): a digitação vira
  `00-1A-2B-3C-4D-5E` enquanto o usuário escreve, e o schema aceita as formas com `:`, `.` e espaço,
  normalizando todas para a mesma antes do envio.
- **Exclusão com confirmação por digitação** (`delete-computer.tsx`): o administrador digita a descrição da
  máquina para liberar o botão. Máquina em uso tem a ação bloqueada, com o motivo no tooltip.
- **`queryKeys.getComputers()`** adicionada, invalidada pelo cadastro, pela exclusão e também pelo painel de
  operação — alternar manutenção pela grade passa a refletir na tela administrativa.
- **Rótulo do gatilho de cadastro de sala** encurtado de "Adicionar Sala" para "Adicionar", igualando as
  duas áreas administrativas.

## Capabilities

### Added Capabilities
- `cadastro-de-computadores`: cadastrar, listar e excluir as máquinas de liberação, identificadas pelo
  endereço físico da placa de rede que o Desktop usa para pedir a liberação.

### Modified Capabilities
- `operacao-das-maquinas`: a manutenção alternada pela grade do painel passa a valer também para a listagem
  administrativa, sem recarga da página.

## Impact

- Novo: `src/app/(private)/admin/computers/page.tsx` e `_components/` (`computers-table.tsx`,
  `computers-columns.tsx`, `new-computer.tsx`, `new-computer-schema.tsx`, `delete-computer.tsx`),
  `src/server/computers/create.ts`, `src/server/computers/delete.ts`, `src/server/computers/get-all.ts`,
  `src/utils/masks/mac-code.ts`, `src/utils/schemas/mac-code.ts`.
- Alterado: `src/constants/query-keys.ts`, `src/app/(private)/panel/_components/releases-board.tsx`,
  `src/app/(private)/admin/rooms/_components/new-room.tsx`.
- **A tela não edita computador.** A `api-fr` não expõe `update` para máquina: corrigir um MAC digitado
  errado é excluir e cadastrar de novo — e a exclusão apaga o histórico junto. O erro de digitação custa
  caro e não tem conserto barato.
- **A exclusão apaga histórico de verdade.** Diferente da sala, não há inativação. A confirmação por
  digitação é o único freio, e ele é de interface: qualquer chamada direta à API passa por cima.
- **A listagem não pagina e não filtra no servidor.** `GET /computers/get-all` aceita `roomId` e
  `description`, mas não filtra por nome de sala nem pagina. Como a busca da tela é por sala *ou*
  descrição, a lista inteira vem num request e o filtro roda no cliente. Com inventário grande, isso pesa.
- **O `number` duplicado só é barrado pela API.** A sugestão do próximo livre e a lista de números em uso
  reduzem a chance, mas duas abas cadastrando na mesma sala ainda colidem — quem recusa é o `400`.
- **A sugestão de número é `maior + 1`, não o primeiro buraco.** Sala com as máquinas 1, 2 e 5 recebe a
  sugestão 6, não 3. É previsível, mas deixa lacunas.
- **O MAC não é verificado contra a máquina real.** Nada na tela sabe se aquele endereço existe. O único
  sinal de MAC errado é a estação nunca aparecer como online no painel.
- **Só o painel de operação alterna manutenção.** A listagem administrativa mostra o estado, mas não o muda.
- O corte por papel já estava resolvido: o `proxy.ts` cobre `/admin/*` e a `api-fr` é `ADMIN`-only nas três
  rotas. Esta change não mexe em autorização.
