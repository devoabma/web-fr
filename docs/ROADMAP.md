# Sala Livre — Front Web · Roadmap de Construção

> Rastreio incremental do painel web, derivado de [`docs/DOC.md`](./DOC.md) e do domínio documentado em
> [`api-fr/docs/DOC.md`](../../api-fr/docs/DOC.md).
> Legenda: `[ ]` pendente · `[~]` em andamento · `[x]` concluído.

---

## 0. Fundação

- [x] Projeto Next.js 16 (App Router + Turbopack) com React Compiler
- [x] Tailwind CSS v4 com tokens de tema em `oklch` (`src/styles/globals.css`), variantes clara e escura
- [x] shadcn no estilo `base-nova` sobre `@base-ui/react` (`components.json`)
- [x] Helper `cn()` (clsx + tailwind-merge) em `src/lib/utils.ts`
- [x] Convenções de lint/format no `biome.json` (largura 130, sem ponto e vírgula, `useSortedClasses` como erro)
- [x] Layout raiz: fonte Space Grotesk, metadata do produto, favicon, `ClientProviders` com o `Toaster` e o
      `QueryClientProvider` (o arquivo mora em `src/components/app/`, não no grupo `(private)`)
- [x] OpenSpec inicializado (`openspec/`, comandos `/opsx:*`)
- [x] Documentação do repositório (`docs/DOC.md`, `docs/ROADMAP.md`)
- [x] Grupos de rota `(public)` e `(private)` separando o que exige sessão
- [x] Layout privado deixou de duplicar o documento HTML do layout raiz (fonte, `globals.css` e `Toaster`
      agora só na raiz)
- [x] Validação e máscara de CPF reutilizáveis (`src/utils/schemas/`, `src/utils/masks/`)
- [x] Cliente HTTP da `api-fr` (`src/lib/axios.ts`, base URL por env e `withCredentials`) com leitura
      defensiva de `400`/`429` em `src/lib/http/api-error.ts`
- [~] Variáveis de ambiente validadas — schema Zod em `src/env.ts`; falta o `.env.example`
- [x] Camada de dados: **React Query**, com `QueryClient` por requisição no servidor e sem retentativa em `4xx`
- [~] Tratamento global de erro e estados de carregamento — `not-found.tsx` pronto; falta `error.tsx` e `loading.tsx`
- [ ] Deploy

---

## 1. Landing pública

- [x] Cabeçalho com marca do produto e **espaço de marca branca** da instituição — o arquivo é
      `public/assets/logo-cliente.png`, nomeado pelo papel e não pela seccional, e o que está fixo é a
      **altura** (`h-9 w-auto`), para qualquer proporção de logo entrar sem esticar o cabeçalho. O `alt`
      não nomeia instituição: ele envelheceria em silêncio na troca, anunciando o nome errado a quem usa
      leitor de tela
- [x] Hero com badge, título, subtítulo e chamada para o painel
- [x] Prévia do painel com os três estados do computador (disponível / em uso / manutenção)
- [x] Seção de diferenciais (4 cards)
- [x] Rodapé com copyright e navegação
- [x] Responsividade mobile-first em todas as seções
- [x] Página 404 (`not-found.tsx`) na identidade do produto, reaproveitando cabeçalho e rodapé, com retorno
      pelo histórico e destino alternativo quando não há histórico
- [ ] Rotas do rodapé: `/privacidade`, `/suporte`, `/status` — hoje caem na 404
- [ ] Conferência em viewport real (320px / 768px / 1440px)
- [ ] Validação de contraste dos estados

---

## 2. Autenticação

- [x] Tela de login `/auth/sign-in` — UI, validação, estados e integração com a API
- [x] Validação local do CPF (dígitos verificadores) e máscara progressiva
- [x] Layout split com painel de marca, responsivo (formulário primeiro no mobile)
- [x] Estados de envio, erro por campo e slot de erro geral (`errors.root`)
- [x] Integrar `POST /employees/session/auth`
- [x] Persistência da sessão pelo cookie `httpOnly` da API — o `{ token }` do corpo é descartado, nada vai
      para `localStorage`
- [x] Proteção de rotas do painel e redirecionamento de não autenticados (`src/proxy.ts`, negar por padrão)
- [x] Retorno ao destino pretendido depois do login (`?redirect=`, restrito a caminho interno)
- [x] Leitura do `role` para corte de acesso a `/admin/*` (ADMIN vs MEMBER)
- [x] Tratamento do `429` no login, exibindo o tempo de espera (`retryAfterInSeconds`)
- [x] Esqueci minha senha (`POST /employees/password-recovery`) — rota `/auth/forgot-password` com CPF e
      e-mail, painel de confirmação no lugar do formulário e reenvio travado por 60s. O e-mail vai **sem**
      normalizar a caixa: a API grava como foi digitado no cadastro e compara com `findUnique`
