## 1. Contrato da `api-fr` (concluída)

- [x] 1.1 Abrir o repositório da `api-fr` e ler `utils/validations/uf.ts`, as rotas de sala e a migração —
      em vez de inferir o contrato pelo que o front consome
- [x] 1.2 Confirmar que `POST /rooms/create` tem `uf` opcional com default `'MA'` no Zod
- [x] 1.3 Confirmar que `PATCH /rooms/update/:id` tem `uf` opcional **sem** default, e que ausente = mantém
- [x] 1.4 Confirmar que `GET /rooms/get-all` devolve `uf` e que a coluna é `NOT NULL`
- [x] 1.5 Confirmar no `websocket/handler.ts` que a UF vai para o Desktop no registro da estação

## 2. Lista de UFs no front (concluída)

- [x] 2.1 `constants/ufs.ts` com `UFS` (27 siglas), `Uf`, `DEFAULT_UF` e `UF_NAMES`
- [x] 2.2 Registrar no próprio módulo por que a lista é fechada e por que a escolha é sempre por `select`

## 3. Camada de servidor (concluída)

- [x] 3.1 `uf: Uf` em `RoomProps` (`server/rooms/get-all.ts`)
- [x] 3.2 `uf?: Uf` no corpo de `server/rooms/create.ts`
- [x] 3.3 `uf?: Uf` no corpo de `server/rooms/update.ts`, documentando que ausente = mantém e que `''`/`null`
      voltam 400

## 4. Cadastro de sala (concluída)

- [x] 4.1 `uf: z.enum(UFS)` no schema, com valor inicial `'MA'`
- [x] 4.2 `<Select>` das 27 siglas com o nome do estado como legenda, no padrão do cadastro de computadores
- [x] 4.3 Enviar `uf` sempre no `POST`, em vez de deixar a API assumir o padrão
- [x] 4.4 Nomear o estado no aviso de sucesso

## 5. Edição de sala (concluída)

- [x] 5.1 `uf` no schema e nos valores iniciais, partindo da UF atual da sala
- [x] 5.2 O mesmo `<Select>` do cadastro
- [x] 5.3 Enviar `uf` no `PATCH` **apenas** quando diferente da atual
- [x] 5.4 Aviso, ao trocar, de que as estações só recebem a UF nova no próximo registro do canal

## 6. Listagem (concluída)

- [x] 6.1 Apresentar a sigla junto do nome na coluna Nome
- [x] 6.2 Registrar na coluna por que a UF anda colada ao nome

## 7. Documentação (concluída)

- [x] 7.1 Atualizar o contrato de salas no `DOC.md` com o campo `uf` nas três rotas
- [x] 7.2 Registrar no `DOC.md` a dependência de ordem de deploy
- [x] 7.3 Marcar o item no `ROADMAP.md`

## 8. Verificação

- [x] 8.1 `pnpm exec tsc --noEmit` sem erros
- [x] 8.2 `pnpm exec biome check --write` sem issues
- [x] 8.3 `pnpm build` — `/admin/rooms` continua registrada como rota dinâmica
- [ ] 8.4 Subir a `api-fr` com a migração **antes** do painel
- [ ] 8.5 Cadastrar uma sala com um `ADMIN` real deixando `MA` e conferir a sigla na listagem
- [ ] 8.6 Cadastrar uma sala em outro estado e conferir a sigla gravada
- [ ] 8.7 Editar só o nome de uma sala e conferir, no banco, que a UF não mudou
- [ ] 8.8 Trocar a UF de uma sala e conferir o aviso do efeito diferido
- [ ] 8.9 Conferir no banco que a UF trocada foi gravada
- [ ] 8.10 Reconectar o Desktop de uma máquina dessa sala e conferir que ele recebe a UF nova no registro
- [ ] 8.11 Abrir a edição, trocar a UF, cancelar, reabrir e conferir que voltou a UF gravada
- [ ] 8.12 Conferir que Salvar só habilita depois de alguma alteração
- [ ] 8.13 Conferir o seletor de 27 itens abaixo de 768px, no `Sheet` e no `Dialog`

## 9. Próximos passos (fora desta change)

- [ ] 9.1 Decidir se a listagem ganha filtro por estado
- [ ] 9.2 Decidir se o painel deve mostrar a UF reportada por cada estação, para comparar com o cadastro
- [ ] 9.3 Reavaliar o regime de envio da edição de sala: `uf` é condicional, os outros três vão sempre
