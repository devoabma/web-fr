## Why

Duas queixas de uso das tabelas administrativas, ambas de excesso.

**O esqueleto de carregamento era grande demais.** `anatomia-das-tabelas-administrativas` acertou que ele
precisa ter a altura da linha real — esqueleto mais baixo faz a tabela encolher quando os dados chegam, e o
salto se lê como defeito. Mas resolveu isso engordando o traço até a altura inteira do texto e repetindo a
linha dez vezes, uma para cada registro da página. O resultado é uma tela cinza que compete com o conteúdo
que ela deveria apenas anunciar.

**As buscas achavam demais.** A de salas incluía a UF: duas letras que casam com metade da tabela — "MA"
encontra "SALA DE REUNIÃO" —, então digitar o estado *escondia* o resultado procurado em vez de estreitá-lo.
A de computadores incluía o código MAC, que ninguém digita de cabeça: ele está na tela para ser conferido
caractere a caractere contra a configuração do Desktop, não para ser procurado.

## What Changes

- **O traço do esqueleto encolhe** de `h-5` (a altura da linha de texto) para `h-3`, dentro de uma caixa que
  continua com a altura da linha. Quem sustenta a altura passa a ser a caixa, não o traço.
- **A célula-âncora ganha desenho próprio.** As três tabelas começam com ladrilho de 32px e duas linhas de
  texto; é ela que define a altura da linha. O esqueleto reproduz esse arranjo — círculo ou ladrilho mais
  duas barras — em vez de um bloco maciço.
- **Quatro linhas de esqueleto em vez de dez.** O padrão era a página inteira (`skeletonRows = pageSize`). O
  esqueleto anuncia a espera; não precisa simular a lista.
- **Nova chave `skeletonAnchorClassName`** no `meta` das colunas, preenchida só na coluna-âncora.
- **Busca de salas por nome ou descrição**, sem a UF.
- **Busca de computadores por sala ou descrição**, sem o código MAC — o que devolve a busca ao que
  `cadastro-de-computadores` especificou antes de a anatomia acrescentar o MAC.
- **Guarda de busca vazia na listagem de salas**, que as outras duas já tinham.

## Capabilities

### Modified Capabilities
- `anatomia-das-tabelas-administrativas`: o esqueleto de carregamento passa a ser discreto sem deixar de
  sustentar a altura da linha; o código MAC deixa de ser critério de busca.
- `listagem-de-salas`: a busca passa a cobrir nome e descrição, e deixa de cobrir a UF.

## Impact

- Alterado: `src/components/ui/data-table/index.tsx`,
  `src/components/ui/data-table/data-table-features.ts`, os três arquivos `*-columns.tsx` da área
  administrativa, `rooms-table.tsx` e `computers-table.tsx`.
- **A altura da linha continua sendo responsabilidade do esqueleto** — a mudança é de peso visual, não de
  geometria. Uma coluna-âncora que deixe de declarar `skeletonAnchorClassName` volta a encolher a linha.
- **Quatro linhas de esqueleto contra dez de conteúdo** significam que a tabela cresce quando os dados
  chegam. É movimento de expansão, não de encolhimento — não deixa o conteúdo pular para cima.
- **Quem procurava estação pelo MAC perdeu esse caminho.** O código continua visível e copiável na tabela;
  quem chega com ele na mão localiza pela sala. Se a prática mostrar que a busca por MAC era usada, ela volta
  como filtro próprio, não misturada à busca de texto.
- **A UF continua ao lado do nome da sala** na listagem — ela saiu da busca, não da tela.
