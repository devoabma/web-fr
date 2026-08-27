## Why

Três problemas do mesmo lugar: a moldura do painel.

**No celular, escolher uma área não fechava o menu.** A navegação abre sobreposta ao conteúdo; tocar em
"Salas" trocava a página **atrás** do painel, que continuava aberto por cima. Quem não percebesse teria de
fechar o menu à mão para ver o que pediu — e quem percebesse concluiria que o toque não funcionou.

**O menu no celular destoava de tudo o que o painel abre.** Os formulários da área administrativa são
painéis flutuantes com respiro nas bordas, cantos arredondados e fechamento por arrasto. O menu era um bloco
colado na borda, sem arrasto, com outra curva de animação.

**A moldura inteira era de bordas coladas**, com uma linha horizontal atravessando a tela sob a barra
superior. Nada errado, mas nada a ver com o vocabulário que o resto do painel passou a usar.

## What Changes

- **Escolher uma área fecha o menu no celular.** No desktop ele permanece aberto: lá a navegação ocupa
  coluna própria e fechá-la a cada clique seria perder o menu.
- **O menu no celular passa a ser o mesmo componente dos formulários** — painel flutuante com respiro de
  `0.75rem`, cantos arredondados, sombra e fechamento por arrasto, com a direção do arrasto seguindo o lado
  em que a navegação está.
- **A moldura vira ilha.** O fundo do painel assume o tom da navegação e a área de conteúdo ganha cantos
  arredondados, sombra e respiro, nas duas larguras. No desktop isso é o `variant="inset"` que o componente
  de navegação já trazia pronto e estava desligado; abaixo de 768px é declarado no layout, porque as classes
  do componente começam em `md:`.
- **A barra superior perde a borda inferior.** Com o fundo do painel na mesma cor dela, a linha vira um
  risco atravessando a tela; quem separa a barra do conteúdo passa a ser o respiro da ilha.
- **A marca é ancorada à coluna da navegação.** Ela passa a ocupar exatamente a largura da coluna e o
  símbolo cai na mesma vertical dos ícones do menu, acompanhando o recolhimento à faixa de ícones — quando
  recolhida, sobra só o símbolo, na mesma posição.

## Capabilities

### Modified Capabilities
- `navegacao-do-painel`: a navegação em telas estreitas passa a fechar ao escolher uma área e a se apresentar
  como painel flutuante; a moldura do painel passa a apresentar o conteúdo como ilha; a marca passa a ser
  ancorada à coluna da navegação.

## Impact

- Alterado: `src/components/ui/sidebar.tsx` (apenas o ramo de telas estreitas),
  `src/app/(private)/layout.tsx`, `src/app/(private)/_components/shared/panel-header/index.tsx`,
  `src/app/(private)/_components/shared/panel-sidebar/index.tsx`,
  `src/app/(private)/_components/shared/panel-sidebar/nav-items.tsx`.
- Novo: `src/app/(private)/_components/shared/panel-header/panel-brand.tsx`.
- **A marca virou componente de cliente.** A largura dela depende de a navegação estar recolhida ou não, e
  nenhuma consulta de mídia sabe disso. A barra superior continua sendo renderizada no servidor.
- **O componente `sheet` ficou sem uso no projeto.** Foi mantido no lugar: é peça da biblioteca de
  interface, não código morto de aplicação.
- **A área útil do conteúdo diminuiu** em 24px na horizontal e outro tanto na vertical, no celular. É o preço
  do respiro.
- **O tratamento no desktop é experimental**, a pedido: se não convencer, desligar `variant="inset"` e
  devolver a borda da barra superior reverte só a parte do desktop. As declarações de `max-md:` no layout
  valem apenas abaixo de 768px e permanecem.
