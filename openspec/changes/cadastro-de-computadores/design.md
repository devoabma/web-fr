## Context

`cadastro-de-salas` fechou a raiz do modelo e deixou `/admin/computers` na lista de pendências. A sidebar já
levava para lá desde `secao-administracao-por-papel`; o link caía na 404.

A `api-fr` já expunha as três rotas necessárias, todas `ADMIN`-only:

- `POST /computers/create` — `macCode`, `number`, `description`, `roomId`. `number` é único por sala.
- `GET /computers/get-all` — inventário com a sala embutida. Aceita `roomId` e `description` como filtro;
  **não pagina**.
- `DELETE /computers/delete/:id` — remoção real, em cascata. Recusa com `400` a máquina `inUse`.

O que não existe: `PATCH /computers/update/:id`. Não há como corrigir um cadastro — só refazer.

## Goals / Non-Goals

**Goals**

- Cadastrar, listar e excluir máquinas pela interface.
- Reduzir a chance do erro de digitação no MAC, que deixa a estação inoperante sem dizer por quê.
- Evitar a colisão de `number` antes de a API precisar recusar.
- Deixar a exclusão difícil o bastante para o clique errado não custar o histórico.

**Non-Goals**

- Editar computador — a API não expõe a rota.
- Alternar manutenção por esta tela; quem faz isso é a grade do painel.
- Paginar ou filtrar no servidor.
- Verificar se o MAC informado corresponde a uma máquina real.

## Decisions

### A listagem nasce junto com o cadastro

`cadastro-de-salas` entregou o formulário sem a lista, e o próprio documento registrou o custo: quem cadastra
não vê o resultado, e repetir o cadastro vira erro fácil. Aqui a tela já abre com a tabela, no mesmo desenho
de `rooms-table.tsx` — busca acima, `DataTable` abaixo, aviso de falha no lugar da tabela.

### A busca é por sala *ou* descrição, e roda no cliente

O balconista procura de duas formas: "todas as máquinas da Sala 2" e "aquela COMPUTADOR 03". A rota da API
filtra por `roomId` (identificador, não nome) e por `description` — nenhum dos dois cobre o primeiro caso, e
usar os dois exigiria dois requests. Como a rota também não pagina, o inventário inteiro já vem de qualquer
jeito: filtrar no cliente é um request só e nenhuma ida ao servidor por tecla.

A paginação da tela é a do `DataTable`, herdada de `/admin/rooms` — a primitiva já resolve isso e não há
nada a decidir aqui. O que fica em aberto é só o transporte: o dia em que o inventário crescer, quem precisa
paginar é a API, não a tabela.

### Manutenção vence `inUse` na coluna de situação

Os dois estados são independentes no banco: uma máquina pode ter `maintenance` preenchido e `inUse` ainda
`true` de uma sessão anterior. Mostrar "Em uso" nesse caso manda o balconista tentar encerrar uma sessão que
não está de pé. A hierarquia é: manutenção primeiro, depois em uso, depois disponível.

### O seletor de sala só lista sala ativa

Sala inativa não recebe liberação. Cadastrar máquina nela produz inventário que nunca vai ser usado e que
some do painel — o administrador só descobre depois. Filtrar por `room.inactive === null` no seletor evita o
cadastro sem valor; quando não há nenhuma sala ativa, o botão de envio também cai, com a explicação abaixo do
campo em vez de um formulário que não vai a lugar nenhum.

### O próximo número livre é sugerido, não imposto

`number` é único por sala e a recusa da API — "Já existe um computador com esse número nesta sala." — só
chega depois do envio. Trocar de sala preenche o campo com `maior + 1` e lista abaixo os números já em uso.
É `maior + 1` e não o primeiro buraco porque o comportamento previsível vale mais do que a numeração densa:
quem cadastra a quinta máquina espera o 5, não o 3 que sobrou de uma exclusão.

