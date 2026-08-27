## Context

Duas rotas da `api-fr` moldam esta tela, lidas do código do servidor e não inferidas pelo que o front já
consumia:

- **`GET /employees/get-all`** é `ADMIN`-only (`checkIfEmployeeIsAdmin`), **não pagina e não aceita filtro
  algum**. Devolve `id`, `name`, `cpf`, `email`, `imageUrl`, `role`, `inactive`, `createdAt` e
  `employeesRooms`, ordenada por `createdAt` desc.
- **`POST /employees/link-with-rooms`** exige `roomIds.min(1)` e **recusa o lote inteiro com `400`** quando
  qualquer sala do payload já está vinculada — não é `skipDuplicates` na porta de entrada.

## Decisões

### O CPF chega sem máscara e a busca precisa saber disso

A `api-fr` normaliza o CPF na entrada e na saída (`cpfSchema` remove tudo que não é dígito), então a
listagem recebe `"12345678909"`. A coluna aplica `maskCpf` para exibir.

O efeito colateral está na busca: o usuário digita o que está vendo, **pontuado**. Comparar a busca crua
contra o CPF cru nunca acha ninguém. A busca tira a pontuação antes de comparar, e "123.456" encontra o
mesmo que "123456".

### O vínculo é encadeado, não atômico

`create-account` e `link-with-rooms` são duas requisições. Se a primeira passa e a segunda falha, o
colaborador existe sem sala — estado válido, recuperável pela própria tela, e por isso aceitável.

O contrário não seria: por isso o vínculo é **opcional** no formulário. `roomIds: []` significa "cadastra e
pronto", e nenhuma segunda requisição sai. O vínculo é conveniência do cadastro, não requisito dele.

### `employeesRooms` alimenta o diálogo, não a listagem

A coluna de salas foi construída e **retirada**: a listagem não a mostra. A informação de vínculo pertence
às ações — é coisa que se edita, não que se confere de relance, ao contrário da equipe na tabela de salas,
onde a pergunta "quem responde por esta sala" se faz olhando a linha.

O campo continua vindo do servidor porque o diálogo de vínculo precisa do estado atual para enviar apenas o
delta. Sem ele, remarcar uma sala já vinculada derrubaria o lote inteiro no `400` descrito acima.

### Por que não inverter `GET /rooms/get-all`

Aquela rota já traz `employeesRooms` embutido em cada sala, e inverter o mapa no cliente pareceria evitar
uma mudança no servidor. Não serve, por três motivos:

1. Ela **filtra os vínculos por colaborador ativo**. Correto lá — quem saiu da OAB não é equipe da sala no
   painel de operação — e errado aqui: todo colaborador desativado apareceria sem sala nenhuma, justamente
   onde se confere o vínculo antes de reativá-lo.
2. Ela é **escopada por papel** (MEMBER só vê salas ativas em que participa), enquanto a listagem de
   colaboradores é `ADMIN`-only.
3. Amarraria a tela ao cache de salas, inclusive na invalidação após vincular.

### Sala inativa continua vindo no vínculo

Pedido deliberado à `api-fr`: desativar uma sala não desfaz o vínculo no banco. Omiti-lo faria o diálogo
propor um vínculo que já existe e cair no `400`. O campo `inactive` acompanha cada sala para a tela decidir
como sinalizar.

## Riscos

- **Sem paginação.** A lista vem inteira e a busca é no cliente. Aceitável para a ordem de grandeza da
  equipe (dezenas); vira problema junto com o mesmo limite já registrado em salas e computadores.
- **A senha inicial continua sendo digitada por terceiro e enviada por e-mail em texto** — herdado de
  `cadastro-de-colaboradores`, sem mudança aqui.
