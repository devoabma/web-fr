## 1. Contrato da `api-fr`

- [x] 1.1 Ler as cinco rotas em `api-fr/src/http/core/downloads/` e o registro em
      `api-fr/src/http/routes/index.ts` **antes** de escrever qualquer cliente — caminho, verbo,
      papel exigido e formato do corpo
- [x] 1.2 Confirmar as três regras que atravessam a tela: um ativo por tipo, `kind` não editável e
      recorte por papel feito no `get-all`
- [x] 1.3 Espelhar o enum `DownloadKinds` em `src/constants/download-kinds.ts`, com rótulos e as
      dicas que o funcionário lê quando o slot está vazio

## 2. Camada de acesso

- [x] 2.1 `server/downloads/get-all.ts` com `DownloadProps` tipando o registro (`inactive` como data
      ISO ou `null`) e o comentário de que a ordenação vem pronta da `api-fr`
- [x] 2.2 `server/downloads/create.ts` — `description` e `version` opcionais, ausentes quando vazios
- [x] 2.3 `server/downloads/update.ts` — corpo parcial, com `description`/`version` aceitando `null`
      para limpar, e sem `kind`
- [x] 2.4 `server/downloads/activate.ts` e `server/downloads/inactive.ts`
- [x] 2.5 `getDownloads()` em `constants/query-keys.ts`, chave única — a tela não filtra nada no
      servidor

## 3. Endereço do arquivo

- [x] 3.1 `_data/download-link.ts`: `URL` sobre o valor, `null` para protocolo diferente de
      http/https e para endereço malformado
- [x] 3.2 Extrair `host` e `fileName` (com `decodeURIComponent`) para a linha do card
- [x] 3.3 Sem link utilizável, desenhar o aviso em vez do botão — nunca um `href` que não passou pela
      conferência

## 4. Tela

- [x] 4.1 `page.tsx` `async`, lendo o papel do cookie como o layout do painel; sem sessão legível,
      tratar como MEMBER
- [x] 4.2 Subtítulo e aviso por papel (`downloads-notice.tsx`): o ADMIN lê a regra de um por tipo, o
      MEMBER lê o que fazer se um link não abrir
- [x] 4.3 `downloads-board.tsx` com um slot por tipo, `Skeleton` durante o carregamento e aviso de
      falha com `role="alert"`
- [x] 4.4 Slot vazio: ícone, o que aquele tipo é e — só para ADMIN — o botão de cadastrar
- [x] 4.5 `download-card.tsx`: faixa lateral verde (instalador) ou cinza (desinstalador), reaproveitando
      a leitura de cor do Painel de Liberações; versão em `tabular-nums`; observação caindo na dica do
      tipo quando o registro não tem descrição
- [x] 4.6 Botão de baixar com `target="_blank"` e `rel="noopener noreferrer"` — sem `noopener`, a
      página do arquivo recebe `window.opener` e pode navegar esta aba
- [x] 4.8 Âncora de verdade vestida com `buttonVariants()`, e não o `Button` com `render`: o botão do
      base-ui parte de `nativeButton: true` e, ao receber um `<a>`, avisa no console; com
      `nativeButton={false}` ele carimba `role="button"`, e o leitor de tela anunciaria "botão" onde
      há navegação. Só o caso sem link — que é mesmo inerte — continua sendo `Button`
- [x] 4.7 Data de publicação só para ADMIN, e só quando a data é válida

## 5. Gestão (ADMIN)

- [x] 5.1 `new-download.tsx` em `Drawer`, com o `kind` vindo do slot e sem seletor de tipo
- [x] 5.2 `update-download.tsx` em `Dialog`, com `reset` **na abertura** (o registro pode ter mudado
      no servidor entre uma edição e outra) e salvar travado enquanto o formulário não está sujo
- [x] 5.3 Campo esvaziado manda `null` na edição e `undefined` no cadastro
- [x] 5.4 `inactive-download.tsx` com `AlertDialog`, ação travada durante a chamada — sem isso, o
      duplo clique dispara dois `PATCH` e o segundo volta como erro para algo que deu certo
- [x] 5.5 `activate-download.tsx` no histórico, trocando o botão por uma frase quando já existe ativo
      do mesmo tipo
- [x] 5.6 Não fechar diálogo nem painel no meio da chamada: o toast de erro chegaria sem o formulário
      na tela para corrigir
- [x] 5.7 Invalidar `queryKeys.getDownloads()` após cada escrita
- [x] 5.8 Erros pelo `api-error`: mensagem da `api-fr` repassada crua (ela nomeia o registro que está
      no caminho) e `429` com a espera formatada

## 6. Histórico

- [x] 6.1 `downloads-history.tsx` renderizando só quando há inativos — para quem não é ADMIN a lista
      nasce vazia e a seção some sozinha
- [x] 6.2 Cada linha com nome, versão, tipo, arquivo e desde quando está fora do ar

## 7. Correção da rota de atualização do Desktop

- [x] 7.1 Reproduzir o `404` relatado e confirmar na `api-fr` que o caminho é
      `POST /computers/update-app/:id`, e não `POST /computers/update/:id`
- [x] 7.2 Corrigir `src/server/computers/update-app.ts` e nomear as duas rotas no comentário
- [x] 7.3 Corrigir a documentação que carregava o caminho errado: `docs/DOC.md`, `docs/ROADMAP.md` e
      os três arquivos da change `atualizacao-remota-do-desktop` — inclusive a task 6.4, que afirmava
      ter conferido o contrato

## 8. Verificação

- [x] 8.1 `npx tsc --noEmit` limpo
- [x] 8.2 `npx biome check .` limpo, sem supressão de regra: com a âncora própria (4.8) o texto
      "Baixar" é filho dela, e `useAnchorContent` deixou de disparar
- [x] 8.3 `npm run build` completo, com `/downloads` saindo dinâmica (lê cookie)
