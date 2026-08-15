## Context

O `not-found.tsx` na raiz do `app/` atende tanto os endereços que não casam com nenhuma rota quanto as
chamadas explícitas a `notFound()` que virão do painel — "esta sala não existe", "este computador foi
removido". Ele é, na prática, a primeira tela de erro do produto, e vai continuar em uso quando o painel
existir. Vale construí-la com os componentes reais, não como página descartável.

O design saiu do projeto Claude Design "Sala Livre" (`c3a63c9a-47ad-47c7-8349-2d496f96c4f4`, arquivo
`Sala Livre - 404`), entregue como HTML com estilos inline e cores em hex.

## Goals / Non-Goals

**Goals:**
- 404 na identidade do produto, com pelo menos um caminho de volta que sempre funcione.
- Server Component: só o retorno pelo histórico precisa de JavaScript de cliente.
- Reaproveitar cabeçalho, rodapé e primitivas existentes em vez de recriar marcação.

**Non-Goals:**
- `error.tsx` (erros de runtime) e `loading.tsx` — outra change.
- 404 específicos por área do painel (`app/(private)/.../not-found.tsx`).
- Busca ou sugestões dinâmicas dentro da página.

## Decisions

### Tokens de tema no lugar dos hex do design

O HTML de origem usa `#16213e`, `#c0392b` e `#f6f7fb` inline. Traduzidos para `text-primary`, `rose-700`,
`bg-card`, `border` e `bg-background`. A página acompanha o tema — inclusive `.dark` — em vez de ficar
presa ao claro.

### Emblema montado com o `BrandMark`, não uma ilustração nova

O "404" fica sobreposto ao símbolo da marca esmaecido (`text-primary/15`, acento em `rose-700/30`). Não há
asset novo para manter, e se o símbolo mudar a página acompanha.

### Botão de voltar isolado em Client Component

`router.back()` exige `'use client'`. Marcar a página inteira como cliente custaria o pré-render estático e
impediria qualquer `metadata` futura. O `BackButton` isola as ~20 linhas que precisam de interatividade.

### Fallback quando não há histórico

`router.back()` **não faz nada** quando a aba foi aberta direto na URL — caso comum em 404: link de e-mail,
endereço digitado, resultado de busca. Exatamente quem mais precisa do botão é quem não tem histórico. O
`BackButton` verifica `window.history.length` e, sem histórico, navega para o destino alternativo (`/` por
padrão).

### Cabeçalho do projeto no lugar do nav do design

O design traz um nav próprio com botão "Acessar painel". Usamos o `Header` real (marca + logo da OAB-MA):
a ação já existe como chamada principal no corpo da página, e duplicar a marcação faria a 404 divergir da
landing na primeira alteração de cabeçalho.

### Rodapé no fim da viewport só no mobile

`min-h-svh` no `<body>` garante altura, não distribuição: com pouco conteúdo o rodapé parava no meio da
tela no celular. A correção é um wrapper `flex min-h-svh flex-col` com `flex-1` no `<main>`.

O detalhe que obriga a limitar isso ao mobile: `Header` e `Footer` usam `mx-auto max-w-310`, e **margem
horizontal `auto` cancela o `align-items: stretch`** de um item flex — os dois deixariam de ocupar a
largura total e encolheriam para o tamanho do conteúdo, colando as marcas no centro. Por isso o wrapper
volta a ser `block` a partir de `sm`, preservando o layout de desktop.

## Risks / Trade-offs

- **Sem `metadata` própria**: o Next só honra `metadata` em `layout` e `page`, então a aba mostra o título
  padrão "Sala Livre" em vez de "Página não encontrada".
- **Rodapé com links quebrados**: reaproveitar o `Footer` traz `/privacidade`, `/suporte` e `/status`, que
  ainda dão 404 — a página pode levar de volta a si mesma.
- **Destino do botão principal**: "Voltar ao painel" leva a `/auth/sign-in` porque o painel ainda não
  existe; quando existir, o destino deve passar a depender da sessão.
- **`window.history.length` é aproximação**: conta o histórico da aba, não a origem das entradas. Uma aba
  com navegação prévia em outro site retorna `> 1` e o botão sai do produto.

## Migration Plan

Não há migração: `src/app/not-found.tsx` estava vazio e o Next usava a página padrão.

## Open Questions

- "Voltar ao painel" deve apontar para `/` (landing) em vez de `/auth/sign-in`?
- A 404 deve oferecer atalhos para áreas do painel — como os três cards do design original — quando as
  rotas existirem?
