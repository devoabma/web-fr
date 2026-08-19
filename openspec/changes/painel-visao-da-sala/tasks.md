## 1. Primitivos de interface (concluída)

- [x] 1.1 `src/components/ui/select.tsx` — `Root`, `Trigger`, `Value`, `Content` (portal + positioner),
      `Item` com indicador, `Group`, `Label`, `Separator` e setas de rolagem sobre `@base-ui/react/select`
- [x] 1.2 `src/components/ui/dialog.tsx` — `Content`, `Header`, `Title`, `Description`, `Footer`, `Close`
- [x] 1.3 `src/components/ui/alert-dialog.tsx` — mesma anatomia, mais `Media`, `Action` e `Cancel`
- [x] 1.4 Manter o estilo `base-nova` do `components.json`, sem divergir dos demais primitivos
- [x] 1.5 `dropdown-menu.tsx`: `min-w-[96px]` → `min-w-24`, valor arbitrário trocado pela escala do Tailwind

## 2. Camada de dados (concluída)

- [x] 2.1 `src/server/rooms/get-all.ts` — `GET /rooms/get-all` pelo cliente axios
- [x] 2.2 Tipar `RoomProps` espelhando a resposta: `standardTime`, `employeesRooms`, `computers`
- [x] 2.3 Marcar como anuláveis os campos que a API devolve assim (`description`, `inactive`,
      `imageUrl`, `maintenance`)
- [x] 2.4 Exportar `RoomProps` — os componentes derivam dela em vez de redeclarar o shape
- [x] 2.5 `queryKeys.getRooms()` no catálogo de chaves do React Query

## 3. Cabeçalho e aviso da tela (concluída)

- [x] 3.1 `page.tsx` deixa de ser placeholder: título, subtítulo e composição da tela
- [x] 3.2 `releases-notice.tsx` — o advogado se libera sozinho; esta tela é para casos especiais
- [x] 3.3 Registrar no aviso as duas regras que o funcionário precisa saber: acesso restrito a inscritos
      regulares e cota compartilhada por dia, não por máquina
- [x] 3.4 `hidden sm:flex` — no celular o aviso empurraria a sala para baixo da dobra

## 4. Quadro da sala (concluída)

- [x] 4.1 `releases-board.tsx` com `useQuery` sobre `getAllRooms`
- [x] 4.2 Filtrar sala inativa antes de montar a lista
- [x] 4.3 Sala exibida derivada (`find ?? at(0)`), sem `useEffect` gravando o padrão no estado
- [x] 4.4 `skeleton` com a estrutura do resultado, para a faixa não mudar de altura
- [x] 4.5 Estado de erro com texto próprio, separado do estado vazio
- [x] 4.6 Estado vazio: nenhuma sala ativa cadastrada para a Seccional
- [x] 4.7 Linha de cota e total de computadores, com plural correto e `padStart(2, '0')`

## 5. Seleção de sala (concluída)

- [x] 5.1 `room-select.tsx` sobre o primitivo `Select`
- [x] 5.2 Item em duas linhas (nome + descrição); no gatilho, só o nome
- [x] 5.3 Guarda `roomId && onValueChange(roomId)` — o `Select` emite vazio ao limpar
- [x] 5.4 Nome da sala em caixa normal: `uppercase` é reservado a rótulo no painel
- [x] 5.5 Descrição longa contida: `min-w-0` no item, `whitespace-normal` e `line-clamp-2` na descrição,
      `truncate` no nome

## 6. Colaboradores da sala (concluída)

- [x] 6.1 `room-employees.tsx` com `AvatarGroup` e tooltip por avatar
- [x] 6.2 Deduplicar por `employees.id` — `employeesRooms` é vínculo, não funcionário
- [x] 6.3 Teto de 4 avatares; excedente em `+N` com os nomes no tooltip
- [x] 6.4 Não renderizar nada quando a sala não tem colaborador vinculado
- [x] 6.5 `role="img"` e `aria-label` no avatar, que sem foto mostra só iniciais

## 7. Peças da grade de computadores (construídas, não montadas)

- [x] 7.1 `_data/rooms.ts` — dados fake constantes, sem `new Date()` nem `Math.random()` (hidratação)
- [x] 7.2 `computer-card.tsx` — três estados, faixa lateral colorida, ações por estado
- [x] 7.3 `formatMinutesAsClock` — `01:12` em vez de "72 minutos"
- [x] 7.4 Barra do saldo do dia, com percentual limitado a 0–100
- [x] 7.5 `timeZone: 'America/Fortaleza'` na formatação de data, contra erro de hidratação
- [x] 7.6 Tooltip no botão desabilitado por meio de `span` envolvente
- [x] 7.7 `status-summary.tsx` — contagem por estado
- [x] 7.8 `close-session-dialog.tsx` — `AlertDialog` destrutivo, avisando que o tempo volta para a cota
- [x] 7.9 `release-computer-dialog.tsx` — CPF, OAB e data de nascimento
- [x] 7.10 `reset()` ao abrir o diálogo — sem isso o CPF do advogado anterior reaparece na máquina seguinte
- [x] 7.11 `release-computer-schema.tsx` — data validada por reconstrução, rejeitando 31/02 e data futura
- [x] 7.12 `src/utils/masks/birth-date.ts` — máscara progressiva `00/00/0000`
- [ ] 7.13 **Montar a grade no quadro** — nada disso é importado por tela alguma hoje
- [ ] 7.14 Traduzir `inUse`/`maintenance` da API para o `status` de três valores das peças
- [ ] 7.15 Decidir o estado exibido quando `inUse` e `maintenance` são verdadeiros ao mesmo tempo

## 8. Verificação

- [x] 8.1 `pnpm exec tsc --noEmit` sem erros
- [x] 8.2 `pnpm biome check` sem issues
- [x] 8.3 `pnpm build` — as quatro rotas e o proxy registrados
- [ ] 8.4 Conferir contra a `api-fr` local: sala com colaborador, sala sem colaborador e sala inativa
- [ ] 8.5 Conferir o estado vazio com um funcionário sem sala vinculada
- [ ] 8.6 Conferir a descrição longa no `Select`, aberto e fechado, abaixo de 640px
- [ ] 8.7 Conferir o `Select` por teclado: abrir, navegar, escolher e fechar com `Esc`
- [ ] 8.8 Conferir a fileira de avatares com mais de 4 colaboradores e com `imageUrl` inacessível
- [ ] 8.9 Conferir a faixa da sala em 320px, 768px e 1440px

## 9. Próximos passos (fora desta change)

- [ ] 9.1 Grade de computadores em tela, ligada ao `computers` da sala selecionada
- [ ] 9.2 `PATCH /computers/maintenance/:id` e `.../remove` no botão de manutenção
- [ ] 9.3 `POST /lawyers/close-computer/:sessionId` no diálogo de encerrar sessão
- [ ] 9.4 Saldo restante por sessão, para alimentar o contador e a barra do card
- [ ] 9.5 Polling enquanto não houver eventos de negócio no WebSocket
- [ ] 9.6 ⛔ Liberação manual — bloqueada até a `api-fr` expor a rota
- [ ] 9.7 `loading.tsx` da rota, aproveitando o `skeleton` já desenhado
