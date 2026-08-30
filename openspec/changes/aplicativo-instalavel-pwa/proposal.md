## Why

O painel é web e continua sendo — mas quem coordena a Seccional acompanha as salas do celular, e abrir o
navegador, achar a aba, digitar o endereço é atrito que se paga várias vezes por dia. O pedido foi
direto: ter o Sala Livre na tela de início do aparelho, como app.

Nada no painel habilitava isso. Sem manifesto, o Chrome não oferece "instalar" — e ele exige duas coisas
juntas: manifesto válido com ícone de 192 e 512, e um service worker com handler de `fetch`. No iPhone o
"Adicionar à tela de início" até funcionava, mas o atalho abria dentro do Safari, com barra de endereço
ocupando o topo e o ícone virando uma miniatura da página — o oposto da sensação de aplicativo.

Havia também um efeito colateral silencioso: com o aparelho sem rede, o painel mostrava a tela de erro do
navegador. Para quem instalou um app, essa tela não parece "a internet caiu", parece "o app quebrou".

## What Changes

- **Manifesto** (`src/app/manifest.ts`): `display: standalone`, `start_url` no `/panel`, `theme_color` no
  azul da marca, splash `#f4f5f8`, atalhos de toque longo para Painel, Liberações e Impressões. O Next
  publica em `/manifest.webmanifest` e injeta a `<link rel="manifest">` sozinho.
- **Ícones do app** (`public/icons/`, cinco PNGs): a marca do `fr-icon.svg` rasterizada sobre o azul
  `#16213e`. Três desenhos, não um: `icon-*` com cantos arredondados, `icon-maskable-*` com fundo até a
  borda e marca menor, `apple-touch-icon` quadrado e opaco. O porquê está no *Design*.
- **`scripts/generate-pwa-icons.mjs`**: gera os PNGs a partir do SVG. Usa `sharp` **emprestado** via
  `pnpm dlx`, sem entrar nas dependências do painel — é trabalho pontual, de quando a marca mudar.
- **Service worker** (`public/sw.js`): navegação sempre pela rede, com a tela de offline como única
  alternativa; cache restrito a arquivo imutável (`/_next/static/*`, ícones, marca). **Nenhum HTML de
  tela e nenhuma resposta da `api-fr` entram no cache** — ver *Design*, é a decisão que sustenta a
  change.
- **`public/offline.html`**: HTML solto, com a marca inline e estilo próprio, que abre com o rádio
  desligado sem depender do Next, de fonte remota ou da API.
- **`ServiceWorkerRegistrar`**: registra o worker em produção e o **desregistra** em desenvolvimento.
- **Cabeçalhos do `/sw.js`** (`next.config.ts`): `no-store` e `Service-Worker-Allowed: /`.
- **Metadados do layout**: ícones, `appleWebApp`, `apple-mobile-web-app-capable` manual,
  `viewport.themeColor` e `colorScheme: 'light'`.

## Capabilities

### Added Capabilities
- `aplicativo-instalavel-pwa`: o painel pode ser instalado no celular e abrir em tela cheia com a marca
  do Sala Livre, e diz o que está acontecendo quando o aparelho fica sem rede.

## Impact

- Novos: `src/app/manifest.ts`, `src/components/app/service-worker-registrar.tsx`, `public/sw.js`,
  `public/offline.html`, `public/icons/` (5 arquivos), `scripts/generate-pwa-icons.mjs`.
- Alterados: `src/app/layout.tsx`, `next.config.ts`.
- **A instalação só é oferecida em HTTPS** (`localhost` é a exceção). O deploy ainda é item aberto do
  roadmap: até o painel subir num domínio com certificado, nada disso aparece para o usuário final.
- **Não há botão "Instalar app" dentro do painel.** O caminho hoje é o menu do navegador. Capturar o
  `beforeinstallprompt` é possível no Android; no iOS o evento não existe e a instrução teria de ser
  escrita à mão.
- **Não foi testado em aparelho real.** O que foi verificado é o servidor: manifesto com
  `application/manifest+json`, cabeçalhos do `/sw.js`, ícones e `/offline.html` respondendo `200` sem
  passar pela guarda de sessão, e as metas presentes no HTML gerado. Instalação em Android, atalho em
  iPhone e comportamento com o modo avião ligado continuam por conferir.
- **O `VERSION` do worker é manual.** Mudança no conteúdo de `sw.js` sem subir a versão deixa o cache
  antigo de pé até a próxima troca.
