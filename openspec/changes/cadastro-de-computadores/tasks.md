## 1. Rota da área (concluída)

- [x] 1.1 Criar `(private)/admin/computers/page.tsx` com cabeçalho e descrição da área
- [x] 1.2 Posicionar o gatilho de cadastro à direita do cabeçalho
- [x] 1.3 Declarar `metadata.title = 'Computadores'` na própria rota, como manda a convenção fixada em
      `secao-administracao-por-papel`
- [x] 1.4 Confirmar que a rota já é coberta pelo corte de papel do `proxy.ts` (`ADMIN_ROUTES`)
- [x] 1.5 Manter os componentes em `_components/`, como nas demais rotas do app

## 2. Listagem (concluída)

- [x] 2.1 `server/computers/get-all.ts` chamando `GET /computers/get-all`, com a sala embutida no tipo
- [x] 2.2 `queryKeys.getComputers()` em `constants/query-keys.ts`
- [x] 2.3 `computers-table.tsx` no mesmo desenho de `rooms-table.tsx` — busca acima, `DataTable` abaixo
- [x] 2.4 Busca por sala **ou** descrição, com `useMemo` sobre a lista já carregada
- [x] 2.5 Aviso de falha no lugar da tabela quando a consulta erra
- [x] 2.6 `computers-columns.tsx`: número como `ESTAÇÃO-01`, descrição, sala, MAC, situação e data
- [x] 2.7 Situação em três estados, com manutenção vencendo `inUse`
- [x] 2.8 `skeletonClassName` por coluna, para o carregamento não pular largura

## 3. Formulário de novo computador (concluída)

- [x] 3.1 `new-computer-schema.tsx` com Zod: `roomId` (cuid2), `number` (inteiro ≥ 1), `description`
      (1–50), `macCode` pelo schema compartilhado
- [x] 3.2 `number` com `valueAsNumber` no `register` — campo numérico entrega string por padrão
- [x] 3.3 Painel lateral (`Sheet`) com formulário externo ao rodapé, ligado por `form="new-computer-form"`
- [x] 3.4 Seletor de sala listando só sala ativa (`inactive === null`), com a contagem de máquinas no item
- [x] 3.5 Botão de envio e seletor desabilitados quando não há sala ativa, com o motivo abaixo do campo
- [x] 3.6 Sugerir `maior + 1` ao trocar de sala e listar os números já em uso
- [x] 3.7 `setValue` com `shouldValidate` — sem isso a mensagem de erro anterior fica sob o campo já
      preenchido com um valor válido
- [x] 3.8 Campo de descrição com `uppercase` na tela, espelhando o que a API grava

## 4. MAC (concluída)

- [x] 4.1 `utils/masks/mac-code.ts`: só hexadecimal, corte em 12, maiúscula e agrupamento com hífen
- [x] 4.2 `maxLength={17}` no campo — 12 dígitos mais 5 hífens
- [x] 4.3 `utils/schemas/mac-code.ts`: normalizar `:`, `.`, `-` e espaço antes de validar
- [x] 4.4 Reaplicar o formato com hífen depois da validação, para o envio sair sempre igual

## 5. Exclusão (concluída)

- [x] 5.1 `server/computers/delete.ts` chamando `DELETE /computers/delete/:id`, com o efeito em cascata
      documentado no próprio módulo
- [x] 5.2 `delete-computer.tsx` com confirmação por digitação da descrição, insensível a caixa e a espaço
- [x] 5.3 Limpar a confirmação ao fechar — sem isso, reabrir já viria confirmado
- [x] 5.4 `Enter` no campo confirma, mas só quando o nome já bate
- [x] 5.5 Máquina em uso com `aria-disabled` e o motivo no tooltip
- [x] 5.6 Bloquear o fechamento do diálogo enquanto a exclusão está de pé

## 6. Integração com a `api-fr` (concluída)

- [x] 6.1 `server/computers/create.ts` chamando `POST /computers/create`
- [x] 6.2 Invalidar `getComputers()` e `getRooms()` após cadastro e após exclusão
- [x] 6.3 `try/catch` com `getApiErrorMessage` e `getRetryAfterInSeconds` nas duas ações
- [x] 6.4 Devolver o foco ao campo de MAC quando a API recusa o cadastro
- [x] 6.5 Bloquear o fechamento do painel lateral enquanto a requisição está de pé
- [x] 6.6 Desabilitar o botão durante o envio — dois cliques criavam a máquina e depois acusavam MAC repetido
- [x] 6.7 Invalidar `getComputers()` também no `refreshBoard` do painel, para a manutenção alternada na
      grade valer na listagem administrativa

## 7. Ajuste de rótulo (concluída)

- [x] 7.1 "Adicionar Sala" → "Adicionar" no gatilho de `/admin/rooms`, igualando as duas áreas

## 8. Verificação

- [x] 8.1 `npx tsc --noEmit` sem erros
- [x] 8.2 `npx biome check` sem issues
- [x] 8.3 `npm run build` — `/admin/computers` registrada como rota dinâmica
- [ ] 8.4 Cadastrar uma máquina com um `ADMIN` real e conferir que ela aparece na tabela e na grade do
      painel sem recarregar a página
- [ ] 8.5 Repetir o número de uma máquina existente na mesma sala e conferir a mensagem da API
- [ ] 8.6 Repetir um MAC já cadastrado e conferir a mensagem da API e o foco de volta no campo de MAC
- [ ] 8.7 Colar um MAC no formato `00:1A:2B:3C:4D:5E` e conferir que o cadastro passa
- [ ] 8.8 Trocar de sala no seletor e conferir o número sugerido e a lista de números em uso
- [ ] 8.9 Submeter com o número vazio, depois trocar de sala, e conferir que a mensagem de erro some
- [ ] 8.10 Buscar pelo nome da sala e pela descrição e conferir que as duas formas encontram
- [ ] 8.11 Tentar excluir uma máquina em uso e conferir o tooltip e o bloqueio
- [ ] 8.12 Excluir uma máquina, conferir a confirmação por digitação e a saída da tabela e da grade
- [ ] 8.13 Alternar manutenção pela grade do painel e conferir a coluna de situação em `/admin/computers`
- [ ] 8.14 Inativar todas as salas e conferir o aviso de "nenhuma sala ativa" no formulário
- [ ] 8.15 Conferir o painel lateral e o diálogo abaixo de 768px
- [ ] 8.16 Abrir `/admin/computers` com um `MEMBER` e confirmar o retorno ao painel pelo proxy

## 9. Próximos passos (fora desta change)

- [ ] 9.1 Pedir `PATCH /computers/update/:id` à `api-fr` — hoje corrigir um MAC exige excluir o histórico
- [ ] 9.2 Avaliar inativação no lugar da exclusão, para preservar sessões e impressões
- [ ] 9.3 Paginar e buscar no servidor quando o inventário crescer
- [ ] 9.4 Decidir se a listagem administrativa também alterna manutenção
- [ ] 9.5 Criar a última área administrativa: `/admin/employees`
