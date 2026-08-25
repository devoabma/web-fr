## Why

A `api-fr` passou a saber em que estado cada sala fica: `rooms.uf` é `CHAR(2) NOT NULL`, validada contra as
27 siglas do Brasil no `POST /rooms/create` e no `PATCH /rooms/update/:id`, e devolvida em `GET
/rooms/get-all`. Não é campo de relatório — é a UF que o Desktop recebe no registro do canal WebSocket e
grava em disco, e é ela que decide se a máquina entra numa publicação de versão dirigida a um estado.

Antes dessa coluna, a sigla era digitada à mão pelo instalador do Desktop, máquina por máquina. O painel
precisa assumir esse campo pelo motivo que ele existe: acabar com a digitação livre. Uma sigla errada não dá
erro em lugar nenhum — a estação simplesmente deixa de casar com a onda dirigida ao estado dela, calada, e
ninguém percebe até alguém reparar que uma sala inteira parou numa versão antiga.

## What Changes

- **`constants/ufs.ts`** (novo): `UFS` com as 27 siglas — espelho da lista fechada da `api-fr` —, o tipo
  `Uf`, `DEFAULT_UF` (`'MA'`) e `UF_NAMES` com o nome de cada estado por extenso.
- **`server/rooms/get-all.ts`**: `uf` entra em `RoomProps`, tipada como a união fechada `Uf` e não como
  `string`.
- **`server/rooms/create.ts`**: `uf` opcional no corpo. A API assume `'MA'` quando o campo não vem; o painel
  manda sempre, porque o estado deve ser escolha e não herança silenciosa.
- **`server/rooms/update.ts`**: `uf` opcional, documentando que ausente significa "mantém" e que `''` ou
  `null` voltam 400 do enum.
- **Cadastro e edição de sala**: `<Select>` das 27 siglas com o nome do estado como legenda, obrigatório na
  UI. O cadastro abre em `MA`; a edição abre na UF atual da sala. **Sem campo de texto livre.**
- **Na edição, `uf` só entra no corpo quando muda.** No `PATCH` a UF não tem padrão, e campo ausente é o que
  diz "não mexe".
- **Aviso ao trocar a UF na edição**: a mudança só chega às estações no próximo registro do canal, não é
  instantânea.
- **Listagem**: a UF passa a acompanhar o nome na coluna Nome — `SALA GTI · MA`.

## Capabilities

### Modified Capabilities
- `cadastro-de-salas`: o cadastro passa a incluir o estado da sala, escolhido de lista fechada.
- `edicao-de-salas`: a edição passa a permitir corrigir o estado, com aviso do efeito diferido.
- `listagem-de-salas`: a lista passa a apresentar o estado junto do nome.

## Impact

- Novo: `src/constants/ufs.ts`.
- Alterado: `src/server/rooms/{get-all,create,update}.ts`,
  `src/app/(private)/admin/rooms/_components/{new-room,new-room-schema,update-room,update-room-schema,rooms-columns}.tsx`.
- **A ordem de deploy importa.** A `api-fr` com a migração precisa subir **antes** do painel. Com a API
  antiga, `uf` no `POST` é descartado em silêncio pelo strip do Zod, mas o `get-all` volta sem o campo: a
  listagem apresenta o separador sem sigla e a edição abre com o seletor vazio, travando no envio. Degrada,
  não quebra — mas é uma janela de confusão evitável.
- **`uf` foi tipada como união fechada, não como `string`.** Toda escrita passa pelo enum das 27 siglas no
  servidor e a coluna é `NOT NULL`; qualquer outro valor seria defeito de dado, não um formato a prever. O
  ganho concreto é o valor inicial do formulário de edição e a legenda do estado saírem corretos sem
  coerção nem fallback.
- **A edição continua enviando `name`, `standardTime` e `description` sempre.** Só a `uf` é condicional,
  porque só nela "ausente" tem significado. A decisão de `edicao-de-salas` sobre reenviar campo inalterado
  permanece de pé para os demais.
- **A busca da listagem continua filtrando só por nome.** Incluir a sigla no mesmo campo daria falso
  positivo fácil — `MA` casa com "SALA MANHÃ". Auditar por estado pede filtro próprio, não o campo de texto.
- **O painel não confere a UF contra nada.** Ele impede a sigla inexistente, não a sigla errada: uma sala do
  Maranhão marcada como `MT` é um cadastro válido para a API e para a tela. A única defesa contra isso é a
  sigla ficar visível na listagem.
- **Nenhuma tela do painel mostra a UF que o Desktop de fato gravou em disco.** A conferência possível é do
  cadastro, não do que chegou à máquina.
