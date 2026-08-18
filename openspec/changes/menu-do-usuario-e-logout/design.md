## Context

A change `sessao-e-guarda-de-rotas` deixou a sessão em pé: cookie `httpOnly` da `api-fr`, guarda no
`proxy.ts`, perfil real na barra superior. O que ficou faltando foi o caminho de volta — nenhuma ação do
painel encerrava a sessão, porque a API não tinha rota para isso.

O cookie de sessão é `httpOnly`. Essa é a razão de o logout não poder ser resolvido no cliente: o
JavaScript do painel não enxerga nem apaga esse cookie. Só um `Set-Cookie` de expiração, vindo do mesmo
domínio e com os mesmos atributos da gravação, o remove do navegador.

## Goals / Non-Goals

**Goals**
- Encerrar a sessão de forma explícita, em máquina compartilhada, sem esperar a expiração de 1 dia.
- Dar ao bloco de usuário a forma que o resto do painel vai reaproveitar: menu suspenso ancorado no avatar.
- Expor o `role` e o e-mail que o perfil já traz e o painel descartava.
- Extrair `getInitials` para uso comum, antes que as telas de inventário o dupliquem.

**Non-Goals**
- Invalidar o token no servidor (a `api-fr` não tem denylist; ver Riscos).
- Construir a tela de configurações de conta — o item do menu nasce inerte.
- Trocar senha, trocar foto ou qualquer edição de perfil.
- Esconder a seção "Administração" da sidebar para `MEMBER` — continua pendente.

## Decisions

### O logout é do cookie, e por isso passa pela API

`POST /employees/session/logout` é público (não exige JWT) e responde `200 { message }` com um
`clearCookie` espelhando `path`, `httpOnly`, `secure`, `sameSite` e `domain` da gravação. Qualquer atributo
divergente faria o navegador tratar como cookie diferente e o original sobreviveria.

A chamada usa o mesmo cliente axios das demais, que já leva `withCredentials: true`. Sem ele o `Set-Cookie`
de limpeza é descartado pelo navegador e o usuário continua logado — falha silenciosa, a pior categoria
aqui, porque a tela de login apareceria como se tudo tivesse dado certo.

### Falha de rede avisa, não navega

Se o `POST` não completa, o cookie continua válido. Navegar para o login nesse estado produziria o pior
resultado possível: o usuário acredita que saiu, a próxima pessoa digita `/panel` e o proxy a deixa entrar
com a sessão anterior. Por isso o `catch` só emite um toast e mantém o menu aberto — o usuário decide se
tenta de novo.

Pelo mesmo motivo o item usa `closeOnClick={false}`: fechar o menu no clique daria a impressão de conclusão
enquanto a requisição ainda pode falhar. O item fica desabilitado e troca o ícone por um `spinner` enquanto
a chamada corre.

### Ordem da saída: API, cache, navegação

1. `await logout()` — só depois de confirmado é que o resto acontece.
2. `queryClient.clear()` — o `getProfile` roda com `staleTime` infinito; sem a limpeza, o perfil de quem
   saiu sobreviveria na mesma aba.
3. `router.replace()` para o login (`replace`, não `push`: o painel não deve voltar pelo histórico).
4. `router.refresh()` — descarta o cache de rotas do App Router, que serviria o RSC payload do painel já
   renderizado.

O `queryClient.clear()` do login continua no lugar, como segunda barreira: se o logout falhar e a pessoa
seguinte entrar com outro CPF, a autenticação limpa o cache de novo.

### Avatar pelo primitivo, `next/image` fora

`AvatarImage`/`AvatarFallback` do `@base-ui/react` já resolvem a troca imagem→iniciais no próprio primitivo,
inclusive quando a URL existe mas o carregamento falha — caso que o `next/image` não cobria. Some junto a
armadilha do `imageUrl` anulável chegando ao `next/image` e estourando "Failed to parse src".

O avatar do painel é quadrado com cantos arredondados, e não circular como o padrão do primitivo; daí o
`rounded-md` também no pseudo-elemento (`after:rounded-md`), que é quem desenha a borda.

### Largura do menu fixa em `w-60`

O `DropdownMenuContent` tem `w-(--anchor-width)` como padrão, herdado do estilo `base-nova`: o menu nasce
do tamanho do gatilho. Aqui o gatilho é um avatar de 32px, e o menu precisa acomodar e-mail e o rótulo
"Configurações de Conta". A largura vira `w-60` explicitamente.

**Cuidado com a sintaxe:** em Tailwind v4 a leitura de variável CSS em valor arbitrário é `w-(--anchor-width)`.
A forma v3 `w-[--anchor-width]` não é convertida — gera `width: --anchor-width`, que o navegador descarta.
Como o `tailwind-merge` deixa passar a última classe do mesmo grupo, a forma inválida **silencia** o padrão
do componente sem substituí-lo por nada.

### Rótulo explícito no gatilho

O nome ao lado do avatar tem `sm:block` — abaixo de 640px ele não existe. Sem `aria-label`, o nome acessível
do botão seriam as iniciais ("HM"), que não descrevem ação nenhuma. O gatilho ganha
`aria-label="Abrir menu do usuário"`, no mesmo padrão do `SidebarTrigger` da barra.

### Papel traduzido em mapa, não em condicional

`ROLE_LABELS: Record<Role, string>` deixa o TypeScript exigir uma entrada nova quando um papel for
acrescentado ao enum da API. Um ternário `role === 'ADMIN' ? ... : ...` aceitaria o papel novo em silêncio,
rotulando-o como "Membro".

### `getInitials` sobe para `src/utils/index.ts`

A função nasceu local ao `panel-user.tsx`, mas o mesmo fallback reaparece em toda listagem de funcionário do
inventário (seção 5 do roadmap). Subir agora custa um arquivo; subir depois custa uma refatoração com três
cópias já divergentes.

### Brilho radial removido

O `radial-gradient` da barra superior sai. Foi decisão de design, tomada com a barra montada — a marca e o
badge de status já dão peso suficiente ao topo. Isso reverte o commit `d1c853e` e supera o item 6.7 da change
`sessao-e-guarda-de-rotas`, que o havia restaurado depois de uma perda acidental.

## Risks / Trade-offs

- **O token sobrevive ao logout.** A `api-fr` não mantém denylist: quem tiver copiado o JWT antes continua
  sendo aceito até a expiração (1 dia). O painel nunca expõe o token ao JavaScript, então o vetor exige
  acesso prévio ao cookie `httpOnly` — mas em máquina compartilhada isso não é hipótese absurda. Mitigação
  real exigiria denylist na API.
- **"Configurações de Conta" leva a lugar nenhum.** Item visível e clicável sem destino. A alternativa —
  esconder até existir a tela — deixaria o menu com uma única opção e sem razão de ser menu. Fica como
  pendência declarada no roadmap.
- **`queryClient.clear()` com o observador do perfil ainda montado.** A limpeza acontece antes de o
  componente desmontar; se o React Query decidir revalidar o `getProfile` nesse intervalo, sai uma
  requisição condenada ao `401`. É desperdício, não erro visível — nenhum toast está ligado a essa consulta
  e o `if (!data) return null` cobre o estado vazio. Vale conferir no teste manual (`7.4`).
- **Sem confirmação antes de sair.** Um clique acidental encerra a sessão. Como reentrar custa CPF e senha
  em uma tela que já está a um `replace` de distância, um diálogo de confirmação foi julgado atrito maior
  que o erro que evita.
