/**
 * Service worker do Sala Livre.
 *
 * Existe por dois motivos: o Chrome só oferece "instalar app" para quem tem um service worker com
 * handler de `fetch`, e o painel precisa dizer alguma coisa decente quando o celular fica sem rede.
 *
 * A regra de ouro aqui é **não guardar nada autenticado**. HTML de tela e resposta da `api-fr`
 * carregam dados de sessão; se fossem parar no cache, o próximo usuário do mesmo aparelho veria os
 * dados de quem entrou antes. Por isso o cache é limitado a arquivo estático e imutável.
 */

/** Suba a versão para invalidar tudo que ficou para trás na próxima visita. */
const VERSION = 'v1'
const ASSET_CACHE = `sala-livre-${VERSION}`
const OFFLINE_URL = '/offline.html'

/** Mínimo para a tela de "sem conexão" aparecer inteira mesmo com o rádio desligado. */
const PRECACHE_URLS = [OFFLINE_URL, '/fr-icon.svg', '/icons/icon-192.png']

self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(ASSET_CACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      // `skipWaiting` evita o limbo do worker antigo continuar mandando depois de um deploy.
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys => Promise.all(keys.filter(key => key !== ASSET_CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', event => {
  const { request } = event

  // Só GET: POST/PATCH/DELETE são ações de verdade e nunca podem sair de cache.
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // Outra origem (a `api-fr`, o Google Fonts, o storage das imagens) fica por conta do navegador.
  if (url.origin !== self.location.origin) return

  // Navegação: sempre rede. Se a rede falhar, mostra a tela de offline — nunca uma tela do painel
  // guardada de antes, que estaria desatualizada e possivelmente de outra sessão.
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)))

    return
  }

  // Estático e versionado por hash (`/_next/static/*`) ou marca do app: cache primeiro, porque o
  // conteúdo nunca muda sem o nome mudar junto.
  if (isImmutableAsset(url)) {
    event.respondWith(cacheFirst(request))
  }
})

function isImmutableAsset(url) {
  return (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/fr-icon.svg' ||
    url.pathname === '/logo.svg'
  )
}

async function cacheFirst(request) {
  const cached = await caches.match(request)

  if (cached) return cached

  const response = await fetch(request)

  // `basic` = mesma origem e resposta completa. Opaca ou 206 (range) no cache dá dor de cabeça.
  if (response.ok && response.type === 'basic') {
    const cache = await caches.open(ASSET_CACHE)

    cache.put(request, response.clone())
  }

  return response
}
