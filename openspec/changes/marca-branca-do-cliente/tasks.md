## 1. Arquivo (concluída)

- [x] 1.1 `logo-oabma.png` substituído por `logo-cliente.png`
- [x] 1.2 Nenhuma referência restante ao nome antigo

## 2. Cabeçalho público (concluída)

- [x] 2.1 Referência ao arquivo novo, com `alt` genérico
- [x] 2.2 Altura fixa e largura automática (`h-9 w-auto`, escalando em `sm` e `lg`)
- [x] 2.3 `shrink-0` nas duas imagens
- [x] 2.4 `min-w-0` no bloco de texto da marca
- [x] 2.5 `truncate` no subtítulo
- [x] 2.6 Comentário marcando o espaço de marca branca

## 3. Painel do login (concluída)

- [x] 3.1 Referência ao arquivo novo, com `alt` genérico
- [x] 3.2 Altura fixa e largura automática (`h-8 w-auto`, escalando em `sm` e `lg`)
- [x] 3.3 Comentário explicando a dependência do fundo transparente

## 4. Normalização (concluída)

- [x] 4.1 Deslocamentos arbitrários do `sheet.tsx` trocados pelas utilidades nomeadas

## 5. Verificação

- [x] 5.1 `pnpm exec tsc --noEmit` sem erros
- [x] 5.2 `pnpm biome check` sem issues
- [x] 5.3 `pnpm build` sem erros
- [ ] 5.4 Conferir o cabeçalho da landing em 320px, 768px e 1440px
- [ ] 5.5 Conferir o painel do login nos temas claro e escuro
- [ ] 5.6 Trocar por uma logo de proporção diferente e conferir que o layout aguenta
- [ ] 5.7 Conferir que a animação das gavetas continua idêntica

## 6. Próximos passos (fora desta change)

- [ ] 6.1 Nome da instituição também variável (hoje aparece em texto em outros pontos)
- [ ] 6.2 Marca por configuração, se o mesmo deploy passar a servir mais de uma seccional
