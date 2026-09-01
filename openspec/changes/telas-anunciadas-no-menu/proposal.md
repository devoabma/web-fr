## Why

`/metrics` nasceu como casca — cabeçalho, aviso e um bloco tracejado — e só virou tela de verdade
depois, na change `metricas-de-liberacoes`. O caminho funcionou: a casca no menu deixou o assunto
visível para quem usa o painel, e o aviso já ensinava o recorte antes de existir um número na tela.

Faltam duas telas nesse mesmo ponto de partida, e as duas já têm o recorte definido pela `api-fr`:

- **`/downloads`** — os arquivos enviados para impressão são apagados toda sexta às 23:59. Hoje
  `/printers` só consegue **abrir** o arquivo em aba nova, porque o `fileUrl` aponta para o Storage,
  em outro domínio, onde `<a download>` é ignorado. Quem precisa guardar o arquivo não tem para onde
  ir, e o prazo corre.
- **`/admin/reports`** — o fechamento do atendimento (liberações, tempo consumido e impressões, por
  período, sala e colaborador) é o item 4 da lista de dependências do backend no `ROADMAP.md`.
  `/metrics` responde *quanto*, em contagem; o relatório é outra coisa: é o documento do período.

As duas dependem de trabalho na `api-fr` que ainda não existe. A alternativa era não ter a rota até
lá — mas é justamente o menu que informa o funcionário do que o painel vai passar a fazer, e é a
casca que segura o endereço para o link não nascer quebrado.

## What Changes

- **Nova rota `/downloads`**, aberta aos dois papéis, com o aviso do expurgo semanal e do recorte
  por salas vinculadas. O corpo é o bloco tracejado de "em construção".
- **Nova rota `/admin/reports`**, restrita a `ADMIN`, com o aviso de que a tela enxerga todas as
  salas e de que registro excluído continua contando no histórico. Mesmo bloco tracejado.
- **Três itens novos na sidebar**: `Métricas` e `Downloads` na seção do painel, `Relatórios` na
  seção de administração — esta última já renderizada só para `ADMIN`.

## Capabilities

### Added Capabilities
- `telas-anunciadas-no-menu`: os endereços de downloads e de relatórios existindo como casca
  navegável, com o aviso do recorte já escrito, enquanto a `api-fr` não oferece o que preencher.

## Impact

- Novo: `src/app/(private)/downloads/` (`page.tsx`, `_components/downloads-notice.tsx`),
  `src/app/(private)/admin/reports/` (`page.tsx`, `_components/reports-notice.tsx`).
- Alterado: `src/app/(private)/_components/shared/panel-sidebar/nav-items.tsx`.
- **Nenhuma rota nova em `PUBLIC_ROUTES`.** A política é negar por padrão, então `/downloads` nasce
  protegida sem registro nenhum, e `/admin/reports` é coberta pelo prefixo `/admin` de
  `ADMIN_ROUTES` — `MEMBER` que digitar o endereço volta para o painel.
- **A casca diz que está em construção, e nada mais.** Nenhum botão desabilitado, nenhum campo
  falso, nenhum número de exemplo: um controle que não faz nada é pior que a ausência dele, porque
  faz o funcionário tentar.
- **O aviso não é rascunho.** Ele descreve o recorte que a `api-fr` já garante hoje (expurgo
  semanal, salas vinculadas, escopo de `ADMIN`) e continua valendo quando o conteúdo chegar — foi
  o que aconteceu com o `metrics-notice`, que atravessou a construção da tela sem uma linha mudada.
- **A casca é dívida assumida, com prazo de leitura no `ROADMAP.md`.** Item 2 (download do arquivo
  pela própria API) destrava `/downloads`; item 4 (relatórios) destrava `/admin/reports`.
