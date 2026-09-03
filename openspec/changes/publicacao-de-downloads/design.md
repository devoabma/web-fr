# Design

## Contrato conferido no repositório irmão

Antes de escrever qualquer cliente, as cinco rotas foram lidas em
`api-fr/src/http/core/downloads/` e o registro em `api-fr/src/http/routes/index.ts`:

| Método | Rota | Papel | Notas |
| --- | --- | --- | --- |
| `POST` | `/downloads/create` | ADMIN | `201` com `{ downloadId }`; `400` quando já há ativo do mesmo tipo |
| `GET` | `/downloads/get-all` | logado | ADMIN recebe **também os inativos**; demais papéis só os ativos |
| `PATCH` | `/downloads/update/:id` | ADMIN | corpo parcial; `description` e `version` aceitam `null` |
| `PATCH` | `/downloads/activate/:id` | ADMIN | `400` se já houver outro ativo do mesmo tipo |
| `PATCH` | `/downloads/deactivate/:id` | ADMIN | soft delete: grava a data em `inactive` |

Três decisões da `api-fr` atravessam a tela inteira e não foram reinterpretadas aqui:

1. **Um ativo por tipo** (`helpers/ensure-single-active.ts`), checado *antes* de gravar.
2. **`kind` não é editável** — trocar o tipo é cadastrar outro registro.
3. **O recorte por papel é do servidor**, não do painel: o `where` de `get-all` é
   `role === 'ADMIN' ? {} : { inactive: null }`.

> ⚠️ Este bloco existe porque duas changes anteriores erraram por não abrir a `api-fr`:
> `cadastro-de-computadores` inventou uma lacuna que não existia, e `atualizacao-remota-do-desktop`
> inventou um caminho de rota. O repositório irmão está a um `grep` de distância.

## Um slot por tipo, e não uma lista

A escolha central da tela. A alternativa óbvia — listar o que a `api-fr` devolve — é pior por três
motivos:

- **A regra fica invisível.** Numa lista, "um ativo por tipo" é um texto no aviso. Em slots, é a
  forma da tela: existem dois lugares, e cada um está ocupado ou vazio.
- **A duplicidade patológica fica visível.** Dois instaladores ativos (uma corrida entre dois ADMIN
  ainda pode produzir o que a checagem tenta impedir) apareceriam na lista como duas linhas
  igualmente plausíveis. No slot, o segundo não tem onde caber.
- **O botão de publicar ganha lugar certo.** Ele mora **no slot vazio**: só se oferece publicar o que
  não esbarra em nada, e o `kind` vem do slot em vez de um seletor que permitiria escolher um tipo
  ocupado para tomar `400` depois.

O `find` que escolhe o ativo de cada tipo confia na ordenação que a `api-fr` já aplica
(`kind asc`, `createdAt desc`): mesmo no caso patológico, o mais recente é o que aparece.

## O papel vem do cookie, no servidor

`page.tsx` é `async` e lê a sessão com `readSession(cookieStore.get(SESSION_COOKIE_NAME)?.value)`,
como o layout do painel. Sem sessão legível, trata como **MEMBER** — menor privilégio.

Isso não é controle de acesso, e o comentário no arquivo diz isso: quem autoriza continua sendo o
`proxy.ts` e a `api-fr`, que só devolve inativos e só aceita escritas de ADMIN. O papel no servidor
resolve outra coisa — o HTML já sai com as ações certas, sem o piscar de um botão de gestão que
aparece e some no navegador de quem não pode usá-lo.

## Conferir o endereço no cliente, de novo

`_data/download-link.ts` roda o `URL` sobre o valor e devolve `null` para qualquer coisa que não seja
`http:`/`https:`. É validação repetida de propósito, e o motivo não é desconfiança do servidor:

A `api-fr` fecha o protocolo **na entrada**. Um registro gravado antes dessa regra existir, ou colado
direto no banco, atravessaria a listagem e viraria `href`. E `href` não é um campo de exibição: um
`javascript:` ali é script executando no navegador de quem só queria o instalador. O custo da
conferência é uma chamada de `URL` por card; o custo de não fazê-la é XSS.

O mesmo parse alimenta o que a tela mostra: `host` responde "isto veio de quem?" e `fileName`
responde "baixei a coisa certa?" — com `decodeURIComponent`, porque o nome viaja escapado e é lido
por gente. O endereço inteiro fica no tooltip: ele é longo e roubaria a linha do nome.

## `null` limpa, `undefined` mantém

A `api-fr` distingue os dois com `!== undefined` em `description` e `version`. O painel respeita a
distinção nos dois sentidos:

- **Cadastro**: campo vazio vira `undefined` e some do corpo — o registro nasce com `null` em vez de
  `''`, que seria uma versão vazia ocupando a coluna.
- **Edição**: campo esvaziado vira `null` e **apaga**. Um link que perde o número de versão é edição
  legítima; tratar isso como "campo não informado" deixaria a versão antiga colada num arquivo novo.

## Reativar: explicar em vez de desabilitar

O botão de reativar não aparece desabilitado quando já existe um ativo do mesmo tipo — a linha do
histórico mostra, no lugar dele, *"tire o instalador atual do ar para reativar este"*.

Botão desabilitado não recebe evento de ponteiro na maior parte dos navegadores, então o tooltip que
explicaria o bloqueio nunca apareceria. E um clique que só devolve `400` não é ação, é armadilha.

É a mesma decisão que `atualizacao-remota-do-desktop` tomou na coluna Ações, por um caminho
diferente: lá o botão fica travado com `aria-disabled` e o motivo no tooltip, porque a ação continua
sendo a mesma e só está indisponível agora; aqui o que falta é um passo anterior, e o texto que
nomeia esse passo vale mais que o botão.

## Correção da rota de atualização do Desktop

A change `atualizacao-remota-do-desktop` registrou — inclusive numa task marcada como "contrato
conferido na `api-fr`" — que o disparo era `POST /computers/update/:id`. Não é.

`/computers/update/:id` existe apenas no `PATCH`, e é a edição do cadastro do computador. O Fastify
casa rota por **caminho + método**, então o `POST` do painel não encontrava handler e voltava `404
Rota não encontrada` — com os cabeçalhos `X-Ratelimit-*` presentes na resposta, prova de que a
requisição chegava à API e morria no roteador, não em CORS nem em autenticação.

O caminho correto é `POST /computers/update-app/:id`, e a própria `api-fr` documenta a separação:
duas operações sem nada em comum no mesmo caminho, distinguidas só pelo verbo, fariam quem errasse o
método mandar uma estação inteira baixar 60 MB.

O conserto é de uma linha em `src/server/computers/update-app.ts`, acompanhado de um comentário que
nomeia as duas rotas — a próxima pessoa a ler o arquivo não precisa descobrir a diferença num 404.

## Alternativas descartadas

- **Um `select` de tipo no formulário de cadastro.** Permitiria escolher um tipo já ocupado; o erro
  só apareceria no `400`. O slot vazio já sabe qual tipo está livre.
- **Excluir de vez em vez de inativar.** A `api-fr` não oferece exclusão física, e é acerto dela: o
  registro inativo é o que responde para onde o link apontava antes, que é a informação de que se
  precisa justamente quando a versão nova sai quebrada.
- **Confiar só na validação da `api-fr` para o endereço.** Ver acima: o custo assimétrico decide.
- **Mostrar o histórico para todos os papéis.** A `api-fr` nem envia os inativos a quem não é ADMIN,
  e link fora do ar na tela de operação é botão para um arquivo que não deveria mais existir.
