## Why

A change `configuracoes-de-conta` fechou dizendo, em texto na própria tela, que **nenhum** dado de cadastro
era editável pelo funcionário — foto inclusive. Era verdade para nome, CPF e e-mail, que só a rota
`PATCH /employees/update/:id` (ADMIN-only) altera. Mas era **falso para a foto**: a `api-fr` expõe
`PATCH /employees/update-image` para o **próprio funcionário logado**, sem exigir papel de administrador, e
o painel simplesmente não usava.

O resultado era um avatar que nascia com as iniciais do nome e ficava assim para sempre, a menos que alguém
subisse a imagem por fora do painel. O item 7.1 da change anterior já registrava a dívida.

O avatar era, além disso, o único elemento grande e óbvio da tela sem função nenhuma — o lugar onde a mão do
usuário vai primeiro quando quer trocar a foto.

## What Changes

- **O avatar da área de conta vira o gatilho da troca** (`update-avatar-dialog.tsx`): ponteiro de ação,
  dica "Atualizar foto de perfil" e ícone de câmera sobreposto no ponteiro e no foco de teclado.
- **Diálogo de envio** com pré-visualização da imagem escolhida antes de qualquer requisição, nome e
  tamanho do arquivo, remoção da seleção e rodapé no mesmo padrão da troca de senha.
- **Validação local em Zod** (`update-avatar-schema.tsx`): formato (PNG, JPG, WEBP), arquivo não vazio e
  limite de 5 MB — o mesmo teto do `@fastify/multipart` na API.
- **`src/server/employees/update-image-profile.ts`**: `PATCH /employees/update-image` como `multipart/form-data`,
  resposta tipada em `{ imageUrl }`.
- **A tela entende a mudança sozinha**: a URL devolvida pela API é escrita direto em `queryKeys.getProfile()`,
  atualizando a área de conta e o menu do usuário sem nova consulta.
- **`GetProfileResponse` passa a ser exportada** em `src/server/employees/get-profile.ts`, para tipar a
  escrita no cache.
- **A frase sobre dados não editáveis continua**, porque continua correta: ela está no cartão "Dados da
  conta", que trata de CPF e e-mail. A foto não está sob aquele cabeçalho.

## Capabilities

### Modified Capabilities
- `conta-do-funcionario`: o funcionário passa a trocar a própria foto de perfil pela área de conta, sem
  depender de administrador.

## Impact

- Código novo: `src/app/(private)/profile/_components/update-avatar-dialog.tsx`,
  `_components/update-avatar-schema.tsx`, `src/server/employees/update-image-profile.ts`.
- Alterado: `_components/profile-details.tsx` (o avatar estático deu lugar ao componente novo),
  `src/server/employees/get-profile.ts` (tipo exportado).
- **A imagem antiga é apagada do bucket pela API**, não pelo painel. A `api-fr` grava a nova, atualiza o
  cadastro e só então remove a anterior pelo `imagePublicId` — falha na remoção deixa arquivo órfão, mas
  não desfaz a troca.
- **Cada envio gera um nome novo** (`crypto.randomUUID()` no bucket `profiles` do Supabase), então a URL
  pública sempre muda e não há risco de o navegador servir a foto anterior do cache.
- **Não há recorte nem redimensionamento no cliente.** A imagem sobe como o usuário escolheu, e o avatar
  quadrado a recorta por CSS (`object-cover`). Uma foto retangular perde as bordas na exibição.
- O teto de 5 MB é do `@fastify/multipart`; acima dele a API responde `413` com `{ message }`, tratado
  pelo mesmo caminho de erro das demais telas.
- Nenhuma rota nova no build: a mudança vive dentro de `/profile`.
