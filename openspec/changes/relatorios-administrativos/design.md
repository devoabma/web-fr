## Context

A tela nasce depois de `/metrics` e herda o molde das telas de histórico: `page.tsx` de servidor com
o cabeçalho e o aviso, um componente cliente único segurando as consultas e os filtros, e um `_data/`
com o view-model sem JSX.

O que ela **não** herda é a origem dos números. `/metrics` consome uma rota agregada
(`GET /lawyers/releases-metrics`) que a change `aggregate-release-metrics` criou na `api-fr`. Essa
rota devolve contagens por ano, mês, sala e advogado — e nada além disso. Um relatório precisa do que
ela não guarda: *em que dia*, *por quanto tempo*, *em qual máquina*, *primeira e última visita de
cada advogado no recorte*. Reconstruir isso a partir de contagens anuais é impossível, não é caro.

A única fonte que tem esses campos é `GET /lawyers/get-all-releases`, que devolve o histórico bruto,
sem recorte de data e sem paginação.

## Goals / Non-Goals

**Goals:**

- Responder, num arquivo que se anexa a processo, *quantos e quais advogados usaram determinada sala
  em determinado dia, mês ou ano*.
- Um único documento por período: dois diretores lendo o mesmo recorte precisam ver o mesmo número.
- Exportação em `.xlsx` e PDF que não dependa do que está visível na tela.
- Não pesar no carregamento da tela por causa de bibliotecas que só servem no clique de exportar.

**Non-Goals:**

- Relatório de produtividade por colaborador — o dado não existe no banco (ver `proposal.md`).
- Relatório de impressões com recorte mensal ou anual — o histórico é apagado toda sexta.
- Agendamento, envio por e-mail ou armazenamento dos relatórios gerados.
- Qualquer ação sobre sessões a partir da tela. É leitura, como `/releases` e `/metrics`.

## Decisions

### A agregação volta para o cliente — e isso contradiz `metricas-de-liberacoes` de propósito

A change de métricas descartou explicitamente contar no navegador: o gráfico "por ano" exigia o
histórico inteiro, e com ~28 mil sessões isso dava da ordem de 11 MB de JSON baixados a cada visita
para produzir quatro números. O argumento continua correto — para aquela tela.

Aqui ele não se aplica, por três motivos:

1. **A rota agregada não tem os campos.** Não é escolha entre duas fontes: `releases-metrics` devolve
   `{ lawyerId, name, oab, total }` por ano. "Quais advogados estiveram na Sala 2 no dia 12/03,
   entrando às 9h04 e consumindo 47 minutos" não existe ali sob nenhuma consulta.
2. **O perfil de uso é outro.** `/metrics` é consulta rotineira, aberta várias vezes por dia por
   qualquer funcionário, inclusive no celular do balcão — ali 11 MB por visita era proibitivo.
   `/admin/reports` é tela de ADMIN, usada no fechamento, num desktop. O mesmo custo, pago uma vez
   por fechamento, é aceitável.
3. **O custo é pago uma vez e serve tudo.** Uma consulta em cache alimenta os três relatórios e
   **todas** as trocas de filtro. Trocar de sala, de mês ou de relatório não dispara requisição
   nenhuma: recorta o que já está na mão. Em `/metrics`, cada troca de ano ou sala era uma ida à API.

A alternativa honesta era criar uma rota `/reports` na `api-fr` com recorte de data. Ela é melhor e
está registrada como dívida na `proposal.md`. Não é pré-requisito: adiar a tela até lá deixaria a
diretoria mais um trimestre sem resposta, e a migração depois troca a origem dos dados sem tocar em
nenhuma das agregações — elas ficam isoladas em `_data/`.

### Um relatório por vez, escolhido na toolbar

Empilhar três tabelas longas numa página faria a terceira nascer a duas rolagens de distância, e
deixaria o botão "Exportar" ambíguo sobre o que exatamente ele exporta.

O relatório ativo é um `Select` na barra de filtros, ao lado de sala e período — mesmo componente e
mesma gramática visual dos outros filtros do painel, em vez de introduzir um padrão de abas que não
existe em nenhuma outra tela.

### Sala, período e relatório moram na URL

