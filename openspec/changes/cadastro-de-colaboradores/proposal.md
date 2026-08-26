## Why

`/admin/employees` era a última área administrativa sem conteúdo — o item 7.4 das tarefas de
`edicao-de-computadores` a registrou como próximo passo, e a página existia apenas com o cabeçalho, com o
gatilho de cadastro e a listagem comentados no JSX.

Sem esta tela, criar um colaborador só era possível direto no banco. O painel é operado por `MEMBER` e
administrado por `ADMIN`, mas até aqui nenhum dos dois papéis podia ser criado pela interface — a única
conta existente era a que alguém inseriu à mão. Cadastrar pessoa é o passo que falta para o painel ser
operável por mais de um usuário.

Do lado da `api-fr`, `POST /employees/create-account` já existia, `ADMIN`-only
(`checkIfEmployeeIsAdmin`). Três detalhes da rota moldam esta tela, lidos do código do servidor:

- O corpo aceita **apenas** `name`, `cpf`, `email` e `password`. **`role` não é campo**: o Prisma cria com
  `@default(MEMBER)`, e não há rota que promova alguém a `ADMIN`.
- `cpf` e `email` são `@unique` e verificados **antes** da criação, cada um com sua mensagem de `400`.
- A senha informada é **enviada por e-mail** ao colaborador, em texto, junto com o link do login. Quem
  digita a senha é o administrador; quem a recebe é outra pessoa.

A resposta de sucesso é `{ message }` — não devolve o `id` do colaborador criado.

## What Changes

- **Formulário de novo colaborador** em painel lateral (`new-employee.tsx` + `new-employee-schema.tsx`):
  nome, CPF, e-mail e senha temporária, no mesmo arranjo de `new-room.tsx` e `new-computer.tsx`.
- **`server/employees/create.ts`** encapsulando `POST /employees/create-account`.
- **CPF mascarado na digitação e normalizado no envio**, reusando `maskCpf` e `cpfSchema` — os mesmos do
  login, onde o CPF também é a credencial.
- **Recusa de duplicidade apontada no campo certo**: a mensagem de `400` da API é lida para descobrir se o
  conflito é de CPF ou de e-mail, e vira erro daquele campo em vez de toast.
- **Senha temporária com alternância de visibilidade**, como no login, e `autoComplete="new-password"`.
- **`queryKeys.getEmployees()`** adicionada e invalidada pelo cadastro, já preparada para a listagem.
- **`<NewEmployee />` ligado** em `/admin/employees`, no lugar do comentário.

## Capabilities

### Added Capabilities
- `cadastro-de-colaboradores`: cadastrar as pessoas que operam e administram o painel, com o CPF servindo de
  credencial de acesso e a senha inicial entregue por e-mail.

## Impact

- Novo: `src/app/(private)/admin/employees/_components/new-employee.tsx` e `new-employee-schema.tsx`,
  `src/server/employees/create.ts`.
- Alterado: `src/constants/query-keys.ts`, `src/app/(private)/admin/employees/page.tsx`.
- **A tela ainda não lista colaboradores.** O cadastro nasce sem o resultado visível — diferente de
  `cadastro-de-computadores`, onde listagem e cadastro vieram juntos. Cadastrar dá certo, mas quem cadastrou
  não vê a pessoa na tela, e não há como conferir quem já existe antes de tentar. Só a recusa de CPF
  duplicado revela o cadastro repetido. A invalidação de `getEmployees()` já está no lugar para quando a
  listagem chegar.
- **Não há como criar outro `ADMIN` pela interface.** Todo cadastro sai `MEMBER`. Promover alguém continua
  exigindo acesso ao banco, e isso não é limitação da tela: a `api-fr` não expõe rota para mudar papel.
- **O vínculo com salas não acontece aqui.** É `POST /employees/link-with-rooms`, outra rota, e a resposta
  do cadastro não devolve o `id` para encadear as duas chamadas. O colaborador nasce sem sala.
- **A senha inicial é escolhida pelo administrador e viaja por e-mail em texto.** É o desenho da `api-fr`,
  não uma escolha desta tela. A interface reduz o dano possível apenas evitando que o gerenciador de senhas
  do navegador ofereça a senha do próprio administrador no campo.
- **O envio do e-mail não é garantia.** A rota registra a falha do provedor no log e responde `201` do mesmo
  jeito. O colaborador é criado mesmo quando o e-mail não sai — e, como a senha só existia ali, ninguém tem
  como recuperá-la a não ser pelo fluxo de esqueci-minha-senha. O toast de sucesso afirma que o e-mail foi
  enviado porque é o que a API se propõe a fazer; ela não informa se conseguiu.
- **A identificação do campo em conflito depende do texto da mensagem.** Procuramos "cpf" e "mail" na
  resposta. Se a `api-fr` reescrever essas frases, o erro deixa de apontar o campo e cai no aviso geral —
  degrada, não quebra.
- O corte por papel já estava resolvido: `proxy.ts` devolve `MEMBER` ao painel em `/admin/*`, a sidebar
  esconde a seção e a rota da API é `ADMIN`-only. Esta change não mexe em autorização.