- [x] Redefinir senha com o código de 6 caracteres (`POST /employees/reset-password`) — rota
      `/auth/reset-password`, com o `?code=` do link do e-mail higienizado antes de preencher o campo, código
      normalizado para caixa-alta enquanto se digita e foco escolhido pela mensagem da API (código vs. senha)
- [x] Trocar senha do usuário logado (`PATCH /employees/change-password`) — diálogo em `/profile` com senha
      atual, nova e confirmação, "mostrar senhas" único para os três campos e tratamento de `429`
- [x] Tela de configurações de conta em `/profile` — identificação, CPF mascarado e e-mail em leitura, com o
      item do menu do usuário virando âncora (`Link`) em vez de `router.push`
- [x] Trocar a própria foto de perfil (`PATCH /employees/update-image`, multipart, máx. 5MB) — o avatar da
      tela de conta é o gatilho, com pré-visualização e validação local antes do envio. A resposta traz a
      `imageUrl` nova, escrita direto no cache: a tela e o menu do usuário trocam a foto sem nova consulta
- [x] Logout (`POST /employees/session/logout`) pelo menu do usuário — a API apaga o cookie `httpOnly`, o
      painel limpa o cache do React Query e devolve ao login. Falha de rede avisa por toast e **não** navega,
      porque a sessão continua de pé
- [ ] Denylist de token na `api-fr` — o logout hoje remove o cookie, mas um JWT já copiado segue aceito até
      expirar (1 dia). Vale também para a troca de senha: a API só regrava o hash, então **quem já estava
      logado em outra máquina continua dentro** mesmo depois da senha mudar
- [ ] "Manter-me conectado" é decorativo: a API aceita só `{ cpf, password }` e fixa o cookie em 1 dia.
      Decidir entre remover o campo ou pedir suporte na `api-fr`
- [ ] Revisar `Domain`/`SameSite` do cookie quando painel e API forem para domínios distintos em produção

---

## 3. Painel — moldura e navegação

- [x] Shell do painel em `(private)/layout.tsx`, em "T": barra superior atravessando o topo, sidebar e área
      de conteúdo com rolagem própria abaixo dela
- [x] Marca do produto na barra superior, visível também com a sidebar recolhida à faixa de ícones
- [x] Sidebar colapsável para faixa de ícones, nas cores da marca (tokens `--sidebar-*` reescritos)
- [x] Navegação em duas seções — Operação e Administração — declarada como dado (`NAV_SECTIONS`)
- [x] Item ativo por `usePathname`, casando rotas de detalhe, com `aria-current="page"`
- [x] Recolhimento preservado entre recargas: cookie `sidebar_state` lido no servidor como `defaultOpen`
- [x] Sidebar vira painel sobreposto abaixo de 768px, aberta pelo gatilho da barra superior. Desde a change
      `painel-flutuante` ela é o **mesmo `Drawer` dos formulários administrativos** — flutuante com respiro de
      `0.75rem`, cantos arredondados e fechamento por arrasto —, e **fecha ao escolher uma área**: o painel
      cobre o conteúdo, então continuar aberto deixaria a página escolhida atrás dele. No desktop, onde a
      navegação tem coluna própria, ela permanece aberta
- [x] Moldura em ilha (`variant="inset"`): fundo do painel no tom da navegação, conteúdo com cantos
      arredondados, sombra e respiro, e a barra superior sem borda inferior — que viraria um risco
      atravessando a tela agora que o fundo tem a cor dela. No desktop é o variant do componente; abaixo de
      768px é declarado no layout, porque as classes do componente começam em `md:`
- [x] Marca ancorada à coluna da navegação: ela ocupa a largura da coluna e o símbolo cai na mesma vertical
      dos ícones do menu (16px da borda = 8px do respiro do inset + 8px do recuo da lista), acompanhando o
      recolhimento à faixa de ícones sem sair do lugar. Isso depende do estado da sidebar, então a marca é o
      único pedaço cliente da barra superior
- [x] Rota `/panel` criada — primeira rota do grupo `(private)`; deixou de ser placeholder e passou a
      abrigar a visão da sala (seção 4)
- [x] Bloco de usuário da barra superior com dados da sessão (`GET /employees/profile`), com `skeleton`
      durante o carregamento e iniciais do nome quando não há foto
- [x] Menu do usuário no avatar da barra superior: nome, e-mail, papel traduzido e saída do sistema, com
      `aria-label` no gatilho (abaixo de 640px o nome ao lado não é exibido)
