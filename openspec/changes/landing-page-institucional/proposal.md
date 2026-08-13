## Why

O `web-fr` nasceu do template do `create-next-app` e não tinha identidade nem fundação de UI. Antes de construir o painel autenticado (gestão de salas, computadores, funcionários e fila de impressão), o projeto precisava de três coisas: a página institucional que apresenta o produto e leva ao painel, o sistema de design que todas as telas seguintes vão reaproveitar, e as convenções de código que evitam divergência conforme o time cresce.

Esta change entrega a landing page pública do Sala Livre, derivada do projeto Claude Design "Sala Livre", junto com a base de tema, componentes e ferramental do repositório.

## What Changes

- **Fundação de UI**: Tailwind CSS v4 com tokens em `oklch` (`src/app/styles/globals.css`), shadcn no estilo `base-nova` sobre `@base-ui/react`, `lucide-react` como biblioteca de ícones e `sonner` para notificações.
- **Layout raiz**: fonte Space Grotesk via `next/font/google` exposta como `--font-sans`, metadata do produto com template de título `%s | Sala Livre`, favicon próprio e `ClientProviders` isolando o que precisa rodar no cliente.
- **Landing page** composta por cinco seções em `src/components/app/`: `header`, `hero-content`, `dashboard-preview`, `features` e `footer`.
- **Mockup do painel** (`dashboard-preview`) representando o tri-estado real do computador — disponível, em uso e manutenção — com os contadores derivados da fonte de dados, não escritos à mão.
- **Responsividade mobile-first** em todas as seções, com o design original do Claude Design sendo atingido em `lg`.
- **Convenções de código** no `biome.json`: aspas simples no TS, aspas duplas no JSX, sem ponto e vírgula, largura 130, `organizeImports` e `useSortedClasses` como erro.
- **Ferramental**: OpenSpec inicializado no repositório (`openspec/`, skills e comandos `/opsx:*` em `.claude/`).

## Capabilities

### New Capabilities
- `landing-page`: Página institucional pública do Sala Livre, responsiva, apresentando o produto e conduzindo o funcionário ao painel administrativo.

### Modified Capabilities
<!-- Nenhuma capability existente tem requisitos alterados; este é o primeiro incremento do repositório. -->

## Impact

- Código novo: `src/components/app/{header,hero-content,dashboard-preview,features,footer,grid-overlay}.tsx`, `src/components/ui/{button,badge}.tsx`, `src/lib/utils.ts`, `src/app/styles/globals.css`, `src/app/(internal-layout)/_components/shared/client-providers.tsx`.
- Código alterado: `src/app/layout.tsx`, `src/app/page.tsx`, `biome.json`, `package.json`.
- Removido: `src/app/globals.css` (movido para `src/app/styles/globals.css`).
- Assets: `public/logo.svg`, `public/fr.svg`, `public/assets/logo-oabma.png`.
- Dependências adicionadas: `@base-ui/react`, `class-variance-authority`, `clsx`, `lucide-react`, `shadcn`, `sonner`, `tailwind-merge`, `tw-animate-css`.
- Rota pendente: o CTA do hero aponta para `/painel`, que ainda não existe — será entregue na change de autenticação do funcionário.