Nas outras telas, só a sala vai para a URL, porque é ela que decide *o que* a API busca; período e
busca ficam no estado, porque só estreitam o que já está na mão. Aqui o critério é outro: **um
relatório é um documento, e um documento tem endereço.** "Me manda o de março da Sala 2" precisa ser
um link que abre exatamente aquilo — no computador de outra pessoa, depois de um F5.

Endereço: `?relatorio=`, `?sala=`, `?periodo=dia|mes|ano|intervalo`, `?de=`, `?ate=`. Valor inválido
ou fora de faixa cai no padrão (mês corrente, todas as salas, advogados por sala) em vez de deixar a
tela em branco — mesma regra do `?ano=` de `/metrics`.

### O tempo é somado só sobre sessões encerradas, com teto de 24 horas

Duas correções que separam um relatório de uma soma ingênua:

**Sessão aberta não tem duração.** Uma liberação em andamento (`endDate === null`) conta como acesso,
mas somar seu tempo exigiria congelar um relógio que ainda corre — e o mesmo relatório, gerado dez
minutos depois, traria outro número. Sessões abertas entram na contagem de acessos e o relatório
**declara quantas eram**, para o leitor saber por que o tempo total é menor do que pareceria.

**Registro defeituoso desloca a média.** A `api-fr` aplica `MAX_PLAUSIBLE_SESSION_HOURS = 24` nas
métricas: se o serviço cai, o `auto-close-sessions` fecha as sessões expiradas depois, com
`endedAt = now`, e essa duração inflada fica gravada para sempre. Uma sessão de 30 horas desloca a
média de um mês inteiro. O mesmo teto é aplicado aqui — **espelhando o valor da `api-fr`, com o
comentário dizendo de onde ele vem**, para que uma mudança lá não deixe os dois números divergindo em
silêncio.

### O PDF é gerado do modelo de dados, não da tela

Imprimir o DOM parece mais barato e não é: a tabela na tela é paginada, então o PDF sairia com uma
página de linhas; não há como repetir o cabeçalho a cada quebra; e o navegador carimba URL e data nas
margens de um documento que vai para a diretoria.

`jspdf-autotable` recebe as mesmas linhas que a tabela recebe — todas elas — e resolve quebra de
página, cabeçalho repetido e rodapé com paginação. O cabeçalho do documento é montado no gerador:
título do relatório, período por extenso, sala, data de emissão e a contagem de linhas.

### O `.xlsx` carrega tipo, não texto

`write-excel-file` escreve célula a célula com tipo declarado, e é isso que se quer de uma planilha
que a diretoria vai reordenar e filtrar: data como `Date` (não como texto que ordena
alfabeticamente), minutos como número (para somar), e **inscrição da OAB como texto** — é campo de
texto livre no banco, e o Excel comeria um zero à esquerda ao adivinhar que é número.

### As três bibliotecas entram por `dynamic import`

`write-excel-file`, `jspdf` e `jspdf-autotable` só existem no clique de exportar. Carregá-las no
módulo da tela faria todo funcionário que **abre** os relatórios pagar o download de código que só
serve a quem **exporta**. O `import()` acontece dentro do handler, com o botão em estado de espera
enquanto o pedaço chega.

Escolha das bibliotecas e o que foi descartado (`exceljs`, `xlsx`) está na `proposal.md`.

### "Advogados por sala" e "Ranking de advogados" não são o mesmo relatório

A sobreposição é aparente e vale registrar, porque a primeira revisão vai perguntar.

O primeiro é **nominal e preso a um recorte**: quem esteve *nesta sala*, *neste período*, com
primeira e última visita — a lista que responde à diretoria e que se anexa a um processo.

O segundo é **transversal**: quem mais recorre ao serviço como um todo, em quantas salas diferentes,
com que frequência. É a leitura que sustenta política de uso e detecta o advogado que circula entre
salas para esticar a cota diária — pergunta que o primeiro, filtrado por uma sala, não pode responder.

### O ranking de salas inclui as salas paradas

Mesma decisão do card de salas de `/metrics`, pelo mesmo motivo: uma sala com zero liberações no mês
some do agrupamento, e é justamente a sala ociosa que o gestor precisa ver no comparativo. As salas
vêm de `getAllRooms`, não do histórico, e as sem movimento entram com zero.

