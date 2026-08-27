## Why

As três áreas administrativas — salas, computadores e colaboradores — chegaram a esta leva com tabelas que
tinham nascido em momentos diferentes e não conversavam entre si. Três problemas concretos:

**As linhas estavam apertadas.** `TableCell` usava `p-2`: 16px de calha entre colunas e 8px separando a
primeira coluna da borda. O texto de colunas vizinhas quase encostava.

**A tabela encolhia ao carregar.** O esqueleto de carregamento usava `h-4` (16px) enquanto o texto real
ocupa 20px de altura de linha. Cada linha do placeholder era 4px mais baixa que a definitiva, e com dez
linhas a tabela dava um salto de 40px no instante em que os dados chegavam — o que se lê como defeito de
renderização, e é só o placeholder fora de medida.

**Havia dado chegando e morrendo.** `GET /computers/get-all` já devolvia `appVersion` e
`appVersionReportedAt`, e o tipo do cliente não os declarava. `GET /rooms/get-all` já devolvia
`employeesRooms` e `computers` de cada sala, e a listagem não mostrava nem a equipe nem o parque. Em ambos
os casos a informação trafegava e era descartada na borda.

Somado a isso, cada tabela resolvia identidade à sua maneira: computadores gastava duas colunas com número
e descrição, salas gastava uma com descrição, e nenhuma tinha âncora visual no começo da linha.

## What Changes

- **Respiro nas tabelas** (`components/ui/table.tsx`): célula passa de `p-2` para `px-4 py-3`, cabeçalho de
  `h-10 px-2` para `h-11 px-4`. Alcança as três áreas.
- **Esqueleto na altura certa** (`components/ui/data-table/index.tsx`): `h-4` → `h-5`, para o carregamento
  ter a mesma altura de linha do conteúdo.
- **Célula de identidade** nas três tabelas: ladrilho ou avatar, linha principal e linha secundária
  apagada. Colaborador vira avatar + nome + e-mail; estação vira ladrilho + `ESTAÇÃO-01` + descrição; sala
  vira ladrilho + nome · UF + descrição. Computadores deixa de gastar duas colunas com isso.
- **Avatar com iniciais coloridas** (`utils/index.ts`): cor estável derivada do `id`, de uma paleta de oito.
- **Código MAC em destaque**: ficha monoespaçada, exibida sem transformação.
- **Coluna Desktop**: a versão que a estação informou, ou a ausência dela, ao lado do MAC.
- **Colunas Equipe e Estações** na listagem de salas, com a manutenção sinalizada.
- **Busca alcançando o que a tela destaca**: MAC em computadores; UF e descrição em salas.

## Impact

- Telas: `/admin/rooms`, `/admin/computers` e `/admin/employees`.
- Contrato: nenhuma mudança de rota. `server/computers/get-all.ts` passa a declarar dois campos que a API já
  enviava.
- Componentes compartilhados: `table.tsx` e `data-table/index.tsx` mudam para todas as tabelas do painel.
- Sem migração, sem mudança de permissão.
