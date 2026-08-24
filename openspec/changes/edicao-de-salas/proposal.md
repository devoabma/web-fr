## Why

A change `listagem-de-salas` fechou com uma dívida registrada em três lugares — no `proposal.md`, no
`design.md` e no item 6.1 das tarefas: **o botão de editar existia na linha e não fazia nada**. Era um
gatilho visível, com tooltip, que não respondia ao clique. Esta change é o que fecha esse item.

Sem edição, corrigir um nome digitado errado ou ajustar o tempo padrão de uma sala exigia inativar a sala e
cadastrar outra — que é o mais próximo de uma exclusão que a `api-fr` oferece, e deixa a sala antiga na
lista para sempre. O tempo padrão, em particular, é a cota diária de cada advogado naquela sala: errar 180
por 18 no cadastro não tinha conserto pela interface.

A rota já existia do lado do servidor (`PATCH /rooms/update/:id`, `ADMIN`-only) e nunca tinha sido
encapsulada no painel.

## What Changes

- **`server/rooms/update.ts`**: encapsula `PATCH /rooms/update/:id`. Corpo **parcial** — os três campos são
  opcionais na API — e `description` tipada como `string | null`, porque a rota distingue três estados:
  omitir mantém, `null` limpa, `''` grava uma descrição em branco.
- **`update-room-schema.tsx`**: as mesmas regras do cadastro (nome de 3 a 60, tempo de 15 a 480 minutos
  inteiros, descrição até 200), mas com os valores iniciais entrando por parâmetro — na edição o estado
  inicial é a sala, e é dele que sai o `isDirty`.
- **`update-room.tsx`**: diálogo de edição com nome, tempo padrão e descrição, prévia do identificador e
  leitura do tempo em horas, no mesmo arranjo do cadastro.
- **Clique fora não fecha o diálogo** (`disablePointerDismissal` do Base UI). ESC e Cancelar continuam
  fechando.
- **O formulário é recarregado da sala a cada abertura**, para um rascunho abandonado não reaparecer como se
  fosse o valor salvo.
- **Salvar fica indisponível enquanto nada mudou** (`isDirty`) e durante a chamada (`isPending`).
- **`rooms-columns.tsx`**: o botão morto de editar dá lugar a `<UpdateRoom room={room} />`, que traz o
  próprio gatilho e tooltip.

## Capabilities

### Added Capabilities
- `edicao-de-salas`: corrigir nome, tempo padrão e descrição de uma sala já cadastrada, a partir da própria
  listagem, sem inativar e recadastrar.

## Impact

- Novo: `src/server/rooms/update.ts`,
  `src/app/(private)/admin/rooms/_components/update-room.tsx`,
  `src/app/(private)/admin/rooms/_components/update-room-schema.tsx`.
- Alterado: `src/app/(private)/admin/rooms/_components/rooms-columns.tsx`.
- **O nome aparece em caixa alta no formulário.** A `api-fr` grava `name.toUpperCase()` tanto no cadastro
  quanto na edição; o campo mostra o que está no banco. Normalizar a exibição é decisão da camada de
  apresentação, não do formulário, que precisa mostrar o valor real.
- **O identificador não é editável.** O slug é derivado do nome pela API e só é recalculado quando o nome
  muda de fato. A prévia na tela continua sendo espelho, não campo.
- **Renomear pode ser recusado.** Se o slug do nome novo colidir com outra sala, a API responde `400` com
  "Sala com esse nome já cadastrada." — a mesma mensagem do cadastro.
- **O formulário envia os três campos sempre**, mesmo os que não mudaram. A rota aceita sem efeito colateral
  (nome igual não recalcula slug) e o `isDirty` já barra o envio que não muda nada. Enviar só os campos
  sujos seria otimização sem ganho.
- **Vincular funcionários e computadores continua fora.** A edição alcança os três campos da sala; o
  vínculo tem rotas próprias e nenhuma interface ainda.
