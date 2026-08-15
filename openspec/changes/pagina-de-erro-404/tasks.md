## 1. Página 404 (concluída)

- [x] 1.1 Ler o design de origem no projeto Claude Design (`Sala Livre - 404`)
- [x] 1.2 Criar `src/app/not-found.tsx` como Server Component
- [x] 1.3 Traduzir os hex do design (`#16213e`, `#c0392b`, `#f6f7fb`) para tokens do tema
- [x] 1.4 Montar o emblema do 404 com o `BrandMark` esmaecido e o número sobreposto
- [x] 1.5 Reaproveitar `Header`, `Footer` e `GridOverlay` em vez de recriar marcação
- [x] 1.6 Adicionar o brilho radial do topo como elemento decorativo com `aria-hidden`
- [x] 1.7 Badge de status, título e texto explicativo na linguagem da landing

## 2. Caminhos de retorno (concluída)

- [x] 2.1 Chamada principal "Voltar ao painel" como `Link` para `/auth/sign-in`
- [x] 2.2 Criar `src/components/app/back-button.tsx` com `'use client'`, isolando o `useRouter`
- [x] 2.3 Tratar a ausência de histórico (`window.history.length <= 1`) navegando para o destino alternativo
- [x] 2.4 Expor `fallbackHref` com padrão `/`

## 3. Responsividade (concluída)

- [x] 3.1 Botões `w-full` empilhados no mobile, virando linha a partir de `sm`
- [x] 3.2 Emblema e tipografia escalando entre mobile e desktop
- [x] 3.3 Prender o rodapé ao fim da viewport no mobile com `flex min-h-svh flex-col` e `flex-1` no `<main>`
- [x] 3.4 Restringir o wrapper flex ao mobile (`sm:block sm:min-h-0`), porque `mx-auto` no `Header`/`Footer`
      cancela o `align-items: stretch` e os encolheria para o tamanho do conteúdo no desktop

## 4. Correções aplicadas durante a construção (concluída)

- [x] 4.1 Remover os imports de ícones que ficaram órfãos após a retirada dos cards de sugestão
- [x] 4.2 Aplicar `pnpm biome check --write` no repositório, alinhando os arquivos de configuração às
      convenções do `biome.json`

## 5. Verificação

- [x] 5.1 `pnpm exec tsc --noEmit` sem erros
- [x] 5.2 `pnpm biome check` sem issues
- [x] 5.3 `pnpm build` gerando `/_not-found` como estática
- [ ] 5.4 Conferir em viewport real de 320px, 768px e 1440px
- [ ] 5.5 Conferir o retorno pelo histórico em aba nova (sem histórico) e em navegação interna

## 6. Próximos passos (fora desta change)

- [ ] 6.1 `error.tsx` e `loading.tsx` globais
- [ ] 6.2 Criar as rotas `/privacidade`, `/suporte` e `/status` que o rodapé referencia
- [ ] 6.3 Rever o destino de "Voltar ao painel" quando o painel autenticado existir
