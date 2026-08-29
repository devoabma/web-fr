## 1. Consulta de prontidão (concluída)

- [x] 1.1 `getReadiness()` em `src/server/health/get-readiness.ts`, consultando `GET /ready`
- [x] 1.2 Timeout próprio de 8s na chamada, sem tocar no cliente axios global
- [x] 1.3 Chave `getReadiness` em `constants/query-keys.ts`

## 2. Selo (concluída)

- [x] 2.1 `PanelStatus` como Client Component, com `useQuery` a cada 30s
- [x] 2.2 Estado `Verificando` na primeira carga, distinto do verde
- [x] 2.3 Estado `Sem conexão` para qualquer falha
- [x] 2.4 `retry: false` e `staleTime: 0`, contra os padrões do `QueryClient`
- [x] 2.5 `role="status"` para o selo ser anunciado por leitor de tela ao mudar
- [x] 2.6 `Badge` fixo removido do `panel-header/index.tsx`; cabeçalho segue Server Component

## 3. Data de impressão (concluída)

- [x] 3.1 Coluna "Impresso em" no desenho `dd MMM. yyyy às HH:mm`, igual às demais tabelas
- [x] 3.2 Fuso fixo da Seccional preservado (`Intl` com `formatToParts`, sem migrar para date-fns)
- [x] 3.3 Abreviação de mês conferida nos doze meses

## 4. Ajustes menores (concluída)

- [x] 4.1 Select de salas do painel de liberação de `sm:max-w-80` para `sm:max-w-96`
- [x] 4.2 `placeholder:text-sm` centralizado em `Input` e `Textarea`
- [x] 4.3 Classe removida das três tabelas de administração que a repetiam

## 5. Verificação

- [x] 5.1 `pnpm exec tsc --noEmit` sem erros
- [x] 5.2 `pnpm biome check` sem issues
- [x] 5.3 `pnpm build` sem erros
- [x] 5.4 `/ready` conferido contra a API com o banco no ar (`200`)
- [x] 5.5 `/ready` conferido com o banco recusando conexão (`503` em 0,17s)
- [x] 5.6 `/ready` conferido com o banco engolindo pacotes (`503` no teto de 3s)
- [x] 5.7 Cabeçalhos CORS conferidos na rota nova
- [ ] 5.8 Conferir o selo renderizado no navegador, nos três estados
- [ ] 5.9 Conferir o selo nos temas claro e escuro
- [ ] 5.10 Conferir a coluna "Impresso em" com registro de virada de dia (após as 21h)

## 6. Próximos passos (fora desta change)

- [ ] 6.1 Distinguir `429` de queda, se o número de abas simultâneas crescer
- [ ] 6.2 Avaliar `@date-fns/tz` para unificar a formatação de datas com fuso em todo o painel
