## Why

`/admin/rooms` era o primeiro item da seção Administração e caía na 404 — a change
`secao-administracao-por-papel` fechou a visibilidade do grupo e deixou registrado, no item 5.1 das suas
tarefas, que as cinco áreas ainda precisavam existir. Sala é a primeira delas por dependência: computador
pertence a uma sala, funcionário é vinculado a salas, liberação acontece dentro de uma sala. Sem sala
cadastrada, o painel inteiro abre vazio e não há como sair do lugar sem ir ao banco na mão.

A sala é também o objeto que carrega a regra de negócio mais visível do produto: o `standardTime` é a cota
diária que cada advogado recebe naquela sala. Um erro de digitação aqui não quebra a tela — ele muda
silenciosamente quanto tempo cada advogado tem no dia inteiro.

Do lado da `api-fr`, `POST /rooms/create` já existia e é `ADMIN`-only. Ela gera o `slug` a partir do nome
com `slugify(name, { lower: true, strict: true })` e recusa com `400` quando o slug colide — a única
validação de unicidade da sala não é o nome, é o identificador derivado dele. Quem digita "Sala 1" e
"Sala-1" acha que criou duas salas; a API vê a mesma.

## What Changes

- **Rota `/admin/rooms`** (`(private)/admin/rooms/page.tsx`): cabeçalho da área e o gatilho de cadastro. A
  listagem ainda **não** faz parte desta change.
- **Formulário de nova sala** em painel lateral (`new-room.tsx` + `new-room-schema.tsx`): nome, tempo padrão
  em minutos e descrição, validados por Zod antes de sair do navegador.
- **Prévia do identificador**: enquanto o nome é digitado, a tela mostra o `slug` que a API vai gravar
  (`maskSlug`), espelhando as mesmas etapas do `slugify` estrito — inclusive o descarte do hífen digitado,
  que faz "Sala-1" virar `sala1`.
- **Leitura do tempo padrão em horas** ao lado do campo: `180` aparece como `3h`, `90` como `1h30`.
- **`POST /rooms/create`** encapsulado em `server/rooms/create.ts`, com `description` opcional — campo em
  branco é omitido do corpo em vez de gravar string vazia.
- **Invalidação de `queryKeys.getRooms()`** depois do cadastro, para a sala nova aparecer no seletor do
  painel sem recarregar a página.
- **Componente `Textarea`** adicionado ao design system (não existia).
- **Rótulo das máquinas na grade**: `PC-01` passa a `ESTAÇÃO-01`, o termo que o balcão usa para falar da
  máquina com o advogado.

## Capabilities

### Added Capabilities
- `cadastro-de-salas`: cadastrar uma sala de liberação, com o tempo padrão que vira a cota diária de cada
  advogado e o identificador derivado do nome exposto antes do envio.

### Modified Capabilities
- `operacao-das-maquinas`: o cartão da grade passa a identificar a máquina pelo vocabulário do balcão
  ("estação"), e não pela abreviação técnica.

## Impact

- Novo: `src/app/(private)/admin/rooms/page.tsx`,
  `src/app/(private)/admin/rooms/_components/new-room.tsx`,
  `src/app/(private)/admin/rooms/_components/new-room-schema.tsx`,
  `src/server/rooms/create.ts`, `src/utils/masks/slug.ts`, `src/components/ui/textarea.tsx`.
- Alterado: `src/app/(private)/panel/_data/computer-view.ts`.
- **A tela ainda não lista salas.** Quem cadastra não vê o resultado na própria página — só o aviso de
  sucesso e, depois, o seletor do painel. Enquanto a listagem não existir, cadastrar duas vezes a mesma
  sala é um erro fácil de cometer; a defesa é o `400` da API, não a interface.
- **A prévia do identificador é uma imitação, não um contrato.** Ela reproduz hoje o comportamento do
  `slugify` estrito da `api-fr`. Se a API trocar de estratégia de slug, a prévia mente e ninguém quebra —
  nenhum teste liga as duas pontas.
- **O nome é gravado em maiúsculas pela API** (`name.toUpperCase()`), mas o aviso de sucesso repete o que
  foi digitado. A divergência aparece quando a sala reaparece no seletor do painel.
- **O teto de 480 minutos é decisão do front.** A `api-fr` aceita qualquer inteiro positivo; quem impede a
  cota de 24 horas por engano é o formulário. Um `PATCH /rooms/update/:id` feito por outra via passa por
  cima disso.
- **A prévia do produto na landing continua mostrando `PC-01`.** É uma ilustração de marketing, com nomes de
  sala fictícios, mas agora diverge do rótulo real da grade.
- O corte por papel já estava resolvido: o `proxy.ts` devolve `MEMBER` ao painel em `/admin/*` e a sidebar
  esconde a seção. Esta change não mexe em autorização.
