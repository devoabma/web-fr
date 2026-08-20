## 1. Camada de dados (concluída)

- [x] 1.1 `src/server/employees/update-image-profile.ts` — `PATCH /employees/update-image` pelo cliente axios
- [x] 1.2 Corpo montado como `FormData` com o campo `file` — a API lê por `request.file()`, que pega o
      primeiro arquivo do fluxo
- [x] 1.3 Nenhum `Content-Type` manual: o axios só monta o `boundary` do multipart quando o cabeçalho não
      foi informado
- [x] 1.4 Resposta tipada como `{ imageUrl: string }`, espelhando o schema da API
- [x] 1.5 `GetProfileResponse` exportada em `src/server/employees/get-profile.ts`, para tipar a escrita no
      cache
- [x] 1.6 Reaproveitar `queryKeys.getProfile()` já existente, sem chave nova

## 2. Validação local (concluída)

- [x] 2.1 `_components/update-avatar-schema.tsx` com `z.custom<File>` — `z.instanceof(File)` quebraria o SSR
      do componente cliente, porque `File` não existe no Node
- [x] 2.2 `refine` de formato aceito: `image/png`, `image/jpeg`, `image/webp`
- [x] 2.3 `refine` de arquivo não vazio
- [x] 2.4 `refine` de tamanho máximo em 5 MB — o mesmo teto do `@fastify/multipart` na API
- [x] 2.5 `validateAvatarFile` devolve a mensagem do primeiro problema, ou `null`
- [x] 2.6 `ACCEPTED_IMAGE_TYPES_ATTRIBUTE` reaproveitado no `accept` do input
- [x] 2.7 `formatFileSize` para exibir o peso ao lado do nome do arquivo

## 3. Gatilho na imagem de perfil (concluída)

- [x] 3.1 `_components/update-avatar-dialog.tsx` substitui o avatar estático em `profile-details.tsx`
- [x] 3.2 Gatilho é um `<button>` de verdade com `aria-label`, alcançável por teclado
- [x] 3.3 `Tooltip` com "Atualizar foto de perfil"
- [x] 3.4 Véu com ícone de câmera em `group-hover` **e** `group-focus-visible`
- [x] 3.5 Anel de foco visível no gatilho
- [x] 3.6 `Dialog` controlado por estado, sem `DialogTrigger` — `Tooltip` e `Dialog` disputariam o mesmo
      elemento por `render` aninhado

## 4. Formulário de envio (concluída)

- [x] 4.1 Pré-visualização no mesmo enquadramento do perfil (`size-20`, `rounded-xl`, `object-cover`)
- [x] 4.2 `objectURL` criado no `useEffect` e revogado no `cleanup`, a cada troca e ao desmontar
- [x] 4.3 `<input type="file">` escondido, acionado por `Button` via `ref.current?.click()`
- [x] 4.4 `value` do input zerado ao limpar — sem isso, reescolher o mesmo arquivo não dispara `change`
- [x] 4.5 Nome e tamanho do arquivo ao lado da pré-visualização
- [x] 4.6 Botão de descarte da seleção, desabilitado durante o envio
- [x] 4.7 Arquivo recusado não permanece selecionado
- [x] 4.8 Erro de validação em `role="alert"` na paleta `destructive`
- [x] 4.9 Formatos aceitos e limite de tamanho declarados na descrição do diálogo
- [x] 4.10 Envio pelo rodapé via `form="update-avatar-form"`, com o `<form>` no corpo do diálogo
- [x] 4.11 Botão de envio desabilitado sem arquivo selecionado e durante o envio, com rótulo "Enviando..."
- [x] 4.12 `handleOpenChange` bloqueia o fechamento enquanto `isPending`
- [x] 4.13 `closeDialog` centraliza fechar + limpar seleção + limpar erro

## 5. Efeito da troca (concluída)

- [x] 5.1 Sucesso escreve a `imageUrl` devolvida em `queryKeys.getProfile()` por `setQueryData`
- [x] 5.2 `updater` imutável — mutar o objeto anterior devolveria a mesma referência e a foto não trocaria
- [x] 5.3 Sem `invalidateQueries`: evita a consulta redundante e a janela em que o botão reabilita com o
      arquivo ainda selecionado
- [x] 5.4 Área de conta e menu do usuário atualizados pela mesma escrita
- [x] 5.5 Sucesso: `closeDialog()` e toast de confirmação
- [x] 5.6 Erro: toast com a `message` da API por `getApiErrorMessage`, com fallback só para falha de rede
- [x] 5.7 `429` tratado com `getRetryAfterInSeconds` + `formatWaitTime`, no padrão das demais telas

## 6. Verificação

- [x] 6.1 `pnpm exec tsc --noEmit` sem erros
- [x] 6.2 `pnpm biome check --write` sem issues
- [x] 6.3 `pnpm build` sem rota nova — a mudança vive dentro de `/profile`
- [x] 6.4 Contrato conferido contra `api-fr/src/http/core/employees/update-image.ts`: rota, multipart,
      formatos, teto de 5 MB e resposta `{ imageUrl }`
- [ ] 6.5 Upload real contra a `api-fr` local: sucesso, toast, diálogo fechado e foto nova na tela
- [ ] 6.6 Conferir que o menu do usuário troca a foto junto, sem recarregar a página
- [ ] 6.7 Arquivo acima de 5 MB: conferir a recusa local, sem requisição
- [ ] 6.8 Arquivo de formato não aceito (PDF renomeado ou escolhido com o filtro em "todos os arquivos")
- [ ] 6.9 Descartar a seleção e escolher **o mesmo** arquivo de novo: a pré-visualização deve aparecer
- [ ] 6.10 Fechar por `Esc` e por clique fora durante o envio: o diálogo deve resistir
- [ ] 6.11 Reabrir o diálogo depois de fechar: sem arquivo selecionado, sem erro na tela
- [ ] 6.12 Conferir o gatilho por teclado: foco visível, véu de câmera e abertura por `Enter`
- [ ] 6.13 Conferir com funcionário sem foto (fallback de iniciais) e depois da primeira troca
- [ ] 6.14 Conferir que a imagem antiga sumiu do bucket `profiles` no Supabase
- [ ] 6.15 Conferir o diálogo abaixo de 640px

## 7. Próximos passos (fora desta change)

- [ ] 7.1 `onUploadProgress` do axios para mostrar o andamento em arquivos grandes
- [ ] 7.2 Recorte antes do envio, para fotos retangulares não perderem as bordas
- [ ] 7.3 Remover a foto e voltar às iniciais — depende de rota nova na `api-fr`
- [ ] 7.4 Arrastar e soltar o arquivo sobre a área de pré-visualização