- [x] Status real do sistema no lugar do badge fixo "All OK" — `PanelStatus` consulta `GET /ready` da
      API a cada 30s, com três estados (verificando, tudo certo, sem conexão). Lê `/ready` e não
      `/health`: o `/health` responde `200` sem tocar no banco, porque é dele que o `HEALTHCHECK` do
      contêiner decide reiniciar — um selo baseado nele ficaria verde com o Postgres fora
- [x] Esconder a seção "Administração" de `MEMBER` (filtro sobre `NAV_SECTIONS`, não item desabilitado) —
      `adminOnly` na seção, `role` lido do cookie no layout privado, de modo que o grupo nunca chega ao
      HTML de quem não pode vê-lo
- [x] Título da aba declarado por rota, e não pelo `(private)/layout.tsx` — rota nova do painel deixa de
      herdar "Painel"
- [x] Criar as cinco áreas que a sidebar já referencia — `/admin/rooms` e `/admin/computers` (cadastro,
      listagem e edição, ver seção 5), `/admin/employees` (lista, edita, vincula salas e alterna a
      situação), `/printers` (histórico de impressões, seção 6) e `/releases` (histórico de liberações,
      seção 7). **Nenhum item da navegação cai mais na 404**
- [ ] `loading.tsx` por área, com o `skeleton` já instalado
- [~] Levar o hero da landing e o login para `/panel` — o login já leva; o hero continua apontando para
      `/auth/sign-in` (correto para quem não tem sessão, mas o proxy já devolveria ao painel quem tem)
- [ ] Conferir contraste dos itens ativo/inativo sobre o azul, nos temas claro e escuro

---

## 4. Painel — visão da sala

- [x] Cabeçalho da tela e aviso de uso: o advogado se libera sozinho na máquina, o painel é o caminho de
      exceção (oculto abaixo de 640px, para não empurrar a sala para fora da dobra)
- [x] Seleção de sala a partir de `GET /rooms/get-all` (escopo já filtrado por papel na API) — sala inativa
      fora da lista, primeira sala ativa assumida como padrão, com estados de carregamento, erro e vazio
- [x] Colaboradores da sala em fileira de avatares, deduplicados por funcionário (`employeesRooms` é o
      vínculo, não a pessoa), excedente em contador com os nomes no tooltip
- [x] Cota diária e total de computadores da sala selecionada
- [x] Sala escolhida vive na URL (`?sala=`) — a tela recarrega e se compartilha sem perder o contexto
- [x] Grade de computadores com os três estados, montada sobre a API — os computadores vêm embutidos em
      `GET /rooms/get-all`, **não** de `GET /computers/get-all`, que é ADMIN-only e devolveria `401` ao
      funcionário comum. Ordenada por número, porque a API não ordena
- [x] Contagem por estado (disponíveis / em uso / em manutenção) na faixa da sala
- [x] Colocar/retirar de manutenção (`PATCH /computers/maintenance/:id` e `.../remove`) — ação direta, sem
      diálogo; ausente no card em uso, porque a API recusa com `400` enquanto houver sessão
- [x] Encerrar sessão de um advogado (`POST /lawyers/close-computer/:sessionId`) — diálogo destrutivo que
      só fecha no sucesso, com o saldo restante no retorno
- [x] Liberar computador manualmente (`POST /lawyers/release-computer`) — a rota **existe e é pública**,
      recebe `macCode` e serve o painel sem alteração; a marcação anterior de bloqueio estava errada.
      `birth` vai em `DDMMYYYY`, sem barras
- [x] Estações desconectadas marcadas na grade, antes do clique (`GET /computers/online/:roomId`, que
      devolve **só as conectadas**) — cartão âmbar rotulado "Offline", liberação bloqueada, manutenção e
      encerramento preservados, e as livres e mudas fora da contagem de disponíveis. É a única consulta da
      tela com polling (20s), porque estação que sobe não avisa o painel
- [x] Liberação desfeita quando `notified` volta falso: a sessão recém-criada é encerrada na hora, em vez
      de ficar de pé travando o advogado numa máquina que não abre (a API recusa duas sessões simultâneas).
      Cobre a estação que cai entre o refetch e a confirmação; falhando o desfazer, a mensagem instrui a
      encerrar pelo cartão
- [x] Contador de tempo restante por sessão — `hh:mm` e barra de saldo, lidos de
      `GET /lawyers/get-all-releases/:roomId`, apresentados como `01h:12min`
- [x] Degradação honesta quando as sessões não carregam: a ocupação da sala é preservada e uma faixa âmbar
      explica o que faltou, em vez de mostrar tudo como disponível
- [x] Saldo andando sozinho na tela — o cálculo é do servidor, e o painel desconta os minutos decorridos
      desde a resposta (`useElapsedMinutes`). O polling de 30s saiu: revalidação na montagem, na volta de
      foco e depois de cada ação. Tempo real continua dependendo do item 8
