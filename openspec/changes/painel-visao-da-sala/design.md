## Context

O painel chegou até aqui com moldura, sessão e menu do usuário, e com `/panel` respondendo um `<h1>`.
Esta change ocupa esse espaço com a primeira tela de operação.

A fonte é `GET /rooms/get-all`, que devolve cada sala com `standardTime`, `employeesRooms` (o vínculo
funcionário↔sala) e `computers`. O escopo por papel já vem resolvido pela API — o painel recebe apenas o
que o funcionário pode ver.

O método de construção seguiu o padrão do repositório: montar a tela com dados fake, acertar o desenho e
só então trocar a fonte pela API. Esta change foi comitada no meio dessa troca — a faixa da sala já lê a
API, a grade de computadores ainda não foi montada.

## Goals / Non-Goals

**Goals**
- Escolher entre as salas do escopo do funcionário, com a primeira sala ativa já selecionada.
- Mostrar quem responde pela sala e qual é a cota diária, antes de qualquer ação sobre máquina.
- Comunicar que a liberação manual é exceção, não o fluxo normal.
- Deixar prontos os primitivos (`Select`, `Dialog`, `AlertDialog`) que o resto do painel vai reaproveitar.

**Non-Goals**
- Montar a grade de computadores no quadro (as peças existem, a montagem fica para a próxima change).
- Liberar computador manualmente — a `api-fr` não tem a rota.
- Tempo real. Sem eventos de negócio no WebSocket, o estado é o do momento da requisição.
- Paginação de salas: a API não oferece, e o volume por Seccional não pede.

## Decisions

### A sala inativa sai da lista, não aparece desabilitada

`GET /rooms/get-all` devolve salas inativas junto com as ativas. O quadro as remove antes de montar o
`Select`. Uma sala fora de operação não tem nada a oferecer ao funcionário, e listá-la desabilitada só
gera a pergunta "por que não posso escolher esta?". O corte é feito em um lugar só, e o mesmo array
filtrado alimenta a seleção e o padrão.

Consequência aceita: se **todas** as salas estiverem inativas, a tela cai no estado vazio — mesmo texto de
quem não tem sala nenhuma. É o desfecho certo do ponto de vista de quem opera (não há o que fazer aqui),
ainda que a causa seja diferente.

### O padrão é derivado, não gravado no estado

O estado guarda `selectedRoomId: string | null` e a sala exibida é
`rooms.find(...) ?? rooms.at(0)`. A alternativa — gravar a primeira sala no estado com um `useEffect`
assim que os dados chegam — introduz um render com o quadro montado e nenhuma sala escolhida, e um
efeito que precisa saber não sobrescrever a escolha do usuário depois.

Derivar resolve os dois: no primeiro render válido já existe sala, e a escolha do usuário sempre vence
porque o `find` roda antes do `at(0)`. O fallback também cobre a sala que desaparece da lista entre dois
`fetch` (foi inativada por um `ADMIN`, por exemplo): em vez de tela quebrada, volta para a primeira sala.

### O vínculo não é o funcionário

`employeesRooms` é a tabela de junção: um mesmo funcionário pode ter mais de um registro para a mesma sala,
e aí o avatar dele apareceria duas vezes. `RoomEmployees` reduz por `employees.id` com um `Map` antes de
renderizar. É defesa contra o dado, não contra a interface — o painel não controla como o vínculo foi
criado.

Acima de quatro avatares a fileira encosta no `Select` no desktop, então o excedente vira `+N` com os
nomes no tooltip. Zero colaboradores não renderiza nada: um rótulo "Colaboradores" sobre o vazio é pior
que a ausência.

### Aviso antes de ação, e só no desktop

O bloco de aviso vem antes do quadro porque corrige uma premissa: quem abre esta tela tende a achar que
é aqui que se libera computador. O aviso é `hidden sm:flex` — no celular, três parágrafos empurrariam a
sala para baixo da dobra, e o funcionário que abre o painel no celular está no balcão, já sabendo o que
faz.

### Estados de carregamento com o desenho do resultado

O `skeleton` do quadro reproduz a estrutura final (rótulo + campo à esquerda, avatares + linha de cota à
direita) em vez de um retângulo genérico. Sem isso a faixa muda de altura quando os dados chegam e empurra
o conteúdo abaixo dela.

