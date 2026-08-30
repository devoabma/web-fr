## 1. Ícones do app (concluída)

- [x] 1.1 `scripts/generate-pwa-icons.mjs` rasterizando a marca do `fr-icon.svg` com `sharp` emprestado
- [x] 1.2 `icon-192.png` e `icon-512.png` (`any`), com cantos arredondados no próprio PNG
- [x] 1.3 `icon-maskable-192.png` e `icon-maskable-512.png`, fundo até a borda e marca em 50% do quadro
- [x] 1.4 `apple-touch-icon.png` (180), quadrado e opaco
- [x] 1.5 PNGs versionados em `public/icons/`; `sharp` fora das dependências do projeto

## 2. Manifesto (concluída)

- [x] 2.1 `src/app/manifest.ts` com `id`, `display: standalone`, `scope` e `start_url` no `/panel`
- [x] 2.2 `theme_color` `#16213e` e `background_color` `#f4f5f8`
- [x] 2.3 Ícones `any` e `maskable` declarados separadamente
- [x] 2.4 Atalhos de toque longo: Painel, Liberações, Impressões
- [x] 2.5 `lang: pt-BR` e descrição alinhada à do `metadata`

## 3. Metadados do layout (concluída)

- [x] 3.1 `icons.icon` com SVG e PNG; `icons.apple` apontando o `apple-touch-icon`
- [x] 3.2 `appleWebApp` com `capable`, título e `statusBarStyle`
- [x] 3.3 `apple-mobile-web-app-capable` manual, para iOS anterior ao 17.4
- [x] 3.4 `export const viewport` com `themeColor` e `colorScheme: 'light'`
- [x] 3.5 `applicationName`

## 4. Service worker (concluída)

- [x] 4.1 `public/sw.js` com `install`, `activate` e `fetch`
- [x] 4.2 Navegação sempre pela rede, com `offline.html` como única alternativa
- [x] 4.3 Requisição de outra origem ignorada (a `api-fr` nunca entra no cache)
- [x] 4.4 Apenas `GET`; nenhuma ação de escrita passa pelo worker
- [x] 4.5 Cache restrito a `/_next/static/*`, `/icons/*` e os SVGs da marca
- [x] 4.6 Limpeza dos caches de versões anteriores no `activate`
- [x] 4.7 `public/offline.html` com marca inline, sem depender de JS do Next nem de fonte remota
- [x] 4.8 `ServiceWorkerRegistrar` registrando em produção e **desregistrando** em desenvolvimento
- [x] 4.9 Cabeçalhos do `/sw.js` no `next.config.ts` (`no-store`, `Service-Worker-Allowed`)

## 5. Verificação

- [x] 5.1 `pnpm exec tsc --noEmit` sem erros
- [x] 5.2 `pnpm exec biome check` sem issues
- [x] 5.3 `pnpm exec next build` sem erros, com `/manifest.webmanifest` na lista de rotas
- [x] 5.4 `/manifest.webmanifest` servindo `200` com `application/manifest+json` e o JSON esperado
- [x] 5.5 `/sw.js` com `Cache-Control: no-store` e `Service-Worker-Allowed: /`
- [x] 5.6 `/offline.html` e os cinco ícones respondendo `200` sem sessão
- [x] 5.7 Guarda de rotas intacta: `/panel` sem cookie ainda redireciona para o login
- [x] 5.8 HTML gerado com `<link rel="manifest">`, `theme-color`, `apple-touch-icon` e as duas metas de
      `web-app-capable`
- [ ] 5.9 Instalar em Android e conferir ícone, splash e abertura em tela cheia
- [ ] 5.10 Adicionar à tela de início no iPhone e conferir ícone e ausência da barra do Safari
- [ ] 5.11 Conferir a tela de offline com o modo avião ligado, no app instalado
- [ ] 5.12 Conferir que o cache não guarda tela do painel após logout (DevTools → Application → Cache)

## 6. Próximos passos (fora desta change)

- [ ] 6.1 Botão "Instalar app" no painel, com `beforeinstallprompt` no Android e instrução para iOS
- [ ] 6.2 Rever `theme_color` e `colorScheme` quando o tema escuro existir
- [ ] 6.3 Avaliar `viewportFit: 'cover'` junto com `safe-area-inset` no shell
- [ ] 6.4 Aviso de nova versão disponível, aproveitando o ciclo de vida do worker