- [x] Versão do Desktop de cada estação na grade (`appVersion` / `appVersionReportedAt`, embutidos em
      `GET /rooms/get-all` — sem requisição nova). A régua da defasagem é a **própria sala**, e não uma
      versão oficial: o painel não sabe o que foi publicado, mas sabe o que as vizinhas rodam, e é assim que
      a máquina que ficou para trás aparece sozinha em âmbar. Comparação numérica segmento a segmento —
      alfabética marcaria a mais atualizada como a atrasada. `v—` quando a estação nunca informou, que não é
      erro. O carimbo é do informe (a versão só viaja ao conectar), nunca "vista por último"

---

## 5. Gestão (ADMIN)

### Funcionários
- [x] Listar (`GET /employees/get-all`) — tabela com colaborador (avatar com iniciais coloridas, nome e
      e-mail na mesma célula), CPF pontuado, papel, situação e data de criação, com busca e paginação no
      cliente pelo `DataTable`, como nas outras duas áreas. A busca cobre **nome ou CPF** e tira a pontuação
      antes de comparar, porque a API guarda só os 11 dígitos e o usuário digita o que está vendo. A rota é
      ADMIN-only, **não pagina e não aceita filtro algum**, então a lista vem inteira. O papel ganha ênfase
      por contraste — administrador em violeta, colaborador achatado —, por ser quem cadastra sala, máquina
      e outro colaborador
- [x] Cadastrar (`POST /employees/create-account`) — painel lateral com nome, CPF, e-mail e senha inicial,
      no arranjo das outras duas áreas administrativas. O CPF reusa a máscara e a validação do login, porque
      é a mesma credencial, e vai à API só com os dígitos. Como CPF e e-mail são únicos, a recusa de `400` é
      lida para apontar **qual** dos dois está repetido, sob o campo, em vez de um toast que o usuário
      teria de traduzir. A senha é digitada pelo administrador e segue por e-mail em texto — desenho da
      API —, então o campo alterna Mostrar/Ocultar e recusa o preenchimento automático, que ofereceria ali
      a senha do próprio administrador logado. Não há escolha de papel: a rota não aceita, todo cadastro
      sai `MEMBER`
- [x] Editar (`PATCH /employees/update/:id`) — painel lateral com nome, e-mail e papel, no desenho do
      cadastro. Só os campos alterados vão no corpo (a rota aceita parcial), e o e-mail repetido volta como
      `400` lido no próprio campo. O **CPF aparece bloqueado**: a rota não o aceita, e escondê-lo faria
      parecer esquecimento. O administrador **não altera o próprio papel** — a API permite, mas rebaixar-se
      tira o acesso à área administrativa na hora, inclusive a este painel, que seria o único caminho de
      volta. Editando a si mesmo, `getProfile()` também é invalidado, senão o cabeçalho segue com o dado
      velho
- [x] Ativar / inativar (`PATCH /employees/activate/:id` e `/deactivate/:id`) — inativar pede confirmação,
      reativar vai direto, como em Salas. A confirmação conta **quantas salas continuam vinculadas**, porque
      o medo de quem clica é apagar o que estava junto, e diz o que de fato acontece com quem está logado:
      a API verifica `inactive` no **login**, não no middleware, então quem está com o painel aberto segue
      navegando até o token expirar — o bloqueio vale do próximo acesso em diante. **O administrador não
      inativa a si mesmo**: a API recusa com `400` e a tela impede antes do clique, com `aria-disabled` (e
      não `disabled`, que não dispara hover) para o tooltip poder explicar o motivo. Só `getEmployees` é
      invalidado: o único cadastro do cabeçalho é o do próprio admin, e ele não pode se inativar
- [x] Vincular / desvincular de salas (`POST /employees/link-with-rooms` e `/unlink-with-rooms`) — o
      vínculo acontece **no cadastro**, opcional, encadeado pelo `employeeId` que o `201` passou a devolver
      (change `atomic-employee-account-creation` na API), e agora também **pela listagem**, num painel onde
      marcar vincula e desmarcar desvincula. O envio é o **delta**, não a seleção: `link-with-rooms`
      derruba o lote inteiro com `400` se qualquer sala do payload já estiver vinculada. `link` roda antes
      de `unlink` porque é a chamada que valida — falhando ela, nada foi removido; falhando o `unlink`
      depois, o estado no servidor é parcial e o painel diz isso em vez de fechar calado. Sala **inativa já
      vinculada** continua na lista, marcada como tal e desmarcável (o `unlink` não valida situação);
      inativa sem vínculo não é oferecida, porque o `link` a recusa