Erro e vazio são distinguidos: "não foi possível carregar" pede nova tentativa; "nenhuma sala ativa" é um
fato sobre o cadastro, e insistir não muda.

### Fuso fixo nas datas do card

`ComputerCard` formata data com `timeZone: 'America/Fortaleza'`. O card é client component, mas o Next
também o renderiza no servidor — e servidor em UTC formataria hora diferente da do navegador, o que o
React acusa como erro de hidratação. Pela mesma razão, `_data/rooms.ts` não usa `new Date()` nem
`Math.random()`: os dados fake são constantes.

### Tempo como relógio, não como número

`formatMinutesAsClock` transforma `72` em `01:12`. No balcão o tempo é lido de relance, e "72 minutos"
exige conversão mental. A barra ao lado do número existe para a leitura ainda mais rápida: o número diz
quanto falta, a barra diz se é muito ou pouco.

### Botão desabilitado dentro de um `span`

No `ComputerCard`, "colocar em manutenção" fica desabilitado enquanto a máquina está em uso. Botão
desabilitado não dispara evento de ponteiro, então o tooltip que explica o bloqueio nunca abriria. O
gatilho é um `span` em volta do botão.

### Validação de data que rejeita 31/02

O schema do formulário de liberação não para na regex `dd/mm/aaaa`: monta o `Date` e compara os campos de
volta. `new Date(2000, 1, 31)` normaliza para 02/03 silenciosamente, e a regex sozinha aceitaria. Também
rejeita data futura.

### Descrição longa da sala não estoura o popup

O popup do `Select` tem largura travada em `w-(--anchor-width)` e `overflow-x-hidden`, e o `ItemText` do
base-ui herda `whitespace-nowrap` com `min-width: auto` — uma descrição longa viraria uma linha única
cortada a seco. O item recebe `min-w-0` (zera a contribuição de largura mínima do conteúdo),
`whitespace-normal` na descrição (para poder quebrar) e `line-clamp-2` (duas linhas com reticências, altura
previsível na lista). O nome fica em `truncate`, uma linha só.

O nome da sala é exibido em caixa normal. No painel, `uppercase` é o marcador de rótulo — o valor não
compete com a etiqueta acima dele, e caixa alta prejudica a leitura de nome longo.

## Risks / Trade-offs

- **A grade não está montada.** `ComputerCard`, `StatusSummary` e os diálogos existem sem serem
  importados. Compilam e não são exercidos por ninguém — código sem uso envelhece rápido. Mitigação: a
  próxima change monta a grade; até lá, ficam registrados aqui como pendência explícita.
- **Dois modelos de computador.** A API entrega `inUse` e `maintenance` como booleanos independentes; as
  peças da grade esperam um `status` de três valores. Montar a grade exige uma tradução e uma decisão sobre
  o caso `inUse && maintenance`, que os booleanos permitem representar e o `status` não.
- **`maintenance` e `inactive` são anuláveis.** `boolean | null` na resposta: qualquer leitura precisa
  tratar `null` como falso, e não confiar em `!campo`.
- **Liberação manual sem destino.** O diálogo valida CPF, OAB e data e não envia nada. Fica pronto para
  quando a rota existir na `api-fr`.
- **Estado congelado.** Sem WebSocket e sem polling, uma máquina liberada em outra ponta não aparece até
  a próxima requisição. Aceito nesta change porque ainda não há grade para desatualizar.
- **Sem paginação.** `GET /rooms/get-all` traz todas as salas com todos os computadores e vínculos em uma
  resposta. Suporta o volume atual; vira problema se a Seccional crescer muito.

## Migration Plan

Change aditiva. `/panel` era placeholder e ninguém dependia do conteúdo dele. Os três primitivos novos não
alteram os existentes. A troca de `min-w-[96px]` por `min-w-24` no `dropdown-menu.tsx` é o mesmo valor
computado (96px), escrito na escala do Tailwind.

## Open Questions

- `inUse && maintenance` ao mesmo tempo: qual estado ganha na interface? (a API permite os dois)
- Polling de quantos segundos, enquanto não há eventos de negócio no WebSocket?
- A cota diária é por sala; o saldo restante do advogado vem de qual leitura, na hora de montar o card?
