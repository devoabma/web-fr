## Why

A change `cadastro-de-computadores` registrou, em quatro lugares — `proposal.md`, `design.md`, `tasks.md` e
nas lacunas do `DOC.md` —, que **`PATCH /computers/update/:id` não existia na `api-fr`**. Isso estava errado.
A rota existe desde sempre, é `ADMIN`-only e aceita corpo parcial; a afirmação nasceu de olhar só o que o
front já consumia, sem abrir o repositório da API. Esta change encapsula a rota que faltava e desfaz a
lacuna inventada.

O erro tinha consequência prática. Sem edição, corrigir um `macCode` digitado errado significava excluir e
recadastrar — e a exclusão de computador **não é soft delete**: apaga o registro e leva junto, em cascata, o
histórico de sessões e as impressões daquela máquina. Um dígito trocado custava o histórico.

E o MAC errado é o pior caso do cadastro justamente porque não avisa: a máquina aparece na grade do painel,
mas o Desktop entra no WebSocket com o endereço real, que não bate com registro nenhum. A estação nunca
aparece em `GET /computers/online/:roomId`, a grade a marca como offline e o botão Liberar fica
desabilitado. Corrigir o MAC pela interface é o que devolve a máquina à operação.

## What Changes

- **`server/computers/update.ts`**: encapsula `PATCH /computers/update/:id`. Corpo **parcial** — os quatro
  campos são opcionais na API —, resposta `{ message }`.
- **`update-computer-schema.tsx`**: as mesmas regras do cadastro (número inteiro ≥ 1, descrição de 1 a 50,
  MAC pelo schema compartilhado, sala por `cuid2`), com os valores iniciais entrando por parâmetro — na
  edição o estado inicial é a máquina, e é dele que sai o `isDirty`.
- **`update-computer.tsx`**: diálogo de edição com sala, número, descrição e MAC, no mesmo arranjo do
  cadastro e com a mesma máscara de MAC.
- **A sala atual entra no seletor mesmo inativa**, ao contrário do cadastro. A máquina que está numa sala
  desativada abriria o seletor sem valor algum, e a edição pareceria quebrada antes de o usuário tocar em
  nada.
- **Os números em uso excluem a própria máquina.** A API compara com `id: { not: id }`; listar o próprio
  número como ocupado mandaria trocar um número que já é válido.
- **Aviso quando a máquina está em uso.** A rota de edição, ao contrário da de exclusão, **não** recusa
  máquina com sessão aberta — quem explica o efeito colateral é a tela.
- **Clique fora não fecha o diálogo** (`disablePointerDismissal`), como na edição de sala. ESC e Cancelar
  continuam fechando.
- **O formulário é recarregado da máquina a cada abertura**, para um rascunho abandonado não reaparecer como
  se fosse o valor salvo.
- **Salvar fica indisponível enquanto nada mudou** (`isDirty`) e durante a chamada.
- **`computers-columns.tsx`**: `<UpdateComputer />` entra antes de `<DeleteComputer />` na coluna de ações.
- **Correção de documentação**: a lacuna "editar computador não existe" sai do `DOC.md`, do `ROADMAP.md` e
  dos artefatos de `cadastro-de-computadores`.

## Capabilities

### Added Capabilities
- `edicao-de-computadores`: corrigir sala, número, descrição e endereço físico de uma máquina já cadastrada,
  a partir da própria listagem, sem excluir e recadastrar — e sem perder o histórico.

## Impact

- Novo: `src/server/computers/update.ts`,
  `src/app/(private)/admin/computers/_components/update-computer.tsx`,
  `src/app/(private)/admin/computers/_components/update-computer-schema.tsx`.
- Alterado: `src/app/(private)/admin/computers/_components/computers-columns.tsx`.
- **A descrição também é única por sala**, no cadastro e na edição — a `api-fr` recusa com
  "Já existe um computador com essa descrição nesta sala.". `cadastro-de-computadores` documentou só a
  unicidade do número; a tabela de campos do `DOC.md` foi corrigida.
- **A API não checa se a sala de destino está ativa** — só se ela existe. Mover a máquina para uma sala
  inativa é possível pelo contrato; quem barra é esta interface, e apenas nas salas que ela oferece.
- **A API não recusa a edição de máquina em uso.** Trocar o MAC com sessão aberta desgarra a estação até o
  Desktop reconectar com o endereço novo — que é exatamente o que se quer quando o MAC estava errado, e
  exatamente o que não se quer quando estava certo. A tela avisa; não bloqueia.
- **O formulário envia os quatro campos sempre**, mesmo os que não mudaram. A API compara cada unicidade
  excluindo o próprio registro, então reenviar um valor inalterado é inócuo, e o `isDirty` já barra o envio
  que não muda nada.
- **Mover de sala não move a sessão em andamento.** A cota do dia já consumida continua contada onde foi
  gasta; a mudança vale para as próximas liberações.
- **Continua não havendo conferência do MAC contra a máquina real.** A edição corrige o cadastro, não
  descobre o endereço certo — quem informa isso é quem está na frente da máquina.
