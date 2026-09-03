## 1. Contrato da listagem de computadores (concluída)

- [x] 1.1 `ComputerWithRoomProps.isOnline` como `boolean`, documentado como canal aberto **agora** e não
      como estado do banco
- [x] 1.2 `ComputerWithRoomProps.updateStatus` como `ComputerUpdateStatus`
- [x] 1.3 `ComputerUpdateStatus` exportado como `'outdated' | 'up-to-date' | 'unknown'`, espelhando o
      `z.enum` da `api-fr`
- [x] 1.4 `unknown` documentado como **não** equivalente a "em dia", com as três origens possíveis
- [x] 1.5 `LatestAppVersionProps` com `version`, `notes` e `generatedAt`
- [x] 1.6 `GetAllComputersResponse.latestVersion` como `LatestAppVersionProps | null`
- [x] 1.7 Registrado no tipo que a comparação de versões mora no servidor, e por quê

## 2. Cliente do disparo (concluída)

- [x] 2.1 `updateComputerApp(computerId)` sobre `POST /computers/update-app/:id`
- [x] 2.2 `UpdateComputerAppResponse` com `message`, `macCode` e `version` opcional
- [x] 2.3 `version` documentada como opcional porque a API pode ainda não saber qual é a publicada
- [x] 2.4 Documentado que o `200` confirma o **envio do recado**, nunca a atualização
- [x] 2.5 As três recusas previstas anotadas no cliente: `400` em uso ou já em dia, `409` desconectada,
      `429` teto por máquina
- [x] 2.6 Nenhum tratamento de erro dentro do cliente — quem traduz é a tela

## 3. Ação na linha da tabela (concluída)

- [x] 3.1 `UpdateComputerApp` recebendo apenas o computador da linha
- [x] 3.2 `latestVersion` lido da cache do React Query pela mesma `queryKey` da tabela, sem props novas
- [x] 3.3 Exibição condicionada a `outdated`, ou `unknown` **com** `isOnline`
- [x] 3.4 `up-to-date` sem botão algum
- [x] 3.5 Hooks todos chamados antes do `return null`, para a ordem não variar entre renderizações
- [x] 3.6 Trava por `inUse` ou `!isOnline` via `aria-disabled`, com `onClick` guardado
- [x] 3.7 Tooltip distinguindo os quatro casos: em uso, desconectada, versão não informada e versão nova
- [x] 3.8 Pulso apenas quando `outdated` e sem trava
- [x] 3.9 Ponto sólido sob o `animate-ping`, legível com movimento reduzido
- [x] 3.10 `aria-label` nomeando a máquina, e não só a ação
- [x] 3.11 Ação posicionada **antes** de editar e excluir na coluna Ações

## 4. Diálogo de confirmação (concluída)

- [x] 4.1 Título com a descrição da máquina e subtítulo com `ESTAÇÃO-NN` e a sala
- [x] 4.2 Bloco `Instalada → Nova` em `font-mono` e `tabular-nums`
- [x] 4.3 `—` na coluna Instalada quando a estação nunca informou a versão
- [x] 4.4 Texto alternativo quando não há `latestVersion`, sem inventar número
- [x] 4.5 Notas do manifesto exibidas quando houver, com a data de publicação formatada em pt-BR
- [x] 4.6 Data validada com `isValid` antes de formatar
- [x] 4.7 Promessa de não interromper advogado(a) escrita no diálogo
- [x] 4.8 Fechamento bloqueado enquanto o pedido está em voo
- [x] 4.9 Botões de confirmar e cancelar desabilitados durante o envio, com rótulo "Enviando"

## 5. Desfecho do disparo (concluída)

- [x] 5.1 Invalidação da listagem de computadores após o sucesso
- [x] 5.2 Toast de sucesso citando a versão quando a API a devolve
- [x] 5.3 Toast dizendo que a troca leva minutos e que a estação reinicia sozinha
- [x] 5.4 `429` lido por `getRetryAfterInSeconds` e apresentado com `formatWaitTime`
- [x] 5.5 Demais recusas apresentadas com a mensagem da própria API via `getApiErrorMessage`
- [x] 5.6 Nenhum retry automático em cima de rate limit
- [x] 5.7 Diálogo mantido aberto quando o pedido falha, para a nova tentativa não exigir reabrir

## 6. Verificação

- [x] 6.1 `pnpm exec tsc --noEmit` sem erros
- [x] 6.2 `pnpm biome check --write` sem apontamentos
- [x] 6.3 `pnpm build` concluído
- [x] 6.4 Contrato conferido na `api-fr`: `POST /computers/update-app/:id` registrado com prefixo `/computers`,
      `params.id` como `cuid2`, respostas `200/400/401/404/409` e `checkIfEmployeeIsAdmin` — ⚠️ **esta
      conferência não aconteceu de verdade**: o cliente saiu chamando `POST /computers/update/:id`, que
      não existe, e o botão devolvia `404` em produção. Caminho corrigido em 2026-09-03
- [x] 6.5 Conferido que `isOnline`, `updateStatus` e `latestVersion` estão no schema de resposta de
      `GET /computers/get-all`
- [x] 6.6 Conferido o teto de `rateLimits.updateComputerApp`: 10 a cada 5 minutos, por IP + computador
- [x] 6.7 Conferido que máquina em manutenção **não** é bloqueada pela API — é o melhor momento para trocar
- [ ] 6.8 Conferir numa estação real desatualizada e conectada: pulso, diálogo com as duas versões e troca
      concluída minutos depois
- [ ] 6.9 Conferir numa estação desconectada: botão travado e tooltip correspondente
- [ ] 6.10 Conferir numa estação em uso: botão travado, sem disparo
- [ ] 6.11 Conferir o `429` disparando onze vezes na mesma máquina dentro de 5 minutos
- [ ] 6.12 Conferir com a API sem versão publicada: diálogo no texto alternativo e toast sem número

## 7. Próximos passos (fora desta change)

- [ ] 7.1 Avaliar um resumo no topo da tela ("3 estações atrás da versão publicada")
- [ ] 7.2 Avaliar a mesma ação no cartão da grade de operação, onde a versão já aparece
- [ ] 7.3 Reavaliar a régua por sala de `versao-do-desktop-na-grade`, agora que existe versão publicada
      conhecida — a grade ainda lê `GET /rooms/get-all`, que não devolve `updateStatus`
- [ ] 7.4 ⛔ Acompanhar o resultado da troca em tempo real — bloqueado até o painel escutar o WebSocket
