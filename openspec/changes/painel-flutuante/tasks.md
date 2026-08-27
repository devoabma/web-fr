## 1. Fechamento ao navegar (concluída)

- [x] 1.1 Fechar a navegação ao escolher uma área, apenas em telas estreitas
- [x] 1.2 Manter o comportamento do desktop, onde a navegação ocupa coluna própria

## 2. Menu como painel flutuante (concluída)

- [x] 2.1 Trocar o componente do ramo de telas estreitas pelo painel de arrasto usado nos formulários
- [x] 2.2 Direção do arrasto seguindo o lado da navegação
- [x] 2.3 Respiro, cantos, sombra e cor do menu preservados
- [x] 2.4 Largura mantida com `!`, por causa do seletor mais específico do componente
- [x] 2.5 Apagar a faixa pintada para fora da borda
- [x] 2.6 Título e descrição acessíveis, em português
- [x] 2.7 Remover a regra que escondia o botão de fechar injetado pelo componente antigo

## 3. Moldura como ilha (concluída)

- [x] 3.1 Ligar `variant="inset"` na navegação do painel
- [x] 3.2 Declarar a cor de fundo do wrapper diretamente, para valer também em telas estreitas
- [x] 3.3 Declarar margem, cantos e sombra da ilha abaixo de 768px
- [x] 3.4 Recortar o transbordo da ilha, nas duas larguras
- [x] 3.5 Remover a borda inferior da barra superior

## 4. Marca ancorada (concluída)

- [x] 4.1 `panel-brand.tsx` como componente de cliente, lendo o estado da navegação
- [x] 4.2 Largura igual à da coluna, encolhendo junto no modo faixa de ícones
- [x] 4.3 Recuo de 16px alinhando o símbolo à caixa dos ícones do menu
- [x] 4.4 Rótulo oculto quando a navegação está recolhida
- [x] 4.5 Transição de largura na mesma duração da navegação
- [x] 4.6 Recuo da barra superior transferido para a marca no desktop

## 5. Verificação

- [x] 5.1 `pnpm exec tsc --noEmit` sem erros
- [x] 5.2 `pnpm biome check` sem issues
- [x] 5.3 `pnpm build` sem erros
- [ ] 5.4 Abaixo de 768px: abrir o menu, tocar numa área e conferir que ele fecha junto com a troca de página
- [ ] 5.5 Arrastar o menu para o lado e conferir que ele fecha acompanhando o dedo
- [ ] 5.6 Rolar a lista de navegação com o menu aberto e conferir que o arrasto não dispara
- [ ] 5.7 Conferir que o menu e os painéis de formulário têm o mesmo respiro e o mesmo raio
- [ ] 5.8 Conferir a marca decorativa da navegação, agora recortada pelo canto arredondado
- [ ] 5.9 Acima de 768px: conferir a ilha do conteúdo e a ausência da linha sob a barra superior
- [ ] 5.10 Recolher a navegação e conferir que o símbolo da marca não se desloca
- [ ] 5.11 Conferir o contraste da ilha nos temas claro e escuro
- [ ] 5.12 Decidir se o tratamento do desktop fica

## 6. Próximos passos (fora desta change)

- [ ] 6.1 Acertar o alinhamento horizontal da barra superior com a borda da ilha, se destoar no uso
- [ ] 6.2 Avaliar a remoção do componente `sheet`, sem uso no projeto desde esta change
