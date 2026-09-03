## Why

`/downloads` era casca e prometia a coisa errada. O aviso falava do expurgo semanal das impressões e
das salas vinculadas, porque a tela nasceu esperando a `api-fr` servir o arquivo da fila de impressão
pelo próprio domínio — bloqueio que continua de pé e que não é o que a `api-fr` entregou.

O que ela entregou foi a capacidade `downloads`: cinco rotas sob `/downloads` que publicam o
**instalador e o desinstalador do Sala Livre**. Hoje o colaborador que precisa pôr uma estação em
operação pede o executável a alguém — por e-mail, por pendrive, pelo grupo do WhatsApp. Não existe um
lugar oficial que responda "o instalador é este". É exatamente o vazio que a `api-fr` fechou e que o
painel ainda não mostrava.

A regra que dá forma à tela é da `api-fr`: **um arquivo ativo por tipo**. Publicar o instalador novo
exige tirar o atual do ar, e o antigo não some — vira histórico com o endereço que usava.

## What Changes

- **`/downloads` deixa de ser casca** e passa a listar os arquivos publicados, com um **slot por
  tipo** (instalador e desinstalador) em vez de uma lista solta. É a regra "um ativo por tipo"
  desenhada na tela: cada tipo tem um lugar, ocupado ou vazio.
- **Duas leituras da mesma tela, decididas pelo papel**: o MEMBER vê os arquivos e o botão de baixar;
  o ADMIN vê também as ações de gestão (publicar, editar, tirar do ar) e o histórico dos inativos. O
  papel sai do cookie **no servidor**, como no layout, então as ações já vêm certas no HTML e não
  piscam na tela de quem não pode vê-las.
- **Publicar** (`POST /downloads/create`) por painel lateral, aberto **do slot vazio**: o tipo vem do
  slot e não há seletor de `kind` no formulário — com um seletor livre, o ADMIN escolheria um tipo já
  ocupado e descobriria o problema só no `400`.
- **Editar** (`PATCH /downloads/update/:id`) em diálogo, com nome, endereço, versão e observação. O
  `kind` não viaja: não é editável na `api-fr`. Campo de versão ou observação **esvaziado manda
  `null`** — apagar a versão de um link é edição legítima, não campo esquecido.
- **Tirar do ar** (`PATCH /downloads/deactivate/:id`) com confirmação, e **reativar**
  (`PATCH /downloads/activate/:id`) a partir do histórico. Inativar não apaga: é o passo obrigatório
  antes de publicar outro arquivo do mesmo tipo, e é o que permite voltar atrás quando o executável
  novo sai quebrado.
- **Conferência do endereço antes de desenhar o botão** (`_data/download-link.ts`). A `api-fr` já
  fecha o protocolo em http/https na entrada, mas um valor gravado antes disso — ou colado direto no
  banco — continuaria virando `href`. Um `javascript:` num `href` não é link quebrado, é script
  rodando no navegador de quem só queria o instalador. Endereço recusado vira aviso, não botão.
- **O aviso da tela muda de assunto** junto com ela: instalar com a estação fora de uso (a instalação
  fecha o Sala Livre e uma liberação em andamento perde a tela que a controla), e — para o ADMIN — a
  explicação de que fica um arquivo de cada tipo no ar.
- **Correção de rota em `atualizacao-remota-do-desktop`**: o painel chamava
  `POST /computers/update/:id`, que não existe. O caminho é `POST /computers/update-app/:id`. Ver
  `design.md`.

## Capabilities

### New Capabilities
- `publicacao-de-downloads`: a tela que publica e distribui o instalador e o desinstalador do Sala
  Livre, com um arquivo ativo por tipo, histórico dos endereços anteriores e gestão restrita ao
  ADMIN.

### Modified Capabilities
<!-- Nenhuma. `openspec/specs/` continua vazio (as changes anteriores ainda não foram sincronizadas).
     A correção da rota de `atualizacao-remota-do-desktop` é conserto de implementação contra o
     contrato que aquela change já descrevia, não mudança de requisito. -->

## Impact

- Novo: `src/server/downloads/` (as cinco chamadas), `src/constants/download-kinds.ts` (espelho do
  enum da `api-fr`, com rótulos e dicas), `src/app/(private)/downloads/_data/download-link.ts` e os
  componentes da tela (`downloads-board`, `download-card`, `downloads-history`, `new-download`,
  `update-download`, `inactive-download`, `activate-download` e os dois schemas de formulário).
- Alterado: `src/app/(private)/downloads/page.tsx` (lê o papel do cookie e monta o quadro),
  `_components/downloads-notice.tsx` (aviso por papel), `src/constants/query-keys.ts`
  (`getDownloads`) e `src/server/computers/update-app.ts` (rota corrigida).
- Reusado sem alteração: `Drawer`, `Dialog`, `AlertDialog`, `Field`, `Tooltip`, `Skeleton`, o
  `api-error` (mensagem da `api-fr` repassada crua, `429` com espera formatada) e o `queryKeys`.
- **Sem dependência nova.** Nenhuma biblioteca entrou.
- Não depende de trabalho na `api-fr`: as cinco rotas já existiam e foram conferidas no repositório
  irmão antes de escrever o cliente.
