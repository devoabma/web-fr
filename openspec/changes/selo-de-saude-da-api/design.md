## Contexto

O selo vive no cabeçalho do painel, visível em todas as telas privadas. Quem o lê é o funcionário no
balcão, de canto de olho, enquanto faz outra coisa. Ele não é um monitor: não precisa de precisão de
segundos nem de histórico. Precisa de uma coisa só — não mentir.

## Decisões

### Por que `/ready` e não `/health`

O `/health` da `api-fr` responde `200` sem tocar no banco, de propósito: quem o consome é o
`HEALTHCHECK` do Dockerfile, e para o orquestrador "não saudável" significa **reinicie o contêiner**.
Reiniciar a API não conserta banco fora do ar — derruba os WebSockets dos Desktops das salas e, se a
queda durar, vira laço de reinício.

Fazer o `/health` consultar o banco resolveria o selo e criaria esse problema. Por isso a separação
ficou do lado da API: `/health` para vivacidade (do Docker), `/ready` para prontidão (deste selo). O
painel lê a segunda.

### Timeout de 8s, contra a ausência de timeout global

O cliente axios do projeto não define `timeout`. Está certo para rotas de dado: numa rede ruim, esperar
é melhor do que abortar uma leitura que ia chegar. Para a sonda, o oposto — sem teto, uma API que
aceita a conexão e nunca responde deixaria o selo em `Verificando` indefinidamente, que é a única
leitura pior do que um selo errado.

Os 8s são folgados de propósito: a sondagem do outro lado desiste do banco em 3s e responde `503`. O
teto daqui existe para o caso em que a resposta não vem de jeito nenhum.

### Três estados, não dois

`isPending` tem estado próprio (`Verificando`, cinza) em vez de cair no verde. É na primeira carga que
um verde chapado mentiria com mais confiança — antes de qualquer resposta, não se sabe nada.

Do lado do erro, `5xx`, timeout, DNS, rede caída e CORS colapsam num único `Sem conexão`. Para quem
opera o balcão a distinção não muda a atitude: o painel não vai responder até aquilo voltar.

### Data de impressão: por que o `Intl` continua, contra a convenção

As outras tabelas formatam data com `format(date, 'dd MMM. yyyy', { locale: ptBR })` do date-fns. A de
impressões não passou a usar isso, mesmo tendo adotado o mesmo desenho visual.

O date-fns v4 formata no fuso da máquina — o suporte a fuso mora no pacote `@date-fns/tz`, que não está
instalado. Nas outras tabelas o campo é `createdAt` de cadastro, e um dia de diferença não muda nada.
Aqui muda: uma impressão às 22h em `America/Fortaleza` apareceria no dia seguinte para quem estivesse
com o relógio em outro fuso, e o selo "Hoje" sumiria junto.

A solução foi manter o `Intl` com o fuso fixo e remontar as partes: o pt-BR devolve `28 de ago. de
2026`, e descartar os literais deixa `28 ago. 2026` — idêntico ao date-fns, porque o ponto já vem no
nome curto do mês (conferido nos doze).

## Alternativas descartadas

- **Ler `/health` e aceitar a lacuna.** Selo verde com o Postgres fora é exatamente a mentira que
  motivou a mudança.
- **Fazer o `/health` consultar o banco.** Custaria o laço de reinício descrito acima.
- **Migrar a data de impressões para date-fns por consistência.** Consistência visual foi alcançada sem
  pagar a correção do fuso.
- **Tratar `429` como estado próprio.** Inalcançável na operação atual (exigiria 30+ abas simultâneas
  atrás do mesmo IP); ficou registrado no *Impact* em vez de virar código.

## Riscos

- **Acoplamento a uma rota da `api-fr`.** Se o `/ready` for renomeado ou removido, o selo passa a
  acusar queda permanente. É um `404` lido como erro, sem distinção.
- **Uma requisição a cada 30s por aba aberta.** Barata e isenta de custo de banco além de um `SELECT 1`,
  mas some do orçamento de rate limit por IP, que é compartilhado por toda a Seccional atrás do NAT.
