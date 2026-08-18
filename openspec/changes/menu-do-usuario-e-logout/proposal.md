## Why

O painel sabia quem era o funcionário, mas não oferecia nenhuma saída. O bloco de usuário da barra superior
era um avatar inerte: mostrava nome e foto e não respondia a clique. Encerrar a sessão exigia esperar a
expiração de 1 dia ou apagar o cookie na mão pelo devtools — inaceitável em máquina compartilhada, que é
exatamente o cenário de uma sala de advogados na OAB-MA.

A lacuna estava registrada como item 8.1 da change `sessao-e-guarda-de-rotas` e no roadmap, os dois com a
mesma ressalva: **a `api-fr` não expunha rota de logout**. Ela passou a expor em 2026-08-17
(`POST /employees/session/logout`, pública, `clearCookie` com os mesmos atributos da gravação), e a ressalva
venceu. Como o cookie é `httpOnly`, só o servidor consegue apagá-lo — sem essa rota não havia logout
possível no front, apenas a ilusão de um.

O avatar também era o lugar natural para o `role` e o e-mail que o `GET /employees/profile` já devolvia e o
painel descartava.

## What Changes

- **Menu do usuário** (`panel-user.tsx`): o avatar vira gatilho de um menu suspenso com identificação
  (nome, e-mail e papel traduzido), um atalho para configurações de conta e a saída do sistema.
- **Logout integrado** (`src/server/employees/logout.ts`): `POST /employees/session/logout` pelo cliente
  axios com `withCredentials`, seguido de limpeza do cache do React Query e retorno ao login.
- **Primitivos novos**: `src/components/ui/dropdown-menu.tsx` e `src/components/ui/avatar.tsx`, no estilo
  `base-nova` sobre `@base-ui/react`.
- **`getInitials` promovido** de função local do `panel-user.tsx` para `src/utils/index.ts` — o mesmo
  fallback de iniciais reaparece em toda listagem de funcionário do inventário.
- **Avatar pelo primitivo**: `next/image` sai do bloco de usuário e entra `Avatar`/`AvatarImage`/
  `AvatarFallback`, que já resolvem a troca imagem→iniciais sem `imageUrl` anulável chegar ao `next/image`.
- **Brilho radial removido** da barra superior — decisão de design, revertendo o commit `d1c853e`.

## Capabilities

### Modified Capabilities
- `navegacao-do-painel`: o bloco de usuário deixa de ser apenas identificação e passa a ser ponto de
  controle da conta, com menu suspenso acionável por teclado.
- `sessao-do-painel`: a sessão ganha um fim explícito, comandado pelo funcionário, além da expiração.

## Impact

- Código novo: `src/server/employees/logout.ts`, `src/utils/index.ts`, `src/components/ui/dropdown-menu.tsx`,
  `src/components/ui/avatar.tsx`.
- Alterado: `src/app/(private)/_components/shared/panel-header/panel-user.tsx`,
  `src/app/(private)/_components/shared/panel-header/index.tsx`, `src/server/employees/get-profile.ts`.
- **O logout apaga o cookie, não invalida o token.** A `api-fr` não mantém denylist: um token já copiado
  continua aceito até expirar (1 dia). Como o painel nunca expõe o token ao JavaScript, o vetor exige
  acesso prévio ao cookie `httpOnly` — mas a ressalva fica registrada.
- **Falha de rede no logout não desloga.** Se a requisição não chegar, o cookie permanece de pé; o painel
  avisa por toast em vez de navegar para o login e fingir que a sessão acabou.
- **Prefixo obrigatório.** A rota é `/employees/session/logout`; chamar `/session/logout` devolve `404`.
- "Configurações de Conta" é item **inerte** nesta change — o destino ainda não existe.
- O brilho radial da barra superior sai de vez; o item 6.7 da change `sessao-e-guarda-de-rotas`, que o havia
  restaurado, fica superado.
