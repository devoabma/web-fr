## Context

A área administrativa passou a abrir painéis flutuantes para cadastrar e editar. A moldura do painel não
acompanhou. Esta change alinha as duas linguagens e corrige um defeito de navegação que só aparecia no
toque.

## Decisões

### O menu fecha ao navegar, mas só onde ele sobrepõe

Em telas estreitas a navegação cobre o conteúdo; em telas largas ela ocupa coluna própria ao lado. Fechar ao
navegar é correção num caso e perda no outro — daí a condição pelo modo de apresentação, e não pelo evento.

### O menu no celular vira o mesmo componente dos formulários

O menu usava o componente de painel lateral genérico; os formulários usam o de arrasto. Trocar o primeiro
pelo segundo trouxe, além do visual, o fechamento por arrasto — que num menu de navegação é o gesto que se
tenta primeiro.

Dois detalhes vieram do componente de arrasto e precisaram de ajuste:

- A largura precisa de `!` porque o componente declara a sua num seletor mais específico, com prefixo `sm:`,
  e a faixa de telas estreitas do painel (< 768px) atravessa esse limite.
- A faixa que o componente pinta para fora da borda precisa ser apagada, senão aparece como um risco da cor
  do painel dentro do respiro. É o mesmo ajuste dos formulários.

### A ilha é o `variant` que já existia

O componente de navegação traz um modo em que a área de conteúdo flutua como ilha sobre o fundo da
navegação. Ele estava desligado e cobre só o desktop. Ligá-lo e declarar o equivalente para telas estreitas
custa três linhas e evita reimplementar o que já estava escrito.

Duas armadilhas:

- A cor de fundo do wrapper é aplicada por um seletor que procura a navegação como descendente. Em telas
  estreitas a navegação vive num portal, fora do wrapper, e o seletor não encontra nada — a cor precisa ser
  declarada diretamente.
- O contêiner da ilha precisa recortar o que transborda, ou o conteúdo que rola passa por cima do canto
  arredondado.

### A marca mede a coluna, não o próprio conteúdo

Ancorar a marca é uma conta de posições. O botão de um item de menu começa a 16px da borda da tela — 8px do
respiro do modo ilha mais 8px do recuo interno da lista — e ocupa 32px. O símbolo da marca tem exatamente
32px. Alinhando as duas caixas em 16px, alinham-se também os centros, nos dois estados da navegação: com
16rem de largura e com 4rem.

Isso exige saber se a navegação está recolhida, o que só o estado do componente informa. Daí a marca ser um
componente de cliente — o menor possível, com a barra superior seguindo no servidor.

**Alternativa descartada:** manter a marca com largura fixa. Ela deixaria de casar com a coluna justamente
quando a navegação recolhe, que é quando o desalinhamento fica mais visível.

## Riscos

- **O alinhamento horizontal da barra superior com a ilha** não é exato: o recuo à direita da barra e a
  margem da ilha são valores diferentes. Fica para ajuste de olho, se incomodar.
- **O modo ilha no desktop é decisão de gosto**, tomada como experimento. A reversão é de duas linhas.
