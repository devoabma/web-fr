## Why

A change `menu-do-usuario-e-logout` deixou uma dívida declarada: o item "Configurações de Conta" nasceu
**inerte**, visível e clicável sem destino. Era o item 8.1 daquela change e continuava aberto no roadmap.

Junto dele ficou a lacuna mais séria: **não havia como trocar a senha pelo painel**. A `api-fr` expõe
`PATCH /employees/change-password` desde sempre, mas o único jeito de um funcionário mudar a própria senha
era pelo fluxo de recuperação por e-mail — que também ainda não existe no front. Numa sala de advogados,
com máquina compartilhada e senha entregue pelo administrador no cadastro, a senha inicial nunca era
trocada. Quem desconfiasse que alguém a viu não tinha ação nenhuma a tomar.

O `GET /employees/profile` já devolvia CPF e e-mail que o painel nunca chegou a mostrar — o menu do usuário
mostra nome, e-mail e papel, e o CPF (que é o login) não aparecia em lugar nenhum.

## What Changes

- **Rota `/profile`** (`src/app/(private)/profile/page.tsx`): primeira tela de conta do painel, dentro do
  grupo `(private)` e portanto já coberta pela guarda do `proxy.ts`.
- **Cartão de identificação e dados da conta** (`profile-details.tsx`, `profile-row.tsx`): avatar, nome,
  papel traduzido, CPF mascarado e e-mail, com `skeleton` no carregamento e aviso de falha.
- **Troca de senha** (`change-password-dialog.tsx` + `change-password-schema.tsx`): diálogo com senha atual,
  nova senha e confirmação, alternância "mostrar senhas", validação local em Zod e tratamento de `429`.
- **`src/server/employees/change-password.ts`**: `PATCH /employees/change-password` pelo cliente axios,
  tipado no schema Zod da API (`currentPassword`, `newPassword`, `confirmNewPassword`).
- **Item do menu deixa de ser inerte**: "Configurações de Conta" vira uma âncora real (`render={<Link/>}`)
  para `/profile`, e não um `router.push` no clique.

## Capabilities

### Added Capabilities
- `conta-do-funcionario`: o funcionário passa a enxergar os próprios dados de cadastro e a trocar a própria
  senha sem depender de administrador nem de e-mail de recuperação.

### Modified Capabilities
- `navegacao-do-painel`: o item de conta do menu do usuário passa a ter destino e a se comportar como link.

## Impact

- Código novo: `src/app/(private)/profile/page.tsx`, `_components/profile-details.tsx`,
  `_components/profile-row.tsx`, `_components/change-password-dialog.tsx`,
  `_components/change-password-schema.tsx`, `src/server/employees/change-password.ts`.
- Alterado: `src/app/(private)/_components/shared/panel-header/panel-user.tsx`.
- **Nenhum dado de cadastro é editável aqui.** CPF, nome, e-mail e foto continuam sendo do administrador
  (`PATCH /employees/update/:id`, `PATCH /employees/update-image`). A tela diz isso em texto, para não
  prometer um lápis que não existe.
- **A troca de senha não encerra sessão nenhuma.** A `api-fr` só regrava o `passwordHash`: o JWT anterior
  segue válido até expirar (1 dia), na mesma aba e em qualquer outra. Trocar a senha por desconfiança
  **não** expulsa quem já estava dentro — ressalva registrada, mitigação depende da API.
- **A API dispara e-mail de confirmação** (Resend) depois da troca. Em `NODE_ENV != production` o
  destinatário é fixo no código da API, não o e-mail do funcionário — comportamento do backend, apenas
  anotado aqui para não assustar em desenvolvimento.
- A rota `/profile` entra no build como dinâmica (`ƒ`), junto de `/panel`.
