## Context

O menu do usuário existe desde a change `menu-do-usuario-e-logout` e já carrega o perfil por
`GET /employees/profile` com `staleTime` infinito e a chave `queryKeys.getProfile()`. O item de conta
apontava para lugar nenhum.

A `api-fr` expõe `PATCH /employees/change-password` (autenticada, corpo
`{ currentPassword, newPassword, confirmNewPassword }`, os três com `trim().min(8)`), que recusa senha atual
incorreta e senha nova igual à antiga, ambas com `400 { message }`.

## Goals / Non-Goals

**Goals**
- Dar destino ao item inerte do menu do usuário.
- Mostrar ao funcionário o que a API já devolvia e a tela descartava: CPF (que é o login) e e-mail.
- Permitir a troca da própria senha sem administrador e sem passar pelo e-mail de recuperação.
- Deixar explícito o que **não** se edita no painel, para a tela não parecer quebrada.

**Non-Goals**
- Editar nome, e-mail ou CPF — é cadastro de administrador.
- Trocar a foto de perfil (`PATCH /employees/update-image`, multipart) — fica para a seção 5 do roadmap.
- "Esqueci minha senha" e "redefinir com código" — fluxos públicos, outra change.
- Encerrar as demais sessões depois da troca — a API não tem como.

## Decisions

### O item do menu vira âncora, não `router.push`

`DropdownMenuItem` com `render={<Link href="/profile" />}` em vez de `onClick={() => router.push(...)}`.
Um `onClick` produz uma `<div role="menuitem">` que navega: perde abrir em nova aba pelo meio do mouse ou
`Ctrl`+clique, perde o prefetch do `next/link` e perde o endereço na status bar do navegador. Como o
destino é uma rota de verdade, o elemento certo é um `<a>`.

### Uma consulta, um cache

A tela usa a mesma `queryKeys.getProfile()` e o mesmo `staleTime: Number.POSITIVE_INFINITY` do bloco de
usuário da barra superior. Chave diferente significaria duas requisições e, pior, dois retratos do mesmo
funcionário podendo divergir na mesma aba. Como quem entra em `/profile` veio do menu do usuário, na prática
o dado já está em cache e a tela pinta instantânea.

### O estado de erro é aviso, não tela em branco

Falha no `getProfile` não derruba a rota: sai um bloco `role="alert"` com o texto do que fazer. O padrão é o
mesmo dos avisos do painel (`releases-notice`), com a paleta `destructive` em fundo suave.

### A largura é limitada em `max-w-3xl`

O monitor do balcão é largo. Sem trava, o cartão de dados viraria uma faixa com dois campos perdidos nas
pontas e o olho teria de atravessar a tela para ligar rótulo e valor. `max-w-3xl` mantém a coluna legível e
alinhada com o `max-w-3xl` já usado na descrição do cabeçalho das telas.

### O CPF aparece mascarado

`maskCpf` do `src/utils/masks/cpf`, o mesmo do login. O CPF é o identificador de acesso: mostrá-lo cru
(`12345678900`) obrigaria o funcionário a contar dígitos para conferir se é mesmo a conta dele.

### O diálogo controla o próprio fechamento

`open`/`onOpenChange` controlados em vez de `Dialog` não controlado, por dois motivos:

1. **O sucesso precisa fechar por conta própria**, depois da resposta da API — não no clique.
2. **O fechamento durante o envio é bloqueado** (`if (isSubmitting) return`). Fechar no meio da chamada
   limparia o formulário com a requisição ainda de pé: o toast de erro chegaria depois, sem os dados na
   tela para corrigir e tentar de novo.

O `closeDialog` centraliza os três efeitos — fechar, `reset()` do formulário e desligar "mostrar senhas" —
para que nenhum caminho de saída esqueça um deles. Deixar a senha visível vazando para a próxima abertura
seria o esquecimento mais caro.

### Erro descarta só a senha atual

No `catch`, `resetField('currentPassword')` e `setFocus('currentPassword')`. É o campo que costuma estar
errado — a recusa mais comum da API é "Senha atual incorreta". Limpar os três obrigaria a redigitar a nova
senha inteira, duas vezes, por causa de um dígito trocado no primeiro campo.

