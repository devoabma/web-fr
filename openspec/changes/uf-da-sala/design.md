## Context

O contrato foi lido no repositório da `api-fr`, não inferido do que o front consumia:

- **`utils/validations/uf.ts`** — `UFS` com as 27 siglas `as const` e `ufSchema` como
  `z.string().trim().toUpperCase().pipe(z.enum(UFS, 'UF inválida. Use a sigla de 2 letras do estado (ex:
  MA).'))`. Aceita minúscula, normaliza, e recusa qualquer coisa fora da lista com 400.
- **`POST /rooms/create`** — `uf: ufSchema.default('MA')`. O padrão está no Zod, não no banco: o painel que
  ainda não mandasse o campo continuaria cadastrando sala no Maranhão, sem exigir deploy casado.
- **`PATCH /rooms/update/:id`** — `uf: ufSchema.optional()`, **sem** default, e o handler monta
  `...(uf && { uf })`. Um padrão silencioso aqui devolveria toda sala de outro estado para `MA` a cada
  edição de nome.
- **`GET /rooms/get-all`** — `uf: z.string()` na resposta e `uf: true` no `select` do Prisma.
- **Migração `20260825120000_adicionada_uf_na_sala`** — a coluna nasce `NOT NULL DEFAULT 'MA'` para
  preencher as salas existentes, e o `DROP DEFAULT` vem logo em seguida, para todo cadastro novo ter de
  dizer o estado.
- **`http/websocket/handler.ts`** — o registro da estação seleciona `room: { select: { name: true, uf:
  true } }` e devolve a UF ao Desktop, que a grava em disco.

## Goals / Non-Goals

**Goals**

- Tornar o estado da sala uma escolha explícita no cadastro, de lista fechada.
- Permitir corrigir o estado de uma sala já cadastrada.
- Deixar a sigla visível na listagem, único lugar onde dá para flagrar uma sala marcada no estado errado.
- Explicar, na edição, que a troca não vale para as estações já conectadas.

**Non-Goals**

- Conferir a UF contra a localização real da sala.
- Mostrar a UF que cada estação gravou em disco.
- Filtrar ou agrupar a listagem por estado.
- Mexer no envio dos demais campos da edição.

## Decisions

### O campo é `<Select>`, nunca texto livre

É a razão de a coluna existir. O instalador do Desktop pedia a sigla digitada, e o erro de digitação é mudo:
`MT` no lugar de `MA` não recusa nada, não avisa nada — só tira a máquina da publicação de versão do estado
dela. Trocar digitação por escolha em lista fechada elimina a classe inteira de erro que sobra depois da
validação do servidor. O `z.enum(UFS)` no schema do formulário é a rede embaixo disso, para o caso de o
campo chegar vazio por reset ou rascunho antigo.

### A lista carrega o nome do estado por extenso

Quem cadastra a sala conhece o estado; não necessariamente decora a sigla. E as siglas que mais se confundem
entre si — `MA`, `MT`, `MS` — são exatamente as do vizinho geográfico. Mostrar `MA  Maranhão` no item torna
a escolha errada visível no momento de escolher, e não meses depois. `UF_NAMES` é só legenda: o que viaja
para a API é a sigla.

### A lista de UFs é espelhada no front, não pedida à API

Não existe rota que devolva as siglas aceitas, e criar uma seria uma requisição para buscar uma constante que
não muda. O custo do espelho é o de manter dois lugares em sincronia; a divisão política do Brasil não muda
num ritmo que torne isso um risco. O comentário em `constants/ufs.ts` aponta a origem.

### `uf` tipada como união fechada, e não como `string`

A resposta da API declara `z.string()`, mas toda escrita passa pelo enum das 27 siglas e a coluna é
`NOT NULL`. Um valor fora da lista seria defeito de dado, não um formato que o painel deva prever. Tipar
`Uf` faz o valor inicial do formulário de edição e a busca em `UF_NAMES` saírem corretos sem coerção nem
fallback. O preço é que uma UF nova exigiria mudar o front — o mesmo preço que a `api-fr` já paga.

### Na edição, `uf` só vai no corpo quando muda

É o único campo do formulário em que "ausente" tem significado: no `PATCH` a UF não tem padrão, e não mandar
é o que diz "mantém". Reenviar a mesma sigla a cada edição de nome seria escrita à toa numa coluna que o
Desktop lê. A comparação é contra `room.uf`, não contra `dirtyFields` — o valor é o que importa, e a
comparação direta não depende de como o `Controller` marca o campo como tocado.

Os demais campos continuam indo sempre, como `edicao-de-salas` decidiu. Misturar os dois regimes no mesmo
formulário é feio, mas a alternativa — mudar o envio de nome, tempo e descrição de carona nesta change —
seria mexer no que não está em questão.

### O aviso da troca fala de tempo, não de risco

A tentação é um alerta vermelho. Mas trocar a UF é uma operação legítima e provavelmente uma correção. O que
o usuário não tem como adivinhar é **quando** a mudança chega: o Desktop só descobre a UF nova no próximo
registro do canal WebSocket. Sem isso, a mudança pareceria já valer para as máquinas ligadas naquele momento.
Daí o texto ser uma `FieldDescription` sobre prazo — "na próxima vez que conectarem" — no mesmo padrão do
aviso de troca de sala em `edicao-de-computadores`, e não um bloco de advertência.

### A UF acompanha o nome na listagem, em vez de virar coluna própria

Uma coluna a mais numa tabela que já tem seis empurraria a descrição para fora da vista em telas estreitas
para carregar dois caracteres. Colada ao nome — `SALA GTI · MA` — a sigla é lida no mesmo movimento em que se
lê a sala, que é como o erro se percebe: "essa sala não é de lá".

## Risks / Trade-offs

- **O painel impede a sigla inexistente, não a sigla errada.** Uma sala do Maranhão marcada como `MT` é
  cadastro válido para a API e para a tela. A sigla visível na listagem é a única defesa.
- **A ordem de deploy é uma dependência real.** Painel novo contra API antiga degrada a listagem e trava a
  edição de sala.
- **A lista de UFs duplicada pode divergir da `api-fr`.** O sintoma seria uma sigla oferecida e recusada com
  400, ou uma sigla aceita pela API e ausente do seletor.
- **A UF gravada no disco de cada estação continua invisível ao painel.** Corrigir o cadastro não conta o que
  já chegou às máquinas.
- **A busca não alcança a sigla.** Auditar por estado hoje é rolar a lista.
- **Regime de envio misto na edição.** `uf` condicional, os outros três sempre.

## Open Questions

- A listagem deveria ganhar um filtro por estado, agora que a sigla existe?
- O painel deveria mostrar a UF que cada estação reportou no registro do canal, para comparar com o cadastro?
- Cadastrar uma sala num estado onde não há nenhuma outra deveria pedir confirmação?
- Trocar a UF de uma sala com máquinas em uso deveria deixar rastro de quem alterou?
