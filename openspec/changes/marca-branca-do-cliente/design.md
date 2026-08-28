## Context

Duas telas exibem a logo da instituição: o cabeçalho da landing pública e o painel de marca do login. As
duas usavam o mesmo PNG, com o mesmo nome de instituição no `alt` e larguras diferentes.

## Decisões

### O arquivo é nomeado pelo papel, não pela instituição

`logo-cliente.png` diz o que aquele arquivo é dentro do produto: o lugar da marca de quem usa. Um
`logo-oabma.png` referenciado no código faz com que a troca de cliente vire uma edição de código —
e um `logo-oabma.png` contendo a logo de outra seccional é pior ainda.

### A altura é o que fica fixo

Antes: `w-40 h-auto`. A largura fixa só funciona enquanto a proporção da logo não muda. Uma logo mais
quadrada com `w-40` fica alta demais e estica o cabeçalho; uma mais alongada fica baixa demais e some.

Com `h-9 w-auto`, a logo ocupa a altura do cabeçalho e cresce lateralmente conforme a proporção dela.
É a dimensão que o layout precisa controlar — a outra é consequência.

### O `alt` deixa de nomear a instituição

`alt="OAB Maranhão"` num arquivo que pode conter qualquer logo é uma legenda que envelhece em silêncio:
o leitor de tela anunciaria a instituição errada, e nada na tela denunciaria isso. `"Logo da
instituição"` é menos específico e continua verdadeiro depois da troca.

### O `brightness-0 invert` do login sobrevive à troca, e isso é uma armadilha documentada

O painel do login é escuro, e a logo é pintada de branco por `brightness-0 invert`. Isso só funciona
com PNG de fundo transparente — o filtro pinta os pixels, e um fundo opaco vira um retângulo branco
sólido cobrindo o painel.

Quem trocar o arquivo não tem como adivinhar isso olhando o CSS. Está escrito no comentário, ao lado da
tag, que é onde a pessoa vai estar quando trocar.

### O cabeçalho foi endurecido junto

Uma logo mais larga que a anterior disputa espaço com a marca do produto. `min-w-0` no bloco de texto
permite que ele encolha, `truncate` no subtítulo o corta em vez de empurrar, e `shrink-0` nas imagens
impede que qualquer uma das duas seja amassada. Sem isso, a primeira logo larga quebraria o cabeçalho —
e o defeito apareceria no cliente novo, não aqui.

## Riscos

- **A troca é por arquivo, não por configuração.** Um deploy serve uma instituição. Multi-tenant exige
  outra coisa — variável de ambiente, ou logo vinda da API.
- **Nada valida a proporção do arquivo entregue.** Uma logo muito alongada, mesmo com a altura fixa,
  pode ficar larga o bastante para apertar a marca do produto em telas pequenas. O `truncate` evita a
  quebra do layout, mas o resultado fica feio antes de ficar quebrado.