- ❌ Trocar a foto de **outro** funcionário — não existe na API: `PATCH /employees/update-image` resolve o
      funcionário pelo próprio token (`getIdCurrentEmployee`), então cada um só troca a sua. Feito na seção 2

### Salas
- [x] Listar (`GET /rooms/get-all`) — tabela com sala (ladrilho, nome com a UF colada `SALA GTI · MA` e
      descrição na mesma célula), tempo padrão, **equipe**, **estações**, situação e data de criação, com
      busca e paginação no cliente (a rota devolve tudo de uma vez). A primitiva `DataTable` (TanStack v9)
      nasceu no design system para as outras quatro áreas reusarem. A busca cobre **nome ou descrição** — os
      dois campos da célula da sala. A UF saiu da busca na change `esqueleto-e-buscas-das-tabelas`: com duas
      letras ela casa com meia tabela ("MA" acha "SALA DE REUNIÃO") e escondia o resultado procurado em vez
      de estreitá-lo. Ela continua ao lado do nome, que é onde o cadastro errado se revela. A equipe usa os mesmos rostos e as mesmas cores da tabela de colaboradores, e a API já
      filtra dali os desligados, então a coluna é a equipe em exercício. As estações mostram a contagem e,
      quando houver, quantas estão em manutenção — ocupação fica de fora de propósito: manutenção é condição
      de inventário, ocupação é estado do momento e pertence ao painel. Sala sem máquina alguma diz isso
      explicitamente, porque o painel de operação não desenha cartão para ela e a ausência se lê como
      "está tudo certo aqui"
- [x] Cadastrar (`POST /rooms/create`) — painel lateral com nome, UF, tempo padrão em minutos (lido em horas
      ao lado) e descrição; a prévia do identificador mostra o `slug` que a API vai gravar, porque é ele, e
      não o nome, que decide a unicidade da sala
- [x] Editar (`PATCH /rooms/update/:id`) — diálogo aberto pelo botão da linha, já preenchido com a sala.
      Clique fora não fecha (ESC e Cancelar sim), reabrir descarta o rascunho anterior, salvar exige
      alteração e a descrição apagada limpa o campo em vez de gravar uma string vazia
- [x] UF da sala (`uf`) — `<Select>` das 27 siglas nos dois formulários, sem texto livre: é a UF que o
      Desktop recebe no registro do WebSocket e que decide se a máquina entra numa publicação de versão
      dirigida ao estado. No cadastro abre em `MA` e vai sempre no corpo; na edição só viaja quando muda
      (no `PATCH` ausente = mantém) e avisa que as estações só recebem o estado novo ao reconectar
- [x] Ativar / inativar (`PATCH /rooms/activate/:id` e `/deactivate/:id`) — inativar pede confirmação e diz
      quantos computadores saem do quadro de liberação; reativar vai direto, por ser construtivo e reversível
      pelo botão ao lado

### Computadores
- [x] Listar (`GET /computers/get-all`) — tabela com estação (ladrilho, `ESTAÇÃO-01` e descrição na mesma
      célula), sala vinculada, **código MAC em destaque**, **versão do Desktop**, situação e data de
      criação, com busca e paginação no cliente pelo `DataTable`, como em Salas. A busca cobre **sala ou
      descrição** porque a rota filtra por `roomId` e `description`, mas não por nome de sala, e devolve o
      inventário inteiro de uma vez. O MAC saiu da busca na change `esqueleto-e-buscas-das-tabelas`:
      dezessete caracteres que ninguém digita de cabeça — ele está na tela para ser conferido, não
      procurado. O MAC vira ficha monoespaçada — `font-mono` e não
      `tabular-nums`, porque o código tem letras e só a monoespaçada alinha a coluna para conferir caractere
      a caractere — e é exibido **sem transformação**: a API o guarda como texto opaco e casa byte a byte no
      registro do WebSocket, então mostrar caixa diferente enganaria quem compara com a configuração da
      estação. A coluna Desktop é a companheira do MAC: o código diz com qual máquina o Desktop deveria
      falar, a versão diz se ele chegou a falar — estação cadastrada e sem versão é instalação que nunca
      subiu. Ausência é apresentada como ausência, não como erro, e o carimbo é de **quando informou**, não
      de "vista por último"
- [x] Cadastrar (`POST /computers/create`) — painel lateral com sala (só as ativas), número, descrição e MAC.
      Trocar de sala sugere o próximo número livre e lista os já em uso, porque o `number` é único por sala e
      a colisão só voltaria como `400`. O MAC ganha máscara na digitação e aceita colagem com `:`, `.` ou
      espaço, normalizando tudo para o mesmo formato