O `setValue` vai com `shouldValidate` porque o campo pode estar com erro de um envio anterior — sem
revalidar, a mensagem antiga fica na tela embaixo do campo que a troca de sala acabou de preencher com um
valor válido.

### O MAC tem máscara na digitação e normalização no schema

São dois papéis diferentes. A máscara (`maskMacCode`) atua a cada tecla: descarta o que não é hexadecimal,
corta em 12 dígitos, sobe para maiúscula e agrupa de dois em dois com hífen. Ela é o que faz o campo ficar
legível enquanto se digita e o que impede o dedo errado de entrar.

O schema (`macCodeSchema`) atua no envio e resolve o outro problema: MAC é escrito de várias formas por aí —
`00:1A:2B`, `001a.2b3c`, com espaço, sem nada. Um MAC colado de um inventário externo não pode ser recusado
por causa do separador. Ele normaliza para os 12 hexadecimais, valida, e só então reaplica o formato com
hífen que a API grava. Colar e digitar chegam ao mesmo lugar.

### A exclusão pede a descrição digitada

Sala tem inativação; computador não. `DELETE /computers/delete/:id` apaga o registro e, em cascata, o
histórico de sessões e as impressões da máquina. Um clique errado numa tabela é barato demais para uma ação
dessas — daí a confirmação por digitação, no lugar do "tem certeza?".

A conferência ignora caixa e espaço nas pontas: o atrito serve para o administrador reler o nome da máquina,
não para brigar com o teclado.

### Máquina em uso usa `aria-disabled`, não `disabled`

A API recusa com `400` a exclusão de máquina `inUse` — a sessão do advogado precisa ser encerrada antes.
Bloquear no cliente evita a ida inútil, mas botão `disabled` não dispara `hover`, e o tooltip é justamente o
que explica por que a ação está fora do ar. Com `aria-disabled` o botão continua focável e anunciado, o
`onClick` não abre o diálogo, e o motivo aparece.

### `queryKeys.getComputers()` é invalidada também pelo painel

Cadastro e exclusão invalidam duas listas: a tabela desta tela (`/computers/get-all`) e o inventário
embutido em `/rooms/get-all`, que alimenta a grade do painel e a sugestão de próximo número livre.

O caminho inverso também vale: alternar manutenção pela grade muda o estado que a coluna de situação
apresenta. O `refreshBoard` do painel passa a invalidar `getComputers()` junto. Como o painel é operado por
`MEMBER` e `/computers/get-all` é `ADMIN`-only, a invalidação de uma query que não está montada não dispara
request nenhum — não há risco de `401`.

## Risks / Trade-offs

- **Não há edição, e o MAC errado deixa a máquina inoperante.** A estação aparece na grade mas nunca fica
  online, e a liberação segue desabilitada — o funcionário não consegue usar aquela máquina de jeito nenhum.
  A correção é excluir e recadastrar, levando o histórico junto. A change não tem como mitigar isso; depende
  de `PATCH /computers/update/:id` na `api-fr`.
- **Filtro em memória sobre o inventário inteiro.** A tabela pagina, mas a API manda tudo. Aceitável no
  tamanho atual; vira problema de transporte quando crescer.
- **A confirmação por digitação é só de interface.** Ela protege do clique errado, não da chamada direta.
- **A colisão de `number` continua possível** entre duas abas ou dois administradores simultâneos.
- **Rota administrativa nova sem cobertura de teste automatizado**, como todas as outras do painel.

## Open Questions

- A `api-fr` deveria expor `PATCH /computers/update/:id`, nem que fosse só para `description`?
- A listagem administrativa deveria alternar manutenção, ou isso é sempre decisão de quem está no balcão?
- `GET /computers/get-all` deveria paginar e aceitar busca por nome de sala, tirando o filtro do cliente?
- A exclusão deveria virar inativação, como na sala, para preservar o histórico de sessões e impressões?
