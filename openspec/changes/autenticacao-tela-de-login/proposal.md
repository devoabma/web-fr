## Why

A landing entrega o visitante em `/auth/sign-in`, mas essa rota não existia. Sem tela de login não há como
começar o painel: toda rota autenticada depende de uma sessão, e toda decisão de UI do painel (o que o
`ADMIN` vê e o `MEMBER` não) depende do `role` que só chega junto com o token.

Esta change entrega a **camada de apresentação** da autenticação do funcionário — rota, layout, formulário,
validação e estados visuais —, além da reorganização de rotas que separa o que é público do que será
privado. A integração com `POST /employees/session/auth` fica para a change seguinte: sem cliente HTTP
definido, integrar agora significaria escrever o `fetch` duas vezes.

## What Changes

- **Grupos de rota**: `(public)` para o que não exige sessão e `(private)` para o painel. O antigo
  `(internal-layout)` foi renomeado para `(private)`, alinhando o nome ao papel.
- **Rota `/auth/sign-in`** com layout split: painel de marca à esquerda (fundo `--primary`, marca d'água da
  logo, proposta de valor) e formulário à direita. Abaixo de `md` o layout empilha com o formulário primeiro.
- **Formulário de login** com React Hook Form + Zod: CPF com máscara progressiva, senha com alternância de
  visibilidade, "manter-me conectado", link de recuperação de senha, estado de envio e slot de erro geral
  (`errors.root`) já pronto para a resposta da API.
- **Validação de CPF** em `src/utils/schemas/cpf.ts` — normaliza para dígitos e valida os dois dígitos
  verificadores — e máscara em `src/utils/masks/cpf.ts`.
- **Primitivas de UI** novas: `input`, `label`, `field` (com `FieldGroup`, `FieldLabel`, `FieldError`),
  `checkbox` e `separator`.
- **`BrandMark`**: o símbolo do Sala Livre como componente SVG, com cor herdada por `currentColor` e traço
  de destaque configurável — usado no login em três tamanhos e reaproveitado pela página 404.
- **`globals.css` movido** de `src/app/styles/` para `src/styles/`: folha de tema não é rota.
- **`GridOverlay` movido** do layout raiz para a landing — é fundo decorativo dela, não de toda aplicação.
  O login tem fundo próprio.
- **`lang="pt-BR"`** no `<html>`, que ainda estava em `en`.
- **Placeholder `/auth/sign-up`** para reservar a rota.
- **Dependências**: `react-hook-form`, `zod`, `@hookform/resolvers` e `axios` (este último adicionado para a
  change de integração, ainda sem uso).

## Capabilities

### New Capabilities
- `autenticacao-funcionario`: Tela de entrada do funcionário no painel — identificação por CPF e senha,
  validação local, estados de envio e erro.

### Modified Capabilities
<!-- Nenhuma capability existente tem requisitos alterados. -->

## Impact

- Código novo: `src/app/(public)/auth/{layout.tsx,sign-in/page.tsx,sign-in/_components/{form-auth.tsx,form-auth-schema.tsx},sign-up/page.tsx}`,
  `src/components/app/brand-mark.tsx`, `src/components/ui/{input,label,field,checkbox,separator}.tsx`,
  `src/utils/{masks/cpf.ts,schemas/cpf.ts}`.
- Código movido: `src/app/(internal-layout)/` → `src/app/(private)/`, `src/app/styles/globals.css` → `src/styles/globals.css`.
- Código alterado: `src/app/layout.tsx`, `src/app/page.tsx`, `src/components/app/hero-content.tsx`.
- Rotas pendentes referenciadas pela tela: `/auth/forgot-password` (link "Esqueci minha senha") ainda não existe.
- `handleSignIn` hoje só faz `console.log` — a tela é navegável, mas não autentica ninguém.
