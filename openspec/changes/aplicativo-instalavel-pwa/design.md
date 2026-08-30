## Contexto

O Sala Livre não é um app offline e não deve fingir que é. Toda tela do painel depende de uma resposta da
`api-fr`: a grade das máquinas, o saldo do advogado, o histórico. Sem rede não existe painel — existe, no
máximo, uma frase honesta explicando isso.

Então o que esta change persegue não é funcionamento offline. É **forma**: ícone próprio na tela de
início, abertura em tela cheia, barra de status na cor da marca, e uma tela decente quando a rede cai. O
service worker entra como requisito técnico para a instalação, não como ambição de cache.

Isso muda a régua de cada decisão abaixo: quando cache e correção brigaram, correção ganhou.

## Decisões

### O cache não guarda nada autenticado

Esta é a decisão que define o `sw.js`. Um service worker típico de PWA guarda o "app shell" — o HTML das
telas — para abrir rápido na segunda visita. Aqui isso seria um vazamento.

O painel é usado no balcão, e o aparelho é compartilhado: o funcionário da manhã sai, o da tarde entra. As
telas do painel são renderizadas no servidor **já com os dados da sessão** — a grade da sala, o nome de
quem está logado, o histórico. Um HTML dessa tela no cache do navegador sobrevive ao logout, porque o
logout apaga cookie, não `CacheStorage`. O próximo usuário abriria o app e veria, por um instante, a tela
do anterior.

Por isso a regra é a mais restritiva possível:

- **Navegação: sempre rede.** Falhou, mostra `offline.html`. Nunca uma tela guardada.
- **Outra origem: passa direto.** A `api-fr` é outro domínio; o worker nem olha.
- **Só `GET`.** `POST`/`PATCH`/`DELETE` são ações de verdade.
- **Cache apenas do imutável**: `/_next/static/*` (nome com hash — conteúdo novo, nome novo), os ícones e
  os SVGs da marca. Nada disso depende de quem está logado.

O ganho de velocidade que se perde é pequeno: o HTML sempre viria da rede de qualquer forma, porque é ele
que carrega o dado fresco.

### Por que um service worker, se não há ambição offline

Porque o Chrome não oferece a instalação sem ele — exige manifesto **mais** um worker com handler de
`fetch` registrado. É requisito de plataforma, não escolha de arquitetura. Sabendo disso, o worker foi
escrito no menor tamanho que satisfaz o requisito e ainda entrega algo útil (a tela de offline), em vez de
adotar uma biblioteca que traria uma política de cache muito mais larga do que a que este painel suporta.

### Escrito à mão, sem `next-pwa` nem Serwist

As bibliotecas de PWA para Next resolvem o problema inverso do nosso: elas assumem que cachear é bom e
oferecem estratégias prontas — `NetworkFirst` para páginas, precache de todo o build. Configurar uma delas
para **não** fazer o que ela existe para fazer é mais frágil do que as ~60 linhas do `sw.js`, e coloca a
regra de "nada autenticado no cache" atrás de um arquivo de configuração que a próxima atualização da
biblioteca pode reinterpretar.

Some-se o custo permanente: mais uma dependência de build, acoplada à versão do Next, num projeto que já
usa Turbopack e React Compiler.

### Três desenhos de ícone, não um redimensionado

- **`icon-192/512` (`purpose: any`)** — cantos arredondados pelo próprio PNG, porque nem todo lugar que
  exibe o ícone aplica máscara; sem os cantos, apareceria um quadrado duro.
- **`icon-maskable-*` (`purpose: maskable`)** — fundo até a borda e marca reduzida a 50% do quadro. O
  Android recorta o ícone no formato do launcher (círculo, squircle, gota) e só garante os 80% centrais;
  o desenho `any` teria os cantos comidos e a marca raspada.
- **`apple-touch-icon` (180, quadrado e opaco)** — o iOS ignora os ícones do manifesto e arredonda por
  conta própria. Transparência ali vira fundo preto.

