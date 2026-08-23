## Context

A sala é a raiz do modelo: computador pertence a uma sala, funcionário é vinculado a salas, sessão de
advogado acontece em um computador de uma sala. Enquanto não houvesse cadastro de sala pela interface, todo
ambiente novo começava com um `INSERT` na mão.

A `api-fr` já expunha `POST /rooms/create` (`ADMIN`-only), com um corpo de três campos — `name` obrigatório,
`standardTime` e `description` opcionais — e uma regra de unicidade que não é do nome: o `slug` derivado
dele por `slugify(name, { lower: true, strict: true })`. Colisão de slug volta como `400` com
`"Sala com esse nome já cadastrada."`.

Esta change entrega apenas o cadastro. Listagem, edição e ativação/inativação continuam pendentes na seção 5
do roadmap.

## Goals / Non-Goals

**Goals**

- Cadastrar sala pela interface, sem passar pelo banco.
- Deixar visível, antes do envio, o identificador que a API vai gravar — a unicidade depende dele.
- Traduzir `standardTime` de minutos para a leitura que o administrador tem na cabeça (`3h`, `1h30`).
- Impedir que um erro de digitação vire cota do dia inteiro.

**Non-Goals**

- Listar, editar, ativar ou inativar salas.
- Vincular funcionários ou cadastrar computadores na mesma tela.
- Autorização: quem corta o `MEMBER` é o `proxy.ts` e, definitivamente, a `api-fr`.
- Sincronizar a ilustração da landing com o rótulo novo da grade.

## Decisions

### O `slug` não viaja no corpo — só a prévia

A `api-fr` deriva o slug do nome. Mandar um `slug` do formulário seria inventar um campo que a rota não lê.
Mas esconder o identificador tem custo: a mensagem de recusa fala em "nome já cadastrado" enquanto a colisão
real é de slug, e "Sala 1" versus "Sala-1" colidem sem que nada na tela explique por quê.

A saída é mostrar, não enviar: `maskSlug(name)` reproduz as etapas do `slugify` estrito e aparece como
descrição do campo de nome. É uma imitação deliberada — a fonte da verdade continua no servidor.

### `maskSlug` imita o `strict`, hífen digitado incluído

O `slugify` com `strict: true` derruba tudo que não é letra, número ou espaço **antes** de trocar espaço por
hífen — o hífen que o usuário digitou cai junto. Por isso "Sala-1" vira `sala1`, e a máscara faz o mesmo em
vez de "melhorar" o resultado. Uma prévia que embeleza é pior que nenhuma: ela promete um identificador que
o banco não vai ter.

Pelo mesmo motivo não há corte de tamanho na máscara. O nome já é limitado a 60 caracteres no formulário, e
truncar a prévia em 40 faria a tela mostrar um slug que a API não grava.

### Teto de 480 minutos no formulário, não na API

A `api-fr` aceita qualquer inteiro positivo. Oito horas é o limite que faz sentido para uma cota diária de
sala de advogado; acima disso, o número quase certamente é engano de digitação. A regra mora no formulário
porque é uma decisão de produto desta interface, não do contrato — e fica registrado que ela **não** protege
uma alteração feita por outra via.

### A leitura em horas fica ao lado do campo, não no lugar dele

O campo continua sendo minutos, porque minuto é o que a API recebe. O que muda é a conferência: `180` sem
tradução exige aritmética mental de quem cadastra; `3h` ao lado dispensa. O quadro usa `aria-live="polite"`
para que a conversão também chegue a quem não vê a tela.

`Number.isFinite` antes da conta porque campo numérico vazio chega como `NaN` no react-hook-form — sem a
guarda, o quadro exibiria `NaNh`.

### Descrição em branco é omitida do corpo

`description` é opcional na API. Mandar `''` gravaria string vazia no banco, e o painel trata ausência de
descrição como `null`. Enviar `undefined` mantém as duas pontas com a mesma noção de "sem descrição".

### O erro da API é o texto que aparece

Mesmo padrão já usado no diálogo de troca de senha: `getApiErrorMessage` com um texto genérico de reserva, e
`getRetryAfterInSeconds` para o `429`. A `message` da `api-fr` é o que explica a recusa — "Sala com esse nome
já cadastrada." diz mais do que qualquer texto fixo que a tela pudesse inventar. O foco volta ao campo de
nome porque é o campo que a API recusa na prática.

### Fechar o painel lateral no meio do envio é bloqueado

O `onOpenChange` ignora o fechamento enquanto a requisição está de pé. Sem isso, o `reset()` limparia o
formulário com a chamada em curso e o aviso de erro chegaria a uma tela sem os dados para corrigir. Pelo
mesmo motivo o botão fica desabilitado durante o envio: dois cliques disparam dois `POST`, e o segundo volta
como "sala já cadastrada" logo depois de a sala ter sido criada com sucesso.

### `ESTAÇÃO-01` no lugar de `PC-01`

O rótulo da grade é lido em voz alta no balcão — "vai para a estação 3". `PC` é abreviação de manual
técnico. A mudança é de vocabulário, não de dado: o número continua vindo de `computer.number`.

## Risks / Trade-offs

- **Cadastrar sem listar deixa o administrador sem confirmação visual.** Mitigado pelo aviso de sucesso e
  pela invalidação do seletor do painel; resolvido de verdade só quando a listagem existir.
- **A prévia do slug e o `slugify` da API podem divergir em silêncio.** Nenhum teste liga as duas pontas;
  qualquer troca de estratégia no servidor exige revisitar `maskSlug`.
- **O nome sobe como digitado e é gravado em maiúsculas.** O aviso de sucesso mostra a forma digitada, o
  seletor do painel mostra a forma gravada.
- **Rota administrativa nova sem cobertura de teste automatizado**, como todas as outras do painel.

## Open Questions

- A listagem entra na mesma tela, com o painel lateral virando edição, ou o cadastro vira rota própria?
- O teto de 480 minutos deveria subir para a `api-fr`, para valer também no `update`?
- A prévia do produto na landing deve acompanhar o vocabulário do painel, ou permanece uma ilustração livre?
