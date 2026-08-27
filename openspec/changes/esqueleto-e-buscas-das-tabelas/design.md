## Context

Refino de duas decisões tomadas em `anatomia-das-tabelas-administrativas`, ambas corretas no princípio e
excessivas na dose. Nenhuma funcionalidade entra ou sai; o que muda é peso visual e alcance de busca.

## Decisões

### A caixa sustenta a altura, não o traço

O requisito original — esqueleto com a altura da linha real — foi implementado dando `h-5` ao próprio traço.
Isso resolve o salto e cria o peso.

A separação é simples: o traço vira `h-3` e passa a morar numa caixa `h-5` (`inline-flex items-center`). A
linha da tabela continua medindo o mesmo, e o placeholder pesa 40% do que pesava.

### A âncora precisa de desenho, não de tamanho

A primeira coluna das três tabelas tem o mesmo arranjo: ladrilho de 32px + nome + segunda linha menor. Ela é
quem define a altura da linha (56px contra 44px das demais).

Um traço fino sozinho ali encolheria a linha inteira. A saída foi dar a ela um esqueleto composto — ladrilho
(círculo em colaboradores, quadrado arredondado em salas e computadores) mais duas barras de larguras
diferentes. A coluna se declara âncora preenchendo `skeletonAnchorClassName`; as demais seguem no traço
simples.

**Alternativa descartada:** um campo `skeletonCell` recebendo JSX arbitrário no `meta`. Resolveria qualquer
caso futuro e traria layout para dentro da definição de coluna — que hoje só carrega classes.

### Quatro linhas

`skeletonRows = pageSize` fazia o esqueleto imitar a página cheia. Como o número de registros é desconhecido
até a resposta chegar, imitar a página é chutar. Quatro linhas comunicam "é uma tabela e está carregando" e
ocupam metade da tela.

**Custo aceito:** com dez ou mais registros a tabela cresce no instante da troca. Expansão para baixo não
empurra o que já está lido; era o encolhimento que o requisito original queria evitar.

### Busca é para estreitar

Um campo de busca que casa com muitos registros para um termo curto trabalha contra quem digita. A UF tem
duas letras e aparece dentro de palavras comuns do domínio; o MAC tem dezessete caracteres que ninguém
memoriza.

Ambos continuam **visíveis** na tabela. A diferença é entre ser exibido para conferência e ser critério de
filtro.
