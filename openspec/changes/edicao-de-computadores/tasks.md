## 1. Integração com a `api-fr` (concluída)

- [x] 1.1 Confirmar no repositório da `api-fr` que `PATCH /computers/update/:id` existe — a change
      `cadastro-de-computadores` afirmava o contrário, sem ter aberto o código do servidor
- [x] 1.2 `server/computers/update.ts` chamando `PATCH /computers/update/:id`, com corpo parcial
- [x] 1.3 Documentar no próprio módulo o que a rota **não** valida: sala inativa e máquina em uso
- [x] 1.4 Registrar que as três unicidades são checadas contra a **sala efetiva**, excluindo o próprio
      registro — por isso reenviar campo inalterado é inócuo

## 2. Formulário de edição (concluída)

- [x] 2.1 `update-computer-schema.tsx` com as mesmas regras do cadastro e valores iniciais por parâmetro
- [x] 2.2 `update-computer.tsx` como diálogo, no arranjo do cadastro
- [x] 2.3 `disablePointerDismissal` — clique fora não fecha; ESC e Cancelar fecham
- [x] 2.4 `reset(computerFormValues)` na abertura, para o rascunho abandonado não virar valor salvo
- [x] 2.5 Salvar desabilitado por `isDirty` e durante a chamada
- [x] 2.6 Bloquear o fechamento enquanto a requisição está de pé
- [x] 2.7 Máscara de MAC e `maxLength={17}`, iguais às do cadastro
- [x] 2.8 Devolver o foco ao campo de MAC quando a API recusa

## 3. O que a edição tem e o cadastro não (concluída)

- [x] 3.1 Incluir a sala atual no seletor mesmo inativa, identificada como tal no item
- [x] 3.2 Manter as demais opções restritas às salas ativas
- [x] 3.3 Excluir a própria máquina da lista de números em uso
- [x] 3.4 Aviso no diálogo quando a máquina está em uso, explicando o efeito de trocar MAC ou sala
- [x] 3.5 Explicar, ao trocar a sala, de onde a máquina sai e para onde vai

## 4. Listagem (concluída)

- [x] 4.1 `<UpdateComputer />` na coluna de ações, antes de `<DeleteComputer />`
- [x] 4.2 Invalidar `getComputers()` e `getRooms()` após salvar — mover de sala muda as duas listas

## 5. Correção da documentação (concluída)

- [x] 5.1 Remover a lacuna "editar computador não existe" do `DOC.md`
- [x] 5.2 Corrigir a seção `/admin/computers` do `DOC.md`
- [x] 5.3 Marcar Editar como concluído no `ROADMAP.md`
- [x] 5.4 Corrigir `proposal.md`, `design.md` e `tasks.md` de `cadastro-de-computadores`
- [x] 5.5 Registrar que a **descrição** também é única por sala — o `DOC.md` só citava o número

## 6. Verificação

- [x] 6.1 `npx tsc --noEmit` sem erros
- [x] 6.2 `npx biome check` sem issues
- [x] 6.3 `npm run build` — `/admin/computers` continua registrada como rota dinâmica
- [ ] 6.4 Editar a descrição de uma máquina com um `ADMIN` real e conferir a tabela e a grade do painel
- [ ] 6.5 Corrigir um MAC errado e conferir que a estação passa a aparecer como online no painel
- [ ] 6.6 Repetir o MAC de outra máquina e conferir a mensagem da API e o foco no campo de MAC
- [ ] 6.7 Repetir o número de outra máquina da mesma sala e conferir a mensagem da API
- [ ] 6.8 Repetir a descrição de outra máquina da mesma sala e conferir a mensagem da API
- [ ] 6.9 Mover a máquina de sala e conferir que ela troca de grade no painel
- [ ] 6.10 Abrir a edição de uma máquina que está numa sala **inativa** e conferir que o seletor vem
      preenchido com ela, marcada como inativa
- [ ] 6.11 Conferir que os números em uso não incluem o número da própria máquina
- [ ] 6.12 Abrir a edição de uma máquina **em uso** e conferir o aviso
- [ ] 6.13 Abrir, mudar algo, cancelar, reabrir e conferir que o rascunho não voltou
- [ ] 6.14 Conferir que Salvar só habilita depois de alguma alteração
- [ ] 6.15 Clicar fora do diálogo e conferir que ele não fecha; conferir ESC e Cancelar
- [ ] 6.16 Conferir o diálogo abaixo de 768px

## 7. Próximos passos (fora desta change)

- [ ] 7.1 Decidir se a `api-fr` deve recusar edição de máquina em uso, ao menos para `macCode` e `roomId`
- [ ] 7.2 Decidir se a `api-fr` deve recusar sala de destino inativa
- [ ] 7.3 Reavaliar a exclusão em cascata, agora que a edição cobre os casos que levavam a excluir
- [ ] 7.4 Criar a última área administrativa: `/admin/employees`
