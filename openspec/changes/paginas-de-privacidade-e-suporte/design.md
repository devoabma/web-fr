# Design

## Por que o texto veio do schema, e não de um modelo pronto

Política de privacidade genérica é fácil de escrever e inútil de ler: ela lista "dados de navegação"
e "cookies" e não diz o que o produto guarda de fato. A seção 2 foi montada a partir do que o schema
da `api-fr` realmente persiste, conferido no repositório irmão:

| Onde | O que o Sala Livre guarda | Onde aparece na política |
| --- | --- | --- |
| Advogado que pede liberação | CPF, data de nascimento, inscrição na OAB, situação cadastral | 2.1 |
| Sessão de uso | início, fim, sala e computador | 2.1 |
| Funcionário / administrador | nome, CPF, e-mail, foto, papel, salas vinculadas | 2.2 |
| Computador | identificação, MAC, sala, situação de uso e de manutenção | 2.3 |
| Impressão | arquivo enviado + sessão e equipamento de origem | 2.4 |

O MAC merece o destaque que tem em 2.3: é identificador de equipamento, não de pessoa, mas atrelado
ao histórico de sessões ele passa a permitir reconstruir quem usou o quê. Omitir seria descrever o
produto pela metade.

A validação cadastral externa também está dita com todas as letras (2.1, último parágrafo). A
liberação depende de conferir os dados informados contra base de terceiro, e transferência para
sistema externo é exatamente o tipo de coisa que o titular tem direito de saber sem precisar
perguntar.

## O suporte é organizado pela tela, não pelo sistema

Quem procura a página de suporte está olhando para uma mensagem de erro. Por isso a parte 1 não se
organiza por módulo do sistema — cada subseção tem por título **a situação que a pessoa está vendo**,
e as seis espelham uma a uma as recusas que a `api-fr` devolve na liberação: dados que não conferem,
cadastro inativo, condição de acesso não atendida, computador em manutenção, computador em uso,
sessão já ativa e limite de uso atingido.

O texto evita prometer o que varia por instalação. As regras de cota, o tempo de sessão e as
condições extras de acesso são configuráveis por ambiente, então as frases dizem "conforme as regras
configuradas para o ambiente" em vez de cravar números que estariam errados na próxima seccional.

## Por que `/status` foi removido em vez de virar uma página

Uma página de status pública só vale se for servida por monitoramento independente do próprio sistema
— se ela cai junto com o que deveria monitorar, é decoração. Não há essa infraestrutura aqui, e
montar uma tela que consulta `GET /health` do próprio domínio reproduziria o problema que a change
`selo-de-saude-da-api` resolveu: um indicador incapaz de reportar a própria queda.

A saúde da API já é mostrada onde ela importa — no cabeçalho do painel, para quem opera o balcão.
O link do rodapé saiu junto com a rota em `PUBLIC_ROUTES`, e não só do JSX: uma rota pública sem
página é uma 404 pública que qualquer um alcança.

## `LegalPage` como casca, com seis blocos de texto

A alternativa seria `@tailwindcss/typography` com `prose`. Foi descartada: o `prose` traz uma escala
tipográfica inteira que não é a da landing, e alinhar as duas viraria uma lista de `prose-headings:…`
maior do que os seis componentes que existem hoje. Além disso entraria uma dependência para
estilizar duas páginas.

Os blocos são deliberadamente burros — `LegalSection`, `LegalSubsection`, `LegalText`, `LegalStrong`,
`LegalList` e `LegalContact` não têm lógica, só carregam o ritmo tipográfico. O conteúdo mora nas
páginas, em JSX legível, onde um advogado consegue apontar a frase a corrigir.

`LegalContact` é o único bloco com peso visual próprio, e de propósito: o canal de atendimento é a
única ação concreta das duas páginas. A LGPD espera que o titular ache o contato sem ler o documento
inteiro, e um `mailto:` no meio de um parágrafo não atende isso.

`updatedAt` é opcional porque só a política versiona data. O suporte é guia vivo — carimbar uma data
nele sugeriria que o conteúdo tem validade jurídica que não tem.

## O mockup do painel virou print

`dashboard-preview.tsx` tinha 144 linhas: um tipo `ComputerStatus`, um mapa `statusStyles` com seis
variações por estado, um array de oito computadores falsos e a grade que os desenhava. Todo esse
código existia para parecer o painel — e desatualizava a cada mudança no painel de verdade, sem
nenhum teste para avisar.

O print resolve o mesmo problema com um `next/image`. Fica `priority`, porque é o LCP da landing, e
com `sizes` declarado para o navegador não baixar a versão de 1600px num celular.

**`quality={100}` foi removido.** No Next 16 o default de `images.qualities` passou a ser `[75]`, e
um `quality` fora da lista é **coagido silenciosamente para o valor mais próximo**
(`node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md:804`). O prop não fazia nada:
o código pedia 100 e o build entregava 75, sem aviso. Ficar com o 75 explícito no default é honesto e
não muda um pixel do que já era servido. Se um dia o texto do print sair com artefato, o caminho é
declarar `images.qualities: [75, 100]` no `next.config.ts` — e aceitar o peso maior num LCP.

## Convenção de URL confirmada

`/privacy` e `/support`, e não `/privacidade` e `/suporte`. É a convenção do repositório — URL em
inglês, rótulo em português — a mesma de `/panel`, `/releases` e `/downloads`. A task 9.2 da change
`landing-page-institucional` tinha registrado os caminhos em português; foi corrigida.

Os dois caminhos precisam continuar casando com `PUBLIC_ROUTES`. Sob a regra de negar por padrão do
`proxy.ts`, renomear a pasta sem mexer na lista não dá 404: manda o visitante para o login, que é bem
mais confuso. O comentário no topo do `footer.tsx` existe para segurar isso.