### A mensagem da API é a que aparece

`getApiErrorMessage(err, fallback)`: a `message` do `400` é o que explica a recusa ("Senha atual incorreta",
"A nova senha deve ser diferente da senha atual"). O texto genérico só entra quando não veio resposta
nenhuma — queda de rede, 502 respondendo HTML. O `429` tem tratamento próprio, com
`getRetryAfterInSeconds` + `formatWaitTime`, no mesmo padrão do login.

O `change-password` **não tem teto próprio** na `api-fr` — cai no global de 300 requisições por minuto por
IP. O tratamento é defensivo: barato de escrever, e é o único caminho para o texto de espera no dia em que a
API apertar essa rota, como já fez com o login.

### Validação local espelha a API, e vai um pouco além

O schema Zod repete `min(8)` nos três campos e a igualdade `newPassword === confirmNewPassword`, para o erro
aparecer sob o campo sem gastar uma requisição. Acrescenta a regra que a API só verifica no servidor —
`newPassword !== currentPassword` — porque a recusa é certa e o `400` seria puro atrito.

Os dois `refine` levam `path` explícito. Sem ele o Zod devolve o problema na raiz do objeto, o `FieldError`
de cada campo fica mudo e o usuário só vê o botão não funcionar.

**Cuidado:** os nomes dos campos do formulário e do corpo da API divergem de propósito — o formulário usa
`confirmPassword`, a API espera `confirmNewPassword`. A tradução acontece num único ponto, na chamada do
`changePasswordMutate`.

### "Mostrar senhas" é um só, para os três campos

Um `Checkbox` que troca o `type` dos três `Input` de uma vez, em vez de um olho por campo. Quem liga a
visibilidade quer conferir se a nova senha bate com a confirmação — o interesse é sempre nos campos em
conjunto. Três botões de olho seriam três alvos de clique e três estados para lembrar.

### Formulário fora do rodapé, ligado por `form=`

O `<form>` fica no corpo do diálogo e o botão de envio no `DialogFooter`, ligados por
`id="change-password-form"` + `form="change-password-form"`. É o que permite ao rodapé ficar fixo com o
`Cancelar` ao lado sem aninhar o rodapé dentro do formulário — e o `Enter` nos campos continua enviando.

### `autoComplete` correto nos três campos

`current-password` no primeiro, `new-password` nos outros dois. É o que faz o gerenciador de senhas do
navegador oferecer a senha guardada no campo certo e propor a atualização depois da troca. Errar isso
resulta no gerenciador preenchendo a senha antiga nos três campos.

## Risks / Trade-offs

- **A troca de senha não invalida sessão nenhuma.** A `api-fr` só regrava o hash; o JWT emitido antes segue
  aceito até expirar (1 dia). Quem trocou a senha porque desconfiou de alguém **continua com aquela pessoa
  dentro**, se ela já estiver logada em outra máquina. A mitigação é a mesma pendência do logout: denylist
  de token na API. O texto do diálogo é honesto no que pode prometer ("Sua sessão continua aberta depois da
  troca") e não promete o resto.
- **`min(8)` na senha atual pode barrar senha legada.** Se algum funcionário tiver senha com menos de 8
  caracteres cadastrada antes da regra, o formulário recusa antes de chamar a API. A API tem a mesma regra
  no corpo, então o `400` viria de qualquer forma — o front só antecipa a recusa. O caminho de saída seria a
  recuperação por e-mail, que ainda não existe no painel.
- **Dados só de leitura sem caminho de correção no painel.** Se o e-mail estiver errado, a tela manda
  procurar um administrador — e a tela de administração de funcionários também ainda não existe. É pendência
  conhecida da seção 5 do roadmap, não uma regressão desta change.
- **Sem confirmação por foto ou 2FA.** Basta a senha atual. É o que a API oferece.
- **A tela nasce sem link na sidebar.** Só se chega a `/profile` pelo menu do usuário. Foi decisão: conta é
  ajuste ocasional, e a sidebar é navegação de operação — um item fixo ali competiria com as salas e a fila
  de impressão o dia inteiro.
