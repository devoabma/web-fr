## Context

`POST /employees/create-account` é `ADMIN`-only e recebe `name`, `cpf`, `email` e `password`. O que a rota
faz, lido do código do servidor:

- Verifica CPF e e-mail em duas consultas paralelas, **antes** de criar, e recusa com `400` e mensagem
  específica para cada um: "Já existe um funcionário cadastrado com esse CPF." e "...com esse e-mail.".
- `cpf` passa pelo mesmo `cpfSchema` que o painel usa — dígitos verificadores e normalização para 11
  dígitos. O `email` é validado por `z.email()`, sem normalização de caixa.
- A senha é gravada com `hash(password, 8)` e, em seguida, **enviada em texto** por e-mail ao colaborador,
  com o link do login. Falha do provedor é registrada no log e **não** interrompe: a resposta é `201`
  igual.
- `role` não é lido do corpo. O Prisma aplica `@default(MEMBER)`.
- A resposta é `{ message }`, sem `id`.

Esta change encapsula essa rota e liga o gatilho de cadastro na última área administrativa que faltava.

## Goals / Non-Goals

**Goals**

- Criar colaborador pela interface, sem acesso ao banco.
- Repetir o arranjo de cadastro já estabelecido em salas e computadores, para as três áreas administrativas
  se comportarem igual.
- Reusar a validação de CPF do login — é a mesma credencial, e a divergência entre as duas telas seria um
  bug esperando acontecer.
- Deixar claro na tela o que o cadastro dispara fora dela: o e-mail com a senha.

**Non-Goals**

- Listar, editar, ativar/inativar ou vincular a salas — cada uma é uma rota própria e vem depois.
- Escolher o papel do colaborador; a API não aceita.
- Gerar senha automaticamente.
- Confirmar que o e-mail chegou.

## Decisions

### A recusa de duplicidade vira erro de campo, não toast

Salas e computadores mandam a mensagem de `400` para o toast, e isso funciona lá porque há um candidato
óbvio ao conflito. Aqui há dois campos `@unique`, e um toast dizendo "Já existe um funcionário cadastrado
com esse CPF." obriga o usuário a traduzir a frase para saber onde mexer — com o formulário inteiro
preenchido na frente dele.

`resolveDuplicatedField` procura "cpf" e "mail" na mensagem e devolve o campo, que recebe `setError` e
`setFocus`. Quando nada casa, cai no toast geral, que continua sendo o caminho de qualquer outro erro.

Não repetimos a frase no toast quando ela já está sob o campo: seria a mesma informação em dois lugares,
uma delas sem contexto.

### O CPF é mascarado na tela e normalizado no envio

`maskCpf` no `onChange` via `Controller`, `cpfSchema` no submit — exatamente o que a tela de login faz. O
schema transforma para 11 dígitos antes de o `handleSubmit` entregar os dados, então o que viaja nunca tem
pontuação.

Isso importa porque o CPF é `@unique` no banco e é o login: gravar "123.456.789-09" onde o resto do sistema
grava "12345678909" criaria uma conta que o próprio login não encontra.

### A senha usa `autoComplete="new-password"`

Com `off` ou `current-password`, o gerenciador do navegador oferece a credencial do administrador logado —
que está, neste formulário, prestes a ser enviada por e-mail para outra pessoa. É a única defesa que a
interface consegue oferecer num desenho em que a senha inicial é digitada por terceiro.

A alternância "Mostrar/Ocultar" é a mesma do login. Aqui ela pesa mais: quem digita não é o dono da senha e
não vai poder conferi-la depois em lugar nenhum.

### O toast de sucesso nomeia o e-mail de destino

"Os dados de acesso foram enviados para maria@oabma.org.br" — porque um e-mail digitado errado passa por
todas as validações (é um endereço válido, só não é o dela) e o único momento em que alguém pode notar é
esse. Depois do cadastro, sem listagem, não há onde reler o que foi gravado.

A frase afirma o que a API se propõe a fazer, não o que ela confirma ter feito: o envio pode falhar e ainda
assim responder `201`. Preferimos isso a omitir o endereço, que é a informação com maior chance de estar
errada e ainda ser corrigível.

### Nada de confirmação de senha

`change-password` e `reset-password` pedem confirmação porque quem digita é o dono da senha e um erro de
digitação o tranca para fora. Aqui o valor digitado vai por e-mail exatamente como foi escrito: um engano
não tranca ninguém, o colaborador recebe a senha errada e entra com ela. Um campo a mais só adicionaria
atrito sem evitar nada.

### O gatilho não checa papel

`proxy.ts` já devolve `MEMBER` ao painel antes de `/admin/employees` renderizar, e a sidebar nem mostra a
seção. Repetir a verificação no componente seria uma terceira cópia da mesma regra, com uma chance a mais
de divergir das outras duas.

## Risks / Trade-offs

- **Cadastro sem listagem é meia tela.** Não há como conferir quem já existe antes de tentar, nem ver o
  resultado depois. A recusa de CPF duplicado é o único sinal de que a pessoa já estava lá.
- **A senha trafega em e-mail, em texto.** Herdado da `api-fr`. A tela não tem como corrigir isso.
- **Colaborador nasce `MEMBER` e sem sala.** Duas outras rotas resolvem, nenhuma delas nesta change.
- **A detecção do campo em conflito lê texto de mensagem.** Reescrita do lado da API degrada o
  apontamento para o aviso geral.
- **Sucesso relatado é o `201`, não a entrega do e-mail.** A API não distingue os dois casos.
- **Rota administrativa nova sem cobertura de teste automatizado**, como todas as outras do painel.

## Open Questions

- A `api-fr` deveria devolver o `id` do colaborador criado, para o cadastro já encadear o vínculo com salas?
- A senha inicial deveria ser gerada pelo servidor, em vez de digitada pelo administrador?
- O e-mail de boas-vindas deveria levar um link de definição de senha, em vez da senha em texto?
- A `api-fr` deveria informar quando o envio do e-mail falha, já que a senha só existia naquela mensagem?
- Deveria existir rota para promover alguém a `ADMIN`, ou isso segue sendo operação de banco?