A marca usa o traço claro (`#e8eaf2`) sobre o azul `#16213e` — a mesma combinação que o `fr-icon.svg` já
adota no modo escuro, e o mesmo azul da sidebar. O ícone escuro também resolve um problema prático: a
maioria dos papéis de parede de celular é clara ou fotográfica, e a marca original é um traço fino que
sumiria sem fundo sólido.

### `sharp` emprestado, não instalado

Rasterizar SVG exige binário nativo. Adicionar `sharp` às dependências do painel custaria download e
tempo de build em toda instalação e todo deploy, para um trabalho que roda quando a marca muda — talvez
uma vez por ano. O script usa `createRequire` e roda com `pnpm dlx --package=sharp node scripts/...`; os
PNGs ficam versionados. O repositório carrega o resultado, não a ferramenta.

### `start_url` no `/panel`, não na raiz

Quem instala o app quer o painel, não a landing institucional. Sem sessão o `proxy.ts` desvia para o login
e devolve o usuário ao `/panel` depois de autenticar, então o caminho continua correto para os dois casos.

O manifesto é lido sem credenciais pelo navegador, e o matcher do `proxy` já ignora caminhos com extensão
— `/manifest.webmanifest`, `/sw.js` e `/offline.html` passam sem tocar na guarda de sessão. Conferido no
build servido: os três respondem `200` sem cookie.

### O worker é removido em desenvolvimento

O registrador não apenas deixa de registrar fora de produção: ele chama `unregister()` no que encontrar.
Quem roda um `next start` no `localhost` e volta para o `next dev` fica com um worker ativo servindo
`/_next/static/*` do build antigo por cima do dev server. A tela quebra sem uma linha de erro no terminal,
e o caminho até desconfiar do service worker é longo. Um `unregister()` de duas linhas evita a caçada.

### `apple-mobile-web-app-capable` escrito à mão

O `appleWebApp.capable` do Next emite só `mobile-web-app-capable`, a meta moderna — a prefixada foi
deprecada e o Next parou de emiti-la. Só que o Safari passou a entender a moderna no **iOS 17.4**; em
aparelho mais antigo, sem a versão prefixada, o atalho abre com a barra do navegador. Como o público inclui
iPhone que não é trocado com frequência, a meta antiga entra pelo `metadata.other`. As duas convivem sem
conflito.

### `colorScheme: 'light'`

O `globals.css` tem tokens para tema escuro, mas nada no painel alterna — não existe toggle nem
`next-themes`. Declarar `light` impede o sistema de escurecer campos e controles nativos por conta própria
num app que é claro em todas as telas. No dia em que o tema escuro existir, esta linha sai junto com o
`theme_color` fixo.

## Alternativas descartadas

- **Cachear as telas do painel para uso offline.** É a promessa que o produto não pode cumprir: o dado
  esfria em minutos e o HTML carrega sessão. Ver a primeira decisão.
- **`next-pwa` / Serwist.** Peso e política larga demais para o que se quer aqui.
- **Ícone SVG no manifesto.** O iOS não os usa, e o suporte nos launchers Android é irregular. PNG é o
  formato que funciona em todo lugar.
- **Botão "Instalar app" no painel.** Capturar `beforeinstallprompt` cobre só o Android; no iOS seria
  texto instrutivo. Ficou registrado no *Impact* como próximo passo, não como código.
- **`viewportFit: 'cover'`.** Deixaria o app ir até as bordas no iPhone, mas exige tratar `safe-area-inset`
  em todo o shell. Sem isso, o cabeçalho entraria embaixo do notch.

## Riscos

- **`VERSION` manual no `sw.js`.** Alterar o worker sem subir a versão mantém o cache velho. É o preço de
  não ter build step gerando o arquivo.
- **Ícone de app é decisão de longo prazo.** O `id: '/'` e os ícones ficam gravados na instalação; trocar
  o `id` depois faz o Android tratar como outro app e o usuário termina com dois ícones.
- **Sem HTTPS não há nada disso.** Enquanto o deploy não existir, a change é verdadeira só no código.
- **Atalhos do manifesto são ignorados pelo iOS.** Funcionam no Android; no iPhone, silêncio — não é
  quebra, é ausência.
