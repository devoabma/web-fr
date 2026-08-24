## 1. Cliente da rota (concluída)

- [x] 1.1 `server/rooms/update.ts` chamando `PATCH /rooms/update/:id`
- [x] 1.2 Corpo parcial — os três campos opcionais, como a rota aceita
- [x] 1.3 `description` tipada como `string | null`, para o compilador cobrar a distinção entre limpar
      (`null`) e manter (omitido)
- [x] 1.4 `roomId` no corpo do argumento, e não como segundo parâmetro, para caber no `mutationFn`

## 2. Schema do formulário (concluída)

- [x] 2.1 `update-room-schema.tsx` com as mesmas regras do cadastro (nome 3–60, tempo 15–480 inteiros,
      descrição até 200)
- [x] 2.2 Valores iniciais por parâmetro, e não constantes — na edição a base é a sala, e é dela que sai o
      `isDirty`

## 3. Diálogo de edição (concluída)

- [x] 3.1 `update-room.tsx` com gatilho próprio (botão da linha + tooltip)
- [x] 3.2 Campos de nome, tempo padrão e descrição preenchidos com a sala
- [x] 3.3 `description` `null` da sala convertida para `''` no formulário — input controlado não aceita
      `null`
- [x] 3.4 Prévia do identificador pelo `maskSlug`, no mesmo arranjo do cadastro
- [x] 3.5 Leitura do tempo em horas ao lado do campo, com `aria-live="polite"`
- [x] 3.6 `disablePointerDismissal` — clique fora não fecha
- [x] 3.7 ESC e Cancelar continuam fechando, para o modal ter saída pelo teclado
- [x] 3.8 `reset(roomFormValues)` na abertura, para rascunho abandonado não voltar como valor salvo
- [x] 3.9 Diálogo resistindo ao fechamento enquanto a chamada está de pé
- [x] 3.10 Salvar indisponível sem alteração (`isDirty`) e durante a chamada (`isPending`)
- [x] 3.11 `description || null` no envio, para campo apagado limpar em vez de gravar string vazia
- [x] 3.12 `queryKeys.getRooms()` invalidada após o salvamento
- [x] 3.13 `getApiErrorMessage` + `getRetryAfterInSeconds` no padrão do resto do painel
- [x] 3.14 Foco devolvido ao nome quando a edição é recusada

## 4. Ligação na listagem (concluída)

- [x] 4.1 Botão morto de editar removido de `rooms-columns.tsx`
- [x] 4.2 `<UpdateRoom room={room} />` na coluna de ações, cada linha editando a sala dela

## 5. Verificação

- [x] 5.1 `pnpm exec tsc --noEmit` sem erros
- [x] 5.2 `pnpm biome check --write` sem issues
- [x] 5.3 `pnpm build` — `/admin/rooms` segue registrada como rota dinâmica
- [ ] 5.4 Editar o nome de uma sala com um `ADMIN` real e conferir que a linha muda sem recarregar
- [ ] 5.5 Editar o tempo padrão e conferir a cota nova no painel de liberação
- [ ] 5.6 Apagar a descrição e conferir que a sala fica sem descrição, e não com uma em branco
- [ ] 5.7 Renomear uma sala para o nome de outra e conferir a recusa "Sala com esse nome já cadastrada."
- [ ] 5.8 Abrir o diálogo, digitar, cancelar, reabrir e conferir que o rascunho não voltou
- [ ] 5.9 Alterar um campo e desfazer a alteração, conferindo que Salvar volta a ficar indisponível
- [ ] 5.10 Clicar fora do diálogo com o formulário preenchido e conferir que ele não fecha
- [ ] 5.11 Fechar com ESC e com Cancelar, conferindo que os dois funcionam
- [ ] 5.12 Tentar fechar durante a chamada e conferir que o diálogo resiste
- [ ] 5.13 Clicar duas vezes em Salvar e conferir que só um `PATCH` acontece
- [ ] 5.14 Conferir o diálogo abaixo de 640px

## 6. Próximos passos (fora desta change)

- [ ] 6.1 Normalizar a exibição do nome da sala — a API grava em caixa alta e o painel mostra assim
- [ ] 6.2 Vincular funcionários e computadores à sala a partir da listagem
- [ ] 6.3 Decidir se o schema de cadastro e o de edição viram um só
- [ ] 6.4 Decidir a semântica de cor do interruptor de ativar/inativar (herdado da change anterior)
- [ ] 6.5 Unificar a formatação de data do painel (herdado da change anterior)
