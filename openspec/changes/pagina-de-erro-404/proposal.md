## Why

Todo endereço inválido caía na página 404 padrão do Next — página em inglês, sem marca e sem saída. Isso
não é hipotético neste projeto: o rodapé da landing aponta para `/privacidade`, `/suporte` e `/status`, e a
tela de login aponta para `/auth/forgot-password`. Nenhuma dessas rotas existe ainda. Quem clicar sai da
identidade do produto e não recebe caminho de volta.

## What Changes

- **`src/app/not-found.tsx`**: página 404 na linguagem visual do Sala Livre, derivada do projeto Claude
  Design "Sala Livre" (`c3a63c9a-47ad-47c7-8349-2d496f96c4f4`, arquivo `Sala Livre - 404`).
- **Emblema do 404**: o `BrandMark` esmaecido com o número sobreposto, no lugar de uma ilustração isolada.
- **Duas saídas**: "Voltar ao painel" (navegação por link para `/auth/sign-in`) e "Página anterior"
  (histórico do navegador).
- **`src/components/app/back-button.tsx`**: Client Component isolado para o retorno pelo histórico, com
  destino alternativo quando não há para onde voltar. Mantém a página como Server Component.
- **Cabeçalho e rodapé reaproveitados** da landing, em vez de recriados.
- **Rodapé colado ao fim da viewport no mobile**, sem alterar o comportamento em desktop.

## Capabilities

### New Capabilities
- `paginas-de-erro`: Respostas visuais do painel a rotas inexistentes, mantendo a identidade do produto e
  oferecendo caminho de retorno.

### Modified Capabilities
<!-- Nenhuma capability existente tem requisitos alterados. -->

## Impact

- Código novo: `src/app/not-found.tsx`, `src/components/app/back-button.tsx`.
- Reaproveitado sem alteração: `Header`, `Footer`, `GridOverlay`, `BrandMark`, `Badge`, `Button`.
- A página não exporta `metadata`: o Next só honra esse export em `layout` e `page`, então o título vem do
  padrão do layout raiz.
- A rota `/auth/sign-in` do botão principal existe; os links do rodapé reaproveitado continuam apontando
  para rotas inexistentes — quem cair neles volta para esta mesma página.
