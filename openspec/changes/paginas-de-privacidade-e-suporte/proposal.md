## Why

O rodapé da landing prometia três páginas — **Privacidade**, **Suporte** e **Status** — e nenhuma
existia. Os três caminhos estavam em `PUBLIC_ROUTES`, então o proxy liberava a passagem e o visitante
caía direto na 404. Rodapé é o lugar onde se procura a política de privacidade quando se desconfia de
alguma coisa; encontrar 404 ali é a pior resposta possível.

E o Sala Livre não é um produto que possa adiar isso. Ele trata **CPF, data de nascimento, número de
inscrição na OAB, situação cadastral, registro de qual computador cada pessoa usou e por quanto
tempo** — e, quando a impressão está ligada, os **próprios arquivos enviados**. Sob a LGPD, um
tratamento desse porte sem política publicada não é pendência de roadmap: é o titular sem lugar para
exercer os direitos do art. 18.

A página de suporte fecha o outro vazio. As recusas de liberação da `api-fr` chegam ao advogado como
uma frase curta na tela da estação ("cadastro inativo", "já existe uma sessão ativa", "limite de uso
atingido") e o funcionário do balcão não tem onde consultar o que cada uma significa. Hoje isso vira
ligação para a seccional.

## What Changes

- **`/privacy`** — política de privacidade em dez seções, escrita sobre os dados que o schema da
  `api-fr` realmente guarda, e não sobre um modelo genérico: os dados do advogado, os do funcionário
  autorizado, os do equipamento (inclusive MAC) e os arquivos temporários de impressão. Carrega a
  data da última atualização, porque política sem data não dá para saber se ainda vale.
- **`/support`** — guia de atendimento organizado pelo que a pessoa está vendo na tela, não pela
  arquitetura do sistema. As subseções da parte 1 espelham uma a uma as recusas de liberação da
  `api-fr`; a parte 4 lista o que informar ao abrir um chamado, para o funcionário não precisar de
  duas idas e voltas.
- **`/status` sai do rodapé e de `PUBLIC_ROUTES`.** Página de status é promessa de monitoramento
  externo e histórico de incidentes — não existe nada disso aqui. O que existe é o selo de saúde
  dentro do painel (`selo-de-saude-da-api`), que consulta `GET /health` e serve a quem opera o balcão.
  Manter o link seria repetir, com mais cerimônia, o erro do selo "All OK": um indicador que promete
  o que não pode cumprir.
- **`LegalPage` como casca das duas telas**, reaproveitando `Header`, `Footer` e `GridOverlay` da
  landing. Quem chega pelo rodapé continua dentro do site, e não numa página solta de texto.
- **Uma constante para o e-mail de atendimento** (`src/constants/contact.ts`), porque o mesmo
  endereço aparece nas duas páginas. Divergir é pior do que não ter: o titular escreve para uma caixa
  que ninguém lê e conclui que foi ignorado.
- **O mockup do painel na landing vira o print real** (`dashboard-preview.tsx`). Eram 144 linhas de
  JSX imitando uma tela — dados falsos, estados falsos, e um custo de manutenção que só crescia a cada
  mudança no painel de verdade. Um `next/image` faz o mesmo trabalho e não mente sobre o produto.

## Capabilities

### New Capabilities
- `paginas-de-privacidade-e-suporte`: as duas páginas públicas de texto do Sala Livre — a política de
  privacidade exigida pela LGPD e o guia de atendimento — servidas estaticamente e alcançáveis sem
  sessão.

### Modified Capabilities
<!-- Nenhuma spec sincronizada é alterada: `openspec/specs/` continua vazio. A remoção de `/status`
     mexe em `landing-page-institucional`, cuja spec ainda não foi sincronizada — a correção está
     registrada aqui e na task 9.2 daquela change. -->

## Impact

- Novo: `src/app/(public)/privacy/page.tsx`, `src/app/(public)/support/page.tsx`,
  `src/components/app/legal-page.tsx` (a casca e os seis blocos de texto),
  `src/constants/contact.ts` e `public/assets/sala-livre-content.png`.
- Alterado: `src/components/app/footer.tsx` (sai o link de Status), `src/lib/auth/routes.ts` (sai
  `/status` de `PUBLIC_ROUTES`), `src/components/app/dashboard-preview.tsx` (mockup → print) e
  `src/components/app/grid-overlay.tsx` (`[background-image:…]` → utilitário `bg-[…]`).
- Reusado sem alteração: `Header`, `Footer`, `GridOverlay`, `Badge` e o `matchesRoute` do proxy.
- **Sem dependência nova.** Nenhuma biblioteca entrou.
- Não depende de trabalho na `api-fr`: as duas páginas são texto estático e não fazem nenhuma
  chamada.
