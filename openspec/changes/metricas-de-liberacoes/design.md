## Context

A tela nasce depois de `/releases`, e herda dela o molde: `page.tsx` de servidor com o cabeçalho e o
aviso, um componente cliente único segurando as consultas e os filtros, e um `_data/` com o
view-model sem JSX.

O que muda é a origem dos números. O histórico lê a lista e filtra no cliente porque a rota não
oferece nada além disso. As métricas passaram a ter uma rota agregada própria, criada na change
`aggregate-release-metrics` da `api-fr`, e por isso a tela quase não calcula: ela formata.

## Decisões

### A contagem é do banco, não do navegador

A alternativa era somar no cliente, reusando `getAllReleases` como o histórico faz. Ela foi
descartada pelo gráfico "por ano": ele precisa de todo o histórico, e a rota não pagina nem aceita
recorte que ajude. O custo cresce com o passado da Seccional — quanto mais a operação roda, mais
lenta a tela fica, até parar de abrir no celular do balcão.

Com a rota agregada, o navegador recebe contagens prontas e o volume não depende do histórico.

### Gráfico só onde há eixo

Por ano e por mês são séries: doze meses em ordem, anos em sequência. Barra num eixo é a forma certa,
e aí entra o `recharts`.

Por sala e por advogado não são séries — são comparações entre itens nomeados, com contagem e
percentual ao lado. Uma lista com barra proporcional em CSS diz a mesma coisa com menos maquinário,
tem texto selecionável, alinha com a tipografia do resto do painel e não paga uma re-renderização de
SVG a cada troca de filtro.

### Os rótulos de valor ficam numa linha fixa no topo

O `position="top"` do `LabelList` acompanha a altura da barra. Isso esconde exatamente os valores que
mais precisam ser lidos: a barra zerada não tem topo onde pousar o rótulo, e o mês que ainda não
chegou sumiria da leitura em vez de mostrar o traço.

`chart-value-label.tsx` desenha os rótulos numa linha própria no alto da área do gráfico, alimentada
pelo array de valores originais — onde `null` vira `—` e `0` continua sendo `0`. É também o que o
desenho da tela pedia.

### A barra mede contra o líder; o percentual, contra o total

Nos dois rankings a largura da barra é relativa ao primeiro colocado, e o percentual ao lado é a
fatia do total. Se a barra usasse a fatia, um ranking equilibrado viraria cinco tracinhos idênticos e
curtos, e a comparação entre salas — que é o ponto do card — se perderia. Já o percentual precisa
somar 100%, porque é ele que responde "quanto desta operação passa por aqui".

O ranking é montado sobre a lista inteira antes de fatiar o top 10: fatiar primeiro mediria o décimo
colocado contra ele mesmo, e todos apareceriam com a barra cheia.

### Ano e sala moram na URL; nada mais

Os dois definem o que a `api-fr` agrega. Diferente do histórico, aqui não há filtro que só estreite o
que já está na mão — tudo o que a tela mostra vem da consulta. Um `?ano=` fora de faixa cai no ano
corrente, e o ano selecionado sempre entra na lista do seletor, mesmo vazio: sem isso, quem chega por
um link de um ano sem movimento veria o seletor exibindo um ano ausente da própria lista e perderia o
caminho de volta ao trocar.

### O vazio explica a causa

"Sem dados" deixa o funcionário sem saber se filtrou demais, se a sala é nova ou se o ano ainda não
começou. `buildEmptyMessage` separa os casos, e quando existe histórico em outro ano a tela **mantém
o gráfico por ano** — é ele que mostra onde há movimento para escolher.

### Os blocos não podem encolher, e os pares dividem a largura

O layout privado envolve as telas em `flex flex-1 flex-col gap-6 overflow-auto`. Flex item nasce com
`flex-shrink: 1`, então numa tela alta o container **comprime os blocos até caberem** em vez de rolar
— e o `overflow-hidden` do `Card` corta o que sobra. As outras telas escapam por terem poucos blocos;
esta, com seis, ficou com os quatro cards esmagados: o gráfico anual renderizava 84 px de uma altura
real de 336 px, e o ranking de salas 73 px de 272 px.

Por isso todo bloco de primeiro nível desta tela leva `shrink-0`, inclusive os esqueletos — sem eles o
carregamento mostraria um layout e o conteúdo saltaria para outro.

Resolvido o corte, os quatro cards deixaram de ser uma pilha: anual e mensal dividem uma faixa de três
colunas (o mensal fica com duas, porque doze barras não sobrevivem a meia largura), e os dois rankings
dividem uma faixa de duas. A rolagem caiu pela metade e a leitura de relance ganhou o par lado a lado.

**Nota:** a causa está no layout compartilhado, não nesta tela. Hoje nenhuma outra rota corta
(verificado em `/panel`, `/releases`, `/printers` e `/admin/rooms`), mas qualquer tela futura com
muitos blocos vai esbarrar no mesmo `flex-shrink`.