- [x] Excluir (`DELETE /computers/delete/:id`) — recusa com `400` se estiver em uso, e a tela repete o
      bloqueio com o motivo no tooltip. **Não é soft delete como a sala**: apaga o registro e, em cascata, o
      histórico de sessões e as impressões — por isso a confirmação exige digitar a descrição da máquina
- [x] Editar (`PATCH /computers/update/:id`) — diálogo aberto pelo botão da linha, já preenchido com a
      máquina. É o que corrige um MAC errado sem passar pela exclusão, que levaria o histórico junto. A sala
      atual entra no seletor mesmo inativa (senão o campo abriria vazio) e os números em uso desconsideram a
      própria máquina. A API não recusa máquina em uso aqui, ao contrário do delete: a tela avisa do efeito
      de trocar MAC ou sala com sessão aberta, mas não bloqueia
- [x] Atualizar o aplicativo da estação agora (`POST /computers/update/:id`) — botão na própria linha que
      empurra um `update_now` pelo WebSocket que a máquina já mantém aberto; ninguém alcança a estação por
      IP, é ela que fica pendurada no servidor. Ele **só aparece onde faz sentido**: quando a `api-fr` diz
      `outdated`, ou `unknown` com a estação no ar — máquina que a API garante em dia não ganha ação que ela
      recusaria com `400`. Quem decide isso é o servidor (`updateStatus`), e não o painel: comparar versão
      como texto poria `1.0.10` antes de `1.0.9` e apontaria a máquina errada. Em uso ou desconectada, o
      botão aparece **travado** com o motivo no tooltip — `aria-disabled` e não `disabled`, porque botão
      desabilitado não dispara hover e o motivo é o que interessa. A bolinha só pulsa quando o clique tem
      para onde ir, com um ponto sólido embaixo do `animate-ping` para quem desligou movimento no sistema. O
      diálogo mostra `instalada → nova`, as notas do manifesto em português e a promessa que sustenta o
      clique no meio do expediente: nenhuma versão interrompe advogado(a). **A resposta confirma o envio do
      recado, nunca a troca** — baixar, conferir assinatura e reiniciar leva minutos, e a prova é a versão
      nova aparecendo na coluna Desktop. Estação desligada não vira fila (`409`): ela busca sozinha ao ligar.
      O `429` (10 disparos por máquina a cada 5 minutos) é lido e apresentado como espera, sem retentativa
- [x] Estação online e situação da versão na listagem (`isOnline` e `updateStatus`, mais o `latestVersion`
      do envelope, todos embutidos em `GET /computers/get-all` — sem requisição nova). É o que separa
      "atualizar agora" de "ela pega sozinha ao ligar", e o que dá ao painel a régua que faltava: a versão
      **publicada**, e não mais a maior da própria sala

---

## 6. Fila de impressão

- [x] Listar impressões da(s) sala(s) do funcionário (`GET /printers/get-all/:roomId?`) — advogado, sala,
      computador e data/hora, da mais nova para a mais antiga. O escopo por papel é o que a API já resolve:
      sem `roomId` a rota devolve tudo o que aquele funcionário pode ver, e a tela não repete a regra
- [x] Aviso de expurgo semanal (sexta-feira, 23:59) junto do escopo por papel — as duas coisas que mudam o
      significado da lista e não se deduzem olhando para ela (oculto abaixo de 640px)
- [x] Filtros de sala, período e busca — a sala vive em `?sala=` porque decide o que a tela carrega e
      precisa sobreviver a um recarregamento; período e busca ficam no estado, porque só estreitam o que já
      está na mão. O corte de período usa o fuso da Seccional, não o do navegador
- [~] Baixar arquivo para impressão — a tela **abre** o arquivo em aba nova, e não baixa: o `fileUrl` aponta
      para o Storage, em outro domínio, onde o atributo `download` é ignorado pelo navegador. Continua
      dependendo da API para virar download de verdade
- [ ] ⛔ Marcar como baixado / impresso — **bloqueado: não implementado na API**
- [ ] Filtros no servidor (`?lawyer=`, `?startDate=`, `?endDate=`, que a rota **já aceita**) no lugar dos do
      cliente — só faz sentido quando a listagem paginar; hoje a lista chega inteira e filtrar localmente é
      mais rápido e alcança mais campos

---

## 7. Histórico e relatórios

