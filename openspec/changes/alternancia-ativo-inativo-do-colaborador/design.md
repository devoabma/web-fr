## Context

As duas rotas já existiam na `api-fr`, registradas com prefixo `/employees` e protegidas por
`checkIfEmployeeIsAdmin`. Ambas respondem `{ message }` e recusam com `400` em três situações: já ativo,
já inativo, e — só no `deactivate` — o funcionário tentando inativar o próprio cadastro.

O trabalho aqui foi de tela: decidir onde cada recusa é prevenida e onde ela é apenas traduzida.

## Decisões

### Dois componentes, um por sentido

`ActivateEmployee` e `InactiveEmployee` são arquivos separados, como em salas. Não é duplicação: as
rotas são diferentes, a confirmação existe só de um lado, e as mensagens de sucesso e de erro dizem
coisas opostas. Um componente único ficaria com um `if` no meio de cada função, e o par de salas já
tinha provado que separar sai mais legível.

### Reativar não pede confirmação; inativar pede

Reativar devolve o acesso: é construtivo, e o botão que aparece em seguida desfaz. Inativar tira o
acesso de uma pessoa, e o custo do erro é alguém não conseguir entrar no balcão amanhã — isso merece
uma parada. Mesmo critério das salas.

### A auto-inativação é impedida antes do clique, não traduzida depois

A API recusa com `400` e mensagem pronta. Deixar o usuário descobrir isso pelo toast funcionaria, mas
transforma uma regra fixa — *ninguém se inativa* — em uma tentativa que falha. Comparar o `id` da linha
com o do `getProfile()` custa nada: o perfil já está em cache, carregado pelo cabeçalho do painel.

**`aria-disabled` em vez de `disabled`**, e o `onClick` guardado por `!isHimself`. Botão `disabled` não
dispara hover em Chrome, e o tooltip é exatamente o que explica por que a ação sumiu — o botão ficaria
apagado, sem resposta e sem motivo. É o padrão que `delete-computer.tsx` já usa para a máquina em uso.

Não usar `aria-disabled` sozinho seria perigoso; por isso o guard no `onClick`. Um leitor de tela
anuncia o botão como desabilitado, o mouse não abre o diálogo, e o tooltip aparece nos dois casos.

### A confirmação não promete uma desconexão que não acontece

O `inactive` é lido em `authenticate.ts`, na hora do login. O middleware de autenticação **não** o
verifica: um funcionário com o painel aberto continua navegando até o JWT expirar. Escrever "ele perde
o acesso agora" seria mentira verificável — bastaria o inativado apertar F5 e continuar dentro.

O diálogo diz: *"deixa de conseguir entrar no painel — se estiver com a sessão aberta, o bloqueio vale
a partir do próximo acesso"*. É mais longo e é o que de fato ocorre.

### A confirmação conta os vínculos para dizer o que **não** se perde

O medo de quem clica em algo destrutivo é apagar junto o que estava ao lado. O diálogo nomeia quantas
salas continuam vinculadas justamente para responder isso antes da pergunta — o `unlink` não acontece,
o histórico fica, e reativar devolve tudo como estava.

### O botão de confirmar desabilita durante a chamada

Sem isso, o duplo clique dispara dois `PATCH`: o primeiro inativa, o segundo volta como *"Funcionário
já está inativo."* e o usuário vê um erro vermelho para uma ação que deu certo. Mesma proteção do
diálogo de sala.

### Só `getEmployees` é invalidado

O `getProfile` do cabeçalho não muda: o único cadastro que apareceria ali é o do próprio administrador,
e ele não pode se inativar. Invalidar por precaução custaria uma requisição por clique para um dado
que a regra acima garante intacto.

## Riscos

- **A sessão em curso do inativado sobrevive até o token expirar (1 dia).** Enquanto a `api-fr` não
  tiver denylist de token, "inativar" é uma trava de porta, não uma expulsão. A tela diz isso; quem
  precisa de efeito imediato ainda depende do backend.
- **O tooltip de auto-inativação depende do `getProfile` ter chegado.** Enquanto o perfil carrega,
  `isHimself` é `false` e o botão fica clicável. O caso é estreito — o cabeçalho do painel já buscou o
  perfil antes de a tabela renderizar —, e se escapar, a API recusa.
