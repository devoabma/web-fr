## 1. Esqueleto de carregamento (concluída)

- [x] 1.1 Traço em `h-3` dentro de caixa com a altura da linha de texto
- [x] 1.2 `skeletonAnchorClassName` no `meta` das colunas, com o tipo em `data-table-features.ts`
- [x] 1.3 Esqueleto composto na coluna-âncora: ladrilho + duas barras
- [x] 1.4 `skeletonRows` com padrão de quatro linhas, desligado de `pageSize`
- [x] 1.5 Ajustar os `meta` das três tabelas: tirar as alturas fixas, manter só largura e formato
- [x] 1.6 Marcar a âncora de cada tabela — círculo em colaboradores, ladrilho em salas e computadores

## 2. Buscas (concluída)

- [x] 2.1 Busca de salas por nome ou descrição; UF fora
- [x] 2.2 Guarda de busca vazia na listagem de salas
- [x] 2.3 Busca de computadores por sala ou descrição; MAC fora
- [x] 2.4 Atualizar os textos de apoio dos dois campos

## 3. Verificação

- [x] 3.1 `pnpm exec tsc --noEmit` sem erros
- [x] 3.2 `pnpm biome check` sem issues
- [x] 3.3 `pnpm build` sem erros
- [ ] 3.4 Abrir as três tabelas com a rede limitada e conferir o esqueleto: discreto, sem salto de altura
- [ ] 3.5 Conferir que a coluna-âncora do esqueleto tem a mesma altura da linha real nas três
- [ ] 3.6 Buscar por "MA" em salas e conferir que só o que tem "ma" no nome ou na descrição aparece
- [ ] 3.7 Buscar por parte de um MAC em computadores e conferir que a busca não retorna a estação