- [x] Listar sessões (`GET /lawyers/get-all-releases/:roomId?`) em `/releases` — advogado, sala,
      computador, liberado em, duração e situação, da mais recente para a mais antiga, incluindo as
      sessões abertas. A rota já servia o painel de operação, que filtrava `endDate === null` e **jogava
      o resto fora**; agora `roomId` é opcional e o histórico inteiro que já trafegava virou a tela. O
      **desfecho é derivado**, porque a API não tem campo de status: `endDate` nulo é *em andamento*,
      fechada com `usedAllTime` é *tempo esgotado* (a API fechou no `expiresAt`), fechada sem é
      *encerrada* no balcão — e é essa última distinção que separa o fluxo normal da exceção. A duração
      das sessões abertas **anda sozinha**, pelo mesmo `useElapsedMinutes` do painel. Quatro filtros:
      sala (em `?sala=`), período, situação e busca por advogado, computador ou sala. Os ladrilhos de
      contagem ignoram o filtro de situação de propósito — se o respeitassem, escolher um desfecho
      zeraria os outros dois e o ladrilho viraria eco do filtro. **Sala inativa continua no seletor**, ao
      contrário das impressões: a sala saiu de operação, mas as sessões que aconteceram nela continuam
      sendo registro. A tela é **somente leitura** — encerrar sessão é do painel de operação, e uma
      segunda tela capaz disso seria um caminho a mais para o clique errado
- [x] Filtros de sala e período **compartilhados** entre as duas telas de histórico
      (`_components/shared/filters/`) — a segunda tela é que justificou a extração, e foi ela que
      transformou `printers-board` em `printers-table`. O controle recebe a lista de salas já recortada
      pela tela: qual sala mostrar é regra de cada histórico, não do seletor. Ficaram de fora o filtro de
      situação (só das liberações) e a busca (três linhas de JSX com campos diferentes em cada tela) —
      compartilhá-los seria abstrair por simetria
- [ ] Filtros no servidor para as liberações — ao contrário das impressões, aqui **não é escolha**: a
      rota não pagina e não aceita filtro algum. E o aperto chega antes, porque sessão não tem expurgo
      semanal como as impressões
- [x] Métricas das liberações em `/metrics` — quatro indicadores do ano (liberações, média por mês,
      advogados atendidos, tempo médio de sessão) e quatro recortes: por ano, por mês, ranking de salas
      e ranking de advogados. A contagem é do **Postgres**, pela rota agregada
      `GET /lawyers/releases-metrics/:roomId?` criada na change irmã `aggregate-release-metrics` da
      `api-fr`. Somar no cliente era possível — o histórico já faz — mas o gráfico por ano precisa do
      passado **inteiro**, e a rota de listagem não pagina: nos números do próprio desenho da tela
      (~28 mil sessões) seriam ~11 MB de JSON baixados e percorridos a cada visita para produzir quatro
      números. Dois filtros na URL (`?ano=`, `?sala=`), porque os dois decidem *o que* a API agrega e
      precisam sobreviver ao recarregar. **`byRoom` ignora o filtro de sala de propósito**: é um ranking
      *entre* salas, e filtrado viraria uma barra só em 100%. O **delta compara com o mesmo período do
      ano anterior** e some quando não há base — dividir por zero imprimiria "+∞%", e o primeiro ano de
      operação cairia sempre nesse caso. **Mês futuro mostra `—`, não `0`**: zero afirmaria que ninguém
      usou a sala em dezembro. A sigla da seccional é **derivada da UF das salas visíveis**, não cravada
      no código — o model `Lawyers` não guarda UF, e fixar "MA" quebraria a marca branca. Gráficos com
      `recharts` via o `chart` do shadcn (que **não traz Radix**, então convive com o `@base-ui/react`
      deste painel); os rankings são listas com barra em CSS, porque não são séries num eixo. Tela
      **somente leitura**
- [x] Cascas de `/downloads` e `/admin/reports` no menu — cabeçalho, aviso do recorte já escrito e o
      bloco de "em construção", **sem controle inerte nenhum**. Mesmo caminho que `/metrics` percorreu:
      o endereço existe para o link não nascer quebrado e para o funcionário saber o que vem. As duas
      dependem de trabalho na `api-fr` (itens 2 e 4 abaixo)
- [ ] ⛔ Impressões por advogado e sala — **bloqueado: não implementado na API**. As métricas cobrem
      *liberações*; a fila de impressão não tem rota agregada equivalente
- [ ] ⛔ Baixar o arquivo de impressão em `/downloads` — **bloqueado: não implementado na API**
- [x] Relatórios de fechamento em `/admin/reports` — três relatórios sobre a mesma barra de filtros:
      **advogados por sala** (a lista nominal que a diretoria pede, com inscrição, acessos, primeira e
      última visita), **movimento por sala** (comparativo, incluindo as salas paradas) e **ranking de
      advogados** (quem mais recorre, e em quantas salas). Recorte por **dia, mês, ano ou intervalo**,
      que o `PeriodFilter` compartilhado não sabe expressar. Exportação em **`.xlsx`** (data como data,
      minutos como número, **inscrição como texto** para não perder o zero à esquerda) e **PDF** com a
      marca do Sala Livre, gerado do modelo de dados e não do DOM — as três bibliotecas entram por
      `dynamic import`, então quem só lê a tela não as baixa. **Não dependeu de rota nova**: a
      agregação é no cliente sobre `get-all-releases`, porque `releases-metrics` conta por ano e não
      guarda hora, duração nem primeira/última visita. O tempo soma **só sessões encerradas** e
      espelha o teto de 24 h da `api-fr`. Tela **somente leitura**
