## Context

`/admin/rooms` já cadastrava e não mostrava nada. Do lado da `api-fr`, `GET /rooms/get-all` devolve a lista
inteira — sem paginação, sem filtro, sem ordenação — com `employeesRooms` e `computers` embutidos em cada
sala. Ativar e inativar são `PATCH` sem corpo, `ADMIN`-only, e a inativação é o mais próximo de uma exclusão
que existe para sala: nada é apagado, o registro só deixa de aparecer no quadro de liberação.

Esta tela é a primeira de cinco áreas administrativas com a mesma anatomia. A decisão estrutural da change
não é sobre salas: é onde mora a tabela.

## Goals / Non-Goals

**Goals**

- Fechar o ciclo do cadastro: criar e ver o resultado na mesma tela.
- Dar à sala inativa um lugar onde ela ainda apareça e possa voltar.
- Deixar pronta a primitiva de tabela que funcionários, computadores, liberações e impressão vão reusar.

**Non-Goals**

- Editar sala (`PATCH /rooms/update/:id`).
- Paginação, busca ou ordenação no servidor — a API não oferece.
- Seleção de linhas em lote e ações em massa: a feature está ligada na tabela, a interface não a usa.
- Vincular funcionários ou cadastrar computadores a partir desta tela.

## Decisions

### A tabela é primitiva do design system, não da tela de salas

`components/ui/data-table` recebe `columns`, `data`, `isLoading` e `emptyMessage`; a tela só descreve as
colunas. As quatro áreas restantes mudam as colunas e a consulta, não o arranjo. Se a tabela nascesse dentro
de `admin/rooms/_components`, a segunda área a precisar dela copiaria o arquivo — e é copiando que os
rodapés começam a divergir.

O TanStack v9 pede que as features sejam declaradas explicitamente (`tableFeatures({...})`), e o tipo delas
atravessa `ColumnDef` e `ReactTable`. Por isso `data-table-features.ts` existe separado: é o tipo
`DataTableFeatures` que as colunas de cada tela importam, inclusive o `columnMeta` (`className`,
`skeletonClassName`) que a tabela usa para alinhar e para desenhar o esqueleto no formato da coluna.

### Carregamento com esqueleto no formato da tabela, não com um spinner

Enquanto a consulta corre, a tabela desenha as linhas de placeholder com a mesma grade de colunas — cada uma
com a largura declarada em `meta.skeletonClassName`. Um spinner centralizado trocaria a moldura da tela duas
vezes: some, aparece a tabela, os cabeçalhos saltam. O rodapé também tem um ramo próprio de carregamento;
sem ele, anunciaria "Total: 0 registros" para uma tela que ainda não perguntou nada.

### A paginação lê o modelo pré-paginado

`getPrePaginatedRowModel()` é o total que o usuário está navegando — `getRowModel()` já veio fatiado pela
página atual. E `getPageCount()` devolve `0` na lista vazia, o que imprimiria "Página 1 de 0"; o rodapé
força o piso em 1.

### Cada sentido do interruptor é um componente

`activate-room.tsx` e `inactive-room.tsx` não são um componente com um `if` dentro: são rotas diferentes,
mensagens diferentes e — principalmente — **níveis de confirmação diferentes**.

Inativar tira a sala do quadro de liberação e leva junto os computadores dela; o diálogo diz quantos são,
com o plural certo, e afirma que nada é apagado. Reativar não tem consequência a avisar e é desfeito pelo
botão ao lado: pedir confirmação ali seria cerimônia sem conteúdo.

Nos dois casos o botão é desabilitado durante a chamada. Sem isso, o duplo clique dispara dois `PATCH` e o
segundo volta como "Sala já está inativa." — o administrador vê um erro para uma ação que acabou de dar
certo. O diálogo também resiste ao fechamento enquanto a chamada está de pé: fechar esconderia o contexto, e
o aviso de erro chegaria a uma tela sem a sala.

### A busca filtra os dados antes da tabela

O filtro roda em `useMemo` sobre `data.rooms` e a tabela recebe o resultado já filtrado, em vez de usar o
`columnFilteringFeature`. É o mesmo campo de busca das outras telas do painel e mantém a coluna livre de
estado. O `?? []` mora dentro do `useMemo`, e não no JSX: o TanStack memoiza o row model pela **identidade**
de `data`, e um `[]` literal no atributo seria um array novo a cada render — tabela remontada à toa. Trocar
a busca reposiciona a paginação na primeira página sozinho, porque o modelo central observa a identidade de
`data` e dispara `autoResetPageIndex`.

### Status como distintivo, não como cor de linha

Sala inativa recebe um `Badge` destrutivo; ativa, um contorno com o ponto pulsante verde da grade. Pintar a
linha inteira competiria com a leitura das outras colunas e deixaria a tabela listrada de vermelho num
estado que é normal — sala fora de uso não é falha.

## Risks / Trade-offs

- **Botão de editar sem ação.** Está na linha, com tooltip, e não faz nada. Ficou visível de propósito para
  a lacuna não sumir, mas é um clique que não responde até `PATCH /rooms/update/:id` entrar.
- **Tudo no cliente.** Busca, ordenação potencial e paginação operam sobre a lista inteira que a API mandou.
  É o suficiente para a escala real de salas de uma seccional; para funcionários já não será, e a primitiva
  vai precisar de um modo servidor.
- **Cor do interruptor lida como ação.** Verde na sala ativa e vermelho na inativa descrevem o estado atual,
  no espírito de um interruptor; quem lê a cor como consequência do clique entende invertido. A coluna de
  status já diz o mesmo estado com palavra, então a cor é redundância — e redundância ambígua.
- **`date-fns` entrou por uma coluna.** O painel já formatava data com `Intl.DateTimeFormat` em
  `computer-card.tsx`. São duas estratégias para a mesma tarefa no mesmo projeto; se `date-fns` não render
  mais que isso, a dependência sai mais tarde.
