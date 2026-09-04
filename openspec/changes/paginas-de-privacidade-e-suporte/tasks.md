## 1. Levantamento do conteúdo

- [x] 1.1 Conferir no schema da `api-fr` quais dados pessoais o Sala Livre realmente persiste, por
      ator (advogado, funcionário, equipamento) — a seção 2 da política sai daí, não de modelo pronto
- [x] 1.2 Listar as recusas de liberação que a `api-fr` devolve, para virarem uma a uma as subseções
      da parte 1 do suporte
- [x] 1.3 Separar o que é regra fixa do produto do que é configurável por ambiente (cota, tempo de
      sessão, condições extras) — o que varia é descrito como "conforme as regras do ambiente"

## 2. Casca das páginas de texto

- [x] 2.1 `legal-page.tsx` reaproveitando `Header`, `Footer` e `GridOverlay`, com o mesmo badge e
      ritmo tipográfico da landing
- [x] 2.2 `updatedAt` opcional — só a política versiona data; o suporte é guia vivo
- [x] 2.3 Blocos de texto sem lógica: `LegalSection`, `LegalSubsection`, `LegalText`, `LegalStrong`
      e `LegalList`
- [x] 2.4 `LegalContact` com peso visual próprio, para o titular achar o canal sem ler o documento
      inteiro
- [x] 2.5 `src/constants/contact.ts` com o e-mail único das duas páginas

## 3. Política de privacidade (`/privacy`)

- [x] 3.1 Dez seções, da descrição do produto às atualizações da própria política
- [x] 3.2 Seção 2 dividida por ator, com o MAC nomeado em 2.3 e os arquivos de impressão em 2.4
- [x] 3.3 Validação cadastral externa dita explicitamente em 2.1
- [x] 3.4 Direitos do titular (seção 8) citando a Lei nº 13.709/2018 e remetendo ao canal de contato
- [x] 3.5 `metadata` própria e data de última atualização

## 4. Suporte (`/support`)

- [x] 4.1 Parte 1 titulada pela situação que a pessoa vê na tela, não pelo módulo do sistema
- [x] 4.2 Parte 2 com sessão encerrada e falha técnica do equipamento
- [x] 4.3 Parte 3 com o fluxo de impressão e a retenção temporária dos arquivos
- [x] 4.4 Parte 4 com o que informar ao abrir chamado, para evitar a ida e volta
- [x] 4.5 Parte 5 avisando que ninguém do suporte pede senha
- [x] 4.6 Referência cruzada com a política de privacidade, e vice-versa

## 5. Rotas e rodapé

- [x] 5.1 `/privacy` e `/support` em inglês, seguindo a convenção do repositório
- [x] 5.2 Confirmar as duas em `PUBLIC_ROUTES` — sob negar por padrão, ficar de fora manda o
      visitante para o login em vez da página
- [x] 5.3 Remover `/status` do rodapé **e** de `PUBLIC_ROUTES`: rota pública sem página é 404 pública
- [x] 5.4 Corrigir a task 9.2 de `landing-page-institucional`, que registrava os caminhos em
      português e ainda previa `/status`

## 6. Landing

- [x] 6.1 Trocar as 144 linhas de mockup de `dashboard-preview.tsx` pelo print real do painel
- [x] 6.2 `priority` (é o LCP) e `sizes` declarado, para o celular não baixar a versão de 1600px
- [x] 6.3 Remover `quality={100}`: no Next 16 o default de `images.qualities` é `[75]` e o valor fora
      da lista é coagido em silêncio — o prop pedia 100 e o build entregava 75
- [x] 6.4 `grid-overlay.tsx`: `[background-image:…]` → utilitário `bg-[…]`

## 7. Verificação

- [x] 7.1 `pnpm exec tsc --noEmit` limpo
- [x] 7.2 `pnpm biome check` limpo — atenção: o resumo do RTK reportou "No issues found" com dois
      erros de formatação pendentes; conferido com `rtk proxy` e corrigido
- [x] 7.3 `pnpm build` completo, com `/privacy` e `/support` saindo **estáticas** (não leem cookie)
- [ ] 7.4 Revisão jurídica do texto da política antes da publicação em produção
- [ ] 7.5 Confirmar que `admin@salalivre.app` é caixa monitorada, e por quem