- [ ] ⛔ Relatório de produtividade **por colaborador** — **bloqueado: o dado não existe**.
      `computer_sessions` guarda `computer_id` e `lawyer_id`; `release-computer.ts` cria a sessão sem
      registrar quem a autorizou. Precisa de uma coluna `employee_id` na `api-fr`

---

## 8. Tempo real

- [ ] ⛔ Consumir eventos da API por WebSocket — **bloqueado**: o canal atual é Desktop↔API, não é
      autenticado e não emite `computer_released` / `session_started`. Até lá, a grade só se atualiza na
      volta de foco e depois de cada ação do balcão — o relógio da sessão anda por conta própria.

---

## 9. Aplicativo instalável (PWA)

- [x] Manifesto (`src/app/manifest.ts`): `display: standalone`, `start_url` no `/panel`, `theme_color` da
      marca, splash claro e atalhos de toque longo (Painel, Liberações, Impressões)
- [x] Ícones do app em `public/icons/` — `any` com cantos arredondados, `maskable` com fundo até a borda,
      `apple-touch-icon` opaco; gerados por `scripts/generate-pwa-icons.mjs` (`sharp` emprestado, fora das
      dependências do projeto)
- [x] Metadados do layout: `icons`, `appleWebApp`, `apple-mobile-web-app-capable` manual (iOS < 17.4),
      `viewport.themeColor` e `colorScheme: 'light'`
- [x] Service worker (`public/sw.js`) — navegação sempre pela rede; cache **só** de `/_next/static/*`,
      ícones e marca. Nenhum HTML de tela e nenhuma resposta da `api-fr` entram no cache: o aparelho do
      balcão é compartilhado entre turnos e o logout não apaga `CacheStorage`
- [x] Tela de ausência de conexão (`public/offline.html`), com a marca inline e sem depender do Next
- [x] Worker registrado em produção e **desregistrado** em desenvolvimento, para não servir build antigo
      por cima do dev server
- [x] Cabeçalhos do `/sw.js` (`no-store`, `Service-Worker-Allowed`) no `next.config.ts`
- [ ] Conferir em aparelho real — instalação no Android, atalho no iPhone, tela de offline em modo avião
- [ ] Botão "Instalar app" no painel (`beforeinstallprompt` no Android; instrução escrita no iOS)
- [ ] ⚠️ **Depende do deploy**: a instalação só é oferecida em HTTPS

---

## 🔗 Dependências do backend

Itens marcados com ⛔ dependem de trabalho na `api-fr`. Ordem sugerida para destravar este painel:

1. **Paginação reutilizável** — afeta todas as listagens.
2. **Download do arquivo de impressão** — a tela abre o arquivo do Storage em aba nova, que é o que o
   navegador permite entre domínios. Servir o arquivo pela própria API é o que transformaria isso em
   download de verdade.
3. **Eventos de negócio no WebSocket** — a única forma de o painel ver o que acontece fora dele sem
   voltar a repetir requisições.
4. **Recorte de data em `get-all-releases`** (`?de=&ate=`), ou uma rota `/reports` agregada. Hoje o
   relatório de um único dia baixa o histórico inteiro para descartar 99% dele. O custo se paga
   enquanto a tela é administrativa e esporádica, mas cresce junto com o passado da Seccional.
5. **`employee_id` em `computer_sessions`** — sem ele não existe relatório de produtividade por
   colaborador, nem auditoria de quem autorizou uma liberação fora do padrão.

> **Resolvidos:** _liberar computador manualmente_ saiu desta lista — `POST /lawyers/release-computer` já
> existia, é pública e recebe `macCode`; nunca foi bloqueio. _Restringir o CORS ao `WEB_URL`_ foi feito na
> `api-fr` e habilitou a sessão por cookie `httpOnly`. _Uso por sala e computador_ e _tempo médio por
> sessão_ saíram em **2026-09-01**: a change `aggregate-release-metrics` da `api-fr` levou a contagem
> para o Postgres e destravou `/metrics`. _Relatórios de fechamento_ saiu em **2026-09-03** e **não
> exigiu rota nova**: a verificação mostrou que `get-all-releases` já devolve tudo o que um relatório
> precisa, e que `releases-metrics` — a rota agregada — nunca serviria, porque conta por ano e não
> guarda hora, duração nem primeira/última visita.