Salas inativas continuam na lista quando tiveram movimento no período: elas saíram de operação, mas o
que aconteceu nelas continua tendo acontecido.

## Risks / Trade-offs

- **O histórico inteiro trafega a cada abertura da tela.** → Uma consulta em cache serve os três
  relatórios e todas as trocas de filtro; a tela é administrativa e esporádica. A saída definitiva —
  recorte de data na `api-fr` — está registrada como dívida na `proposal.md`, e a migração não toca
  nas agregações, que ficam isoladas em `_data/`.
- **Os números podem divergir de `/metrics` e alguém vai reparar.** → São recortes diferentes por
  desenho: `/metrics` conta por ano e limita o MEMBER às suas salas; o relatório recorta o período
  pedido e sempre enxerga todas as salas. O `reports-notice` diz isso na tela, em voz alta.
- **O fuso da Seccional está cravado em `match-period.ts` (`America/Fortaleza`), enquanto a `api-fr`
  o lê de `env.TIMEZONE`.** → Esta change reusa o formatador existente em vez de cravar o fuso num
  segundo lugar. Corrigir a origem do valor é dívida da marca branca, fora deste escopo — mas um
  relatório com o corte do dia errado erra a virada do mês, então fica registrado aqui.
- **Um período muito largo gera uma tabela de milhares de linhas.** → A tabela na tela é paginada
  pelo `DataTable`; a exportação leva o conjunto inteiro, que é o ponto dela.
- **`jspdf` embute fontes e é o maior dos três pacotes.** → `dynamic import`: quem só lê a tela não
  baixa nada.

### O calendário é do shadcn, mas mês e ano não são calendário

`Calendar` + `Popover` do shadcn (`react-day-picker`) com `locale={ptBR}` e `captionLayout="dropdown"`
atendem **dia** e **intervalo**, que são escolhas de data. O dropdown de mês e ano do próprio
calendário existe porque, sem ele, chegar a um relatório de dois anos atrás custa vinte e quatro
cliques na seta.

**Mês** e **ano** ficaram em `Select`. Numa grade de dias, escolher "março de 2025" obrigaria a
clicar num dia arbitrário para significar o mês inteiro — o componente diria uma coisa e o recorte
seria outra. O seletor diz exatamente o que o recorte é.

Uma armadilha evitada no caminho: `new Date('2025-03-12')` é interpretado como meia-noite **UTC** e
retrocede um dia em fuso a oeste. O calendário abriria marcando 11 de março para quem escolheu 12.
`date-field.tsx` monta e lê o `Date` pelas partes locais, nunca pela string ISO seca.

### A marca do PDF é vetor desenhado, não imagem embutida

O cabeçalho do PDF leva a marca do Sala Livre. Ela poderia ser um PNG em base64 e seria pior: o vetor
escala sem perda em qualquer zoom e impressão, e não cria um asset binário para versionar, converter
e manter sincronizado com `public/logo.svg`.

`brand-mark-pdf.ts` traduz os arcos `A12 12` do SVG original para curvas de Bézier — a constante
`r * 4/3 * (√2 − 1)` é a mesma que qualquer conversor de SVG para PDF usaria. Verificado no stream do
PDF gerado: oito curvas (quatro cantos mais o círculo), sete retas e as duas cores da marca
(`#16213e` no contorno, `#c0392b` na diagonal e no ponto).

Não havia conversor de SVG no ambiente (`rsvg-convert`, `inkscape`, ImageMagick, `sharp`), o que
tornou a decisão obrigatória além de preferível.

### O aviso da tela diz só o que a tela não diz

O `reports-notice` ficou com dois parágrafos. Saíram dele o recorte por papel, a sala e as sessões
abertas — tudo isso o próprio relatório já imprime no resumo, acima da tabela, e com o número
concreto do período em vez de uma frase genérica.

Restou o que evita a única pergunta que o relatório sozinho não responde: por que o tempo é menor do
que parece (sessões abertas não somam) e por que o número pode divergir de `/metrics` (que recorta
por ano e por papel).
