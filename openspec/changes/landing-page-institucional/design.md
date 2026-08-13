## Context

O `web-fr` é o painel web do Sala Livre, plataforma de gestão dos escritórios compartilhados e salas de fórum da OAB Maranhão. Ele consome a `api-fr` (Fastify + Prisma + Postgres) junto com dois outros clientes: o app desktop instalado nas máquinas das salas e o app mobile.

A landing é a porta de entrada pública: apresenta o produto e leva o funcionário ao painel. O design saiu do projeto Claude Design "Sala Livre" (`c3a63c9a-47ad-47c7-8349-2d496f96c4f4`), entregue como HTML estático com estilos inline e um bloco de dados `DCLogic`. Traduzir isso para React não é copiar marcação — é decidir o que vira token de tema, o que vira dado e o que vira componente.

## Goals / Non-Goals

**Goals:**
- Entregar a landing fiel ao design, responsiva de 320px até desktop.
- Estabelecer o sistema de design (tokens, primitivas, convenções) que o painel autenticado vai herdar.
- Manter a página inteira como Server Component — nenhuma seção precisa de estado ou evento.
- Deixar os dados do mockup em estruturas tipadas, prontas para trocar por respostas reais da API.

**Non-Goals:**
- Autenticação, rota `/painel` e qualquer consumo real da `api-fr` — ficam para as próximas changes.
- Tema escuro. Os tokens `.dark` existem em `globals.css`, mas a landing não expõe alternador.
- Rotas `/privacidade`, `/suporte` e `/status` referenciadas no rodapé.

## Decisions

### Tokens de tema em vez de hex

O design usa `#16213e`, `#c0392b`, `#586079` diretamente. Mapeamos para `--primary`, `rose-700` e `--muted-foreground` em `oklch`. O custo é uma pequena perda de fidelidade cromática; o ganho é que o painel inteiro muda de cor em um arquivo, e o tema escuro já nasce definido.

### Dados derivados, não literais

O design traz "5 disponíveis · 2 em uso · 1 manutenção" e "8 computadores" como texto fixo. No componente esses números são calculados a partir do array `computers`. Isso já se provou necessário: ao editar a lista de salas, os contadores literais teriam ficado defasados em silêncio.

### `statusStyles` como mapa único

Cada estado do computador (disponível / em uso / manutenção) tem cinco variações visuais — fundo, borda, ponto, cor do texto e rótulo. Centralizamos em um `Record<ComputerStatus, …>` em vez de condicionais espalhadas pelo JSX. Quando o estado real vier da API, muda-se a origem do dado sem tocar na apresentação.

### Sidebar vira faixa rolável no mobile

O mockup tem uma sidebar de 210px que não cabe em telas estreitas. Em vez de escondê-la, ela vira uma faixa horizontal com scroll (`overflow-x-auto`, itens `shrink-0`) e sangria negativa para o scroll encostar nas bordas. Os atalhos secundários (Fila de impressão, Relatórios) ficam ocultos abaixo de `md` — competiriam com as salas pelo mesmo espaço sem acrescentar informação.

### `nativeButton={false}` ao renderizar botão como link

O `Button` do `@base-ui/react` assume que renderiza um `<button>` nativo e delega semântica de foco e submit ao browser. O CTA do hero é navegação, então usa `render={<Link/>}`, o que produz um `<a>`. Sem `nativeButton={false}` a primitiva emite erro em runtime. A alternativa — `<button>` real com `router.push` — transformaria a página em Client Component sem ganho.

### Quebra de linha explícita no `<h1>`

O design quebra em "Gestão inteligente das / salas da advocacia". Deixar o navegador quebrar sozinho move "salas" para a primeira linha em larguras intermediárias. Usamos `<br>` explícito, aceitando linhas mais curtas em telas muito estreitas em troca da hierarquia visual pretendida.

## Risks / Trade-offs

- **Fidelidade cromática**: `rose-700` não é exatamente `#c0392b`. Se a OAB tiver manual de marca com valor fechado, o token precisa ser trocado — está isolado em `globals.css`.
- **`<br>` fixo**: em ~320px produz quatro linhas curtas. Mitigável trocando por `<br className="hidden lg:inline" />` se incomodar.
- **Mockup pode divergir do painel real**: a `dashboard-preview` é ilustrativa. Quando o painel existir de verdade, os dois precisam ser revisados juntos ou a landing vira propaganda enganosa.
- **Rodapé aponta para rotas inexistentes**: `/privacidade`, `/suporte` e `/status` dão 404 hoje.

## Migration Plan

Não há migração — é o primeiro incremento funcional do repositório. O `src/app/globals.css` do template foi movido para `src/app/styles/globals.css` e o import em `layout.tsx` acompanhou.

## Open Questions

- A rota do CTA será `/painel` ou `/login`? Hoje aponta para `/painel`.
- O rodapé precisa mesmo dos três links, ou basta "Suporte"?
- A landing deve continuar pública quando o painel existir, ou redirecionar quem já tem sessão?
