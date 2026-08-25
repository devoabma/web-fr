## Context

`cadastro-de-computadores` entregou cadastro, listagem e exclusão, e fechou afirmando que a `api-fr` não
expunha edição. A afirmação era falsa: `PATCH /computers/update/:id` existe, é `ADMIN`-only
(`checkIfEmployeeIsAdmin`) e aceita corpo parcial com `macCode`, `number`, `description` e `roomId`, todos
opcionais. A resposta é `{ message }`.

O que a rota faz, lido do código:

- **`macCode`** — passa por `formattedCodeMac`, que insere hífens quando recebe 12 caracteres corridos e
  deixa como está quando já vêm separados; exige 17 caracteres no resultado. Unicidade **global**, com
  `id: { not: id }`.
- **`number`** e **`description`** — unicidade dentro da **sala efetiva**: a nova quando `roomId` vem no
  corpo, a atual quando não vem. `description` é comparada e gravada em maiúsculas.
- **`roomId`** — só verifica que a sala existe. **Não** verifica se ela está ativa.
- Não há verificação de `inUse`, ao contrário de `DELETE /computers/delete/:id`.

Esta change encapsula essa rota e liga o botão de editar na listagem.

## Goals / Non-Goals

**Goals**

- Corrigir o cadastro de uma máquina sem excluir e recadastrar — em especial o `macCode`, cujo erro deixa a
  estação permanentemente inoperante.
- Preservar o histórico de sessões e impressões, que a exclusão apagaria.
- Repetir na edição as defesas que o cadastro já tem: números em uso à vista, máscara de MAC, sala ativa.
- Deixar visível o que a API não protege — sala inativa e máquina em uso.

**Non-Goals**

- Verificar se o MAC informado corresponde a uma máquina real.
- Alternar manutenção por esta tela; quem faz isso é a grade do painel.
- Enviar só os campos alterados.
- Reabrir a decisão sobre exclusão em cascata.

## Decisions

### A sala atual entra no seletor mesmo inativa

O cadastro filtra por `inactive === null` porque criar inventário em sala morta não faz sentido. Na edição a
regra não pode ser a mesma: se a máquina **já está** numa sala que foi desativada, filtrar a lista deixaria o
seletor sem valor correspondente — o campo abriria vazio, o `isDirty` marcaria mudança que ninguém fez, e o
usuário veria um formulário aparentemente corrompido antes de tocar em nada.

A saída é incluir a sala atual quando ela estiver inativa, marcada como tal no item, e manter todas as outras
opções restritas às ativas. Quem está numa sala morta pode sair; ninguém novo entra.

### Os números em uso não incluem os da própria máquina

A API compara `number` com `id: { not: id }` — o número atual da máquina não colide consigo mesmo. Repetir a
lista do cadastro sem filtrar mostraria o próprio número como ocupado e mandaria trocá-lo à toa.

### Máquina em uso é avisada, não bloqueada

`DELETE` recusa máquina em uso; `PATCH` não. Bloquear a edição inteira seria mais restritivo que o contrato
sem ganho: corrigir uma descrição com a máquina ocupada é inofensivo.

O que merece aviso é o efeito colateral de trocar MAC ou sala com sessão aberta. O Desktop está registrado no
WebSocket com o endereço antigo; mudado o cadastro, a estação some da lista de conectadas e a grade a marca
como offline até o programa reconectar com o endereço novo. Quando o MAC estava errado, é exatamente o
efeito desejado. Quando estava certo, é uma máquina tirada da grade sem querer. Só quem está operando sabe
qual dos dois casos é o seu — daí o aviso no lugar do bloqueio.

### O formulário envia os quatro campos sempre

Mesma decisão de `edicao-de-salas`. A API exclui o próprio registro de todas as comparações de unicidade,
então reenviar um valor inalterado não dispara recusa. O `isDirty` já barra o envio que não muda nada.
Montar um corpo a partir de `dirtyFields` seria otimização sem ganho e um caminho a mais para errar.

### Reabrir recarrega o formulário da máquina

`reset(computerFormValues)` na abertura, como na edição de sala. Sem isso, um rascunho abandonado — o MAC
meio digitado, a sala trocada e não salva — reapareceria na próxima abertura parecendo o valor gravado.

### O foco volta ao MAC quando a API recusa

É o campo que a API mais recusa (unicidade global, contra as outras duas que são por sala) e o único que não
dá para conferir olhando a máquina — número e descrição estão escritos nela. Mesma escolha do cadastro.

### `disablePointerDismissal`, como na edição de sala

Clique fora não fecha; ESC e Cancelar fecham. Um diálogo com quatro campos preenchidos não pode evaporar
porque o ponteiro escapou. O fechamento também é bloqueado enquanto a requisição está de pé, para o toast de
erro não chegar a uma tela sem os dados para corrigir.

## Risks / Trade-offs

- **A tela barra sala inativa, a API não.** Uma chamada direta move a máquina para uma sala morta e ela some
  do painel. A defesa é de interface.
- **Trocar o MAC de uma máquina em uso desgarra a estação.** Avisado, não impedido — e o aviso depende de o
  usuário lê-lo.
- **O MAC continua sem conferência contra a máquina real.** A edição corrige o cadastro; não descobre o
  endereço certo.
- **Mover de sala não recalcula nada da sessão em andamento.** A cota já gasta continua contada onde foi.
- **Rota administrativa nova sem cobertura de teste automatizado**, como todas as outras do painel.

## Open Questions

- A `api-fr` deveria recusar a edição de máquina em uso, ao menos para `macCode` e `roomId`?
- A `api-fr` deveria recusar sala de destino inativa, como esta interface faz?
- A exclusão deveria virar inativação, agora que a edição cobre a maior parte dos casos que levavam a excluir?
- Vale registrar quem alterou o quê? Hoje nenhuma edição do painel deixa rastro.
