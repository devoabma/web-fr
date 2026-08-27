## Why

`vinculo-e-listagem-de-colaboradores` entregou a tabela de colaboradores com a coluna de ações **só
desenhada**: dois botões `aria-disabled` cujo tooltip dizia "em breve". A tela listava, mas não deixava
mexer em nada — a única forma de corrigir um nome digitado errado era pelo banco.

As duas rotas que faltavam nunca faltaram. `PATCH /employees/update/:id` existe, é `ADMIN`-only e aceita
corpo parcial; `POST /employees/link-with-rooms` e `POST /employees/unlink-with-rooms` idem. Esta change
liga as três e transforma os dois placeholders em ações de verdade.

O vínculo com salas era o mais urgente dos dois. Ele só existia dentro do cadastro: quem passasse do
formulário sem marcar sala nenhuma — ou precisasse tirar uma sala depois — ficava sem caminho. E o vínculo
não é decorativo: o colaborador só libera estações das salas ligadas a ele.

## What Changes

- **`server/employees/update.ts`**: encapsula `PATCH /employees/update/:id`. Corpo parcial — `name`, `email`
  e `role` são todos opcionais na API —, resposta `{ message }`. **O CPF fica de fora porque a rota não o
  aceita.**
- **`update-employee-schema.tsx` + `update-employee.tsx`**: painel de edição com nome, e-mail e papel, no
  mesmo desenho do cadastro de colaborador — painel lateral flutuante, e não diálogo, para a tela inteira
  falar a mesma língua.
- **Só o que mudou viaja.** O envio monta o corpo a partir de `dirtyFields`; reenviar o e-mail intocado
  pediria à API que revalidasse unicidade de um dado que ninguém tocou.
- **O CPF aparece bloqueado, com explicação.** Escondê-lo faria parecer esquecimento; mostrá-lo travado
  responde a pergunta antes de ela ser feita.
- **O administrador não altera o próprio papel.** A API permite; quem impede é a tela. Rebaixar a si mesmo
  tira o acesso à área administrativa na hora — inclusive a este painel, o único lugar de onde daria para
  desfazer.
- **`manage-employee-rooms.tsx`**: painel de vínculos com o mesmo campo de seleção múltipla do cadastro.
  Marcar vincula, desmarcar desvincula, um botão salva.
- **O painel envia o delta, não a seleção.** `link-with-rooms` responde 400 quando o corpo traz uma sala já
  vinculada, então reenviar tudo derrubaria o salvamento a cada edição. As marcadas vão num `link`, as
  desmarcadas num `unlink`.
- **Vincular antes de desvincular.** As duas chamadas não são uma transação. `link` é a que valida e a que
  costuma falhar; se ela cair primeiro, nada foi removido e o colaborador continua como estava.
- **Falha parcial é anunciada como tal.** Se o `link` passou e o `unlink` caiu, o estado no servidor é real
  e incompleto — o painel invalida as listas e avisa o que entrou e o que não saiu.
- **Sala inativa já vinculada continua na lista**, marcada como inativa e desmarcável. Escondê-la faria o
  painel abrir sem um vínculo que existe, e salvar qualquer outra mudança o apagaria sem ninguém ter pedido.
- **`employees-columns.tsx`**: os dois botões desabilitados dão lugar a `<UpdateEmployee />` e
  `<ManageEmployeeRooms />`.

## Capabilities

### Added Capabilities
- `edicao-de-colaboradores`: corrigir nome, e-mail e papel de um colaborador já cadastrado, a partir da
  própria listagem.
- `gestao-de-salas-do-colaborador`: vincular e desvincular salas de um colaborador depois do cadastro, em
  uma única passagem.

## Impact

- Novo: `src/server/employees/update.ts`,
  `src/app/(private)/admin/employees/_components/update-employee.tsx`,
  `src/app/(private)/admin/employees/_components/update-employee-schema.tsx`,
  `src/app/(private)/admin/employees/_components/manage-employee-rooms.tsx`.
- Alterado: `src/app/(private)/admin/employees/_components/employees-columns.tsx`.
- **A `api-fr` não tem rota de sincronizar salas.** Ajustar vínculos custa duas requisições que não
  compartilham transação. A ordem escolhida torna a falha do primeiro passo inofensiva, mas a do segundo
  deixa o estado incompleto — e aí quem conta a verdade é o aviso, não o fechamento silencioso do painel.
- **A `api-fr` não impede o auto-rebaixamento de papel.** A trava é só desta interface; qualquer outro
  cliente da API continua podendo.
- **A rota de edição não valida colaborador inativo.** Editar quem está inativo é possível pelo contrato e
  pela tela — o que faz sentido: corrigir o cadastro de quem voltará depois.
- **O CPF continua sem caminho de correção pela interface.** Um CPF digitado errado ainda exige o banco —
  ou uma rota nova na `api-fr`.
- **A alternância ativo/inativo do colaborador continua fora.** `PATCH /employees/activate/:id` e
  `deactivate/:id` existem e estão registradas nas rotas da API; a coluna Situação segue só exibindo.
