## Why

A logo da OAB-MA estava **codificada no produto**: `logo-oabma.png` referenciado pelo nome no cabeçalho
público e no painel de marca do login, com `alt="OAB Maranhão"` e largura em `w-40`.

O Sala Livre não é um sistema da OAB-MA — é um produto que a OAB-MA usa. A próxima seccional que o
adotar teria de trocar o arquivo, o `alt`, e provavelmente a largura, porque a logo dela não tem a
mesma proporção. Três edições em dois arquivos para uma troca que deveria ser de um arquivo só.

## What Changes

- **`logo-oabma.png` → `logo-cliente.png`**: o arquivo passa a ser identificado pelo papel que cumpre,
  não pela instituição atual. Trocar de cliente é substituir esse arquivo.
- **`alt="Logo da instituição"`** nos dois lugares, em vez do nome da seccional.
- **A altura passa a ser o que está fixo**, não a largura (`h-9 w-auto` no cabeçalho, `h-8 w-auto` no
  login). Assim qualquer proporção de logo entra sem esticar o cabeçalho nem estourar o painel.
- **Comentário nos dois arquivos** apontando que ali é o espaço de marca branca.
- **Cabeçalho público endurecido contra nome longo**: `min-w-0` no bloco de texto, `truncate` no
  subtítulo e `shrink-0` nas imagens — sem isso, uma logo mais larga espremeria a marca do produto.
- **`sheet.tsx`**: deslocamentos de animação em valores arbitrários (`translate-x-[-2.5rem]`) trocados
  pelas utilidades nomeadas equivalentes (`-translate-x-10`). Normalização de Tailwind, sem efeito
  visual.

## Capabilities

### Added Capabilities
- `marca-branca-do-cliente`: o espaço de logo da instituição que usa o produto, trocável por
  substituição de um único arquivo.

## Impact

- Novo: `public/assets/logo-cliente.png`.
- Removido: `public/assets/logo-oabma.png`.
- Alterado: `src/components/app/header.tsx`, `src/app/(public)/auth/layout.tsx`,
  `src/components/ui/sheet.tsx`.
- **O `brightness-0 invert` do login continua**, e depende do PNG ter fundo transparente. Uma logo
  entregue com fundo opaco viraria um retângulo branco sólido sobre o painel escuro — está comentado no
  arquivo, porque é o tipo de coisa que só se descobre depois de trocar.
- **A marca do produto (`/logo.svg`) não mudou.** Sala Livre continua sendo o Sala Livre; o que é
  variável é a instituição ao lado.
- **A troca ainda não é por configuração.** É por substituição de arquivo — suficiente para o número de
  clientes atual, insuficiente no dia em que o mesmo deploy servir mais de uma seccional.
