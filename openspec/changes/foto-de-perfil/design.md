## Context

A `api-fr` trata a foto de perfil de forma diferente do resto do cadastro. `PATCH /employees/update/:id` é
ADMIN-only e altera nome, CPF e e-mail; `PATCH /employees/update-image` só exige sessão válida e usa o
`getIdCurrentEmployee()` do próprio JWT — ou seja, ninguém troca a foto de outro por essa rota, e todo
funcionário troca a sua.

O upload é `multipart/form-data` lido com `request.file()` do `@fastify/multipart`, com teto global de 5 MB
e formatos JPEG, JPG, PNG e WEBP. A resposta é `{ imageUrl }` com a URL pública do bucket `profiles` do
Supabase, e a API ainda se encarrega de apagar a imagem anterior.

Do lado do painel, a área de conta já lia tudo de uma única consulta em `queryKeys.getProfile()`, com
`staleTime` infinito, compartilhada com o menu do usuário.

## Goals / Non-Goals

**Goals**

- Trocar a foto sem sair da área de conta e sem depender de administrador.
- Recusar arquivo inválido antes de gastar rede — formato, tamanho e arquivo vazio.
- Mostrar a foto nova imediatamente, na área de conta e no menu do usuário.
- Não abrir caminho para envio duplicado do mesmo arquivo.

**Non-Goals**

- Recorte, rotação ou redimensionamento no cliente.
- Remover a foto e voltar às iniciais — a `api-fr` não tem rota para isso.
- Arrastar e soltar o arquivo sobre o avatar.
- Barra de progresso do envio.

## Decisions

### O avatar é o gatilho, com dica de ferramenta

O ponto de partida é o próprio avatar: ponteiro de ação, `Tooltip` com "Atualizar foto de perfil" e véu com
ícone de câmera aparecendo no `hover` e no `focus-visible`. Um botão separado ao lado do nome resolveria o
mesmo problema com mais ruído visual — e o avatar é onde a mão vai primeiro.

O elemento é um `<button>` de verdade com `aria-label`, não uma `<div>` clicável: quem navega por teclado
alcança o gatilho na ordem natural e o véu aparece no foco, não só no ponteiro.

### `Dialog` controlado, sem `DialogTrigger`

O `Tooltip` e o `Dialog` do Base UI disputariam o mesmo elemento se ambos usassem `render` aninhado. O
diálogo é aberto por `onClick` e controlado por estado; o Base UI devolve o foco ao elemento que o tinha
antes da abertura, então o retorno de foco continua correto sem o `DialogTrigger`.

### `useState` no lugar de `react-hook-form`

Diferente do formulário de senha, aqui há um campo só, e ele é um `<input type="file">`. Com RHF seria
preciso lidar com `FileList`, limpar o campo na mão de qualquer forma e observar o valor para
pré-visualizar — sem ganho sobre dois estados locais.

O motivo mais duro é de tipagem: `z.instanceof(File)` no escopo do módulo quebra o SSR do componente
cliente, porque `File` não existe no Node. O schema usa `z.custom<File>`, cuja checagem só roda no `parse`,
já no navegador.

### A validação local espelha a API, e recusa antes da rede

Formato dentro de PNG, JPG e WEBP; arquivo não vazio; até 5 MB. O `accept` do `<input>` é apenas uma
sugestão do sistema operacional — o usuário troca o filtro para "todos os arquivos" e escolhe um PDF sem
esforço. Sem validação local, essa recusa só chegaria depois do upload inteiro.

O teto de 5 MB é o do `@fastify/multipart`. Passar dele responderia `413`, tratado, mas depois de subir o
arquivo por completo — caro na rede da sala.

### O arquivo recusado não fica selecionado

Quando a validação falha, a seleção é limpa junto com a exibição do erro. Manter a pré-visualização de algo
que não pode subir deixaria o usuário olhando para a foto certa com um botão que não a envia.

### A pré-visualização é um `objectURL` com revogação

`URL.createObjectURL` prende o arquivo na memória do navegador até a revogação explícita. O `useEffect`
revoga no `cleanup`, a cada troca de arquivo e ao desmontar: sem isso, cada tentativa deixaria um blob preso
pelo resto da sessão — e no balcão a aba fica dias aberta.

### O `<input type="file">` fica escondido atrás de um botão

O controle nativo não acompanha o visual do painel e não é estilizável de forma confiável. Quem abre a
janela do sistema é um `Button` comum, disparando `click()` na referência do input.

O `value` do input é zerado ao limpar a seleção. Sem isso, escolher **o mesmo arquivo** de novo não dispara
`change`, e a tela ficaria sem pré-visualização, parecendo travada.

### O sucesso escreve no cache, não invalida

A API devolve a URL nova, então `setQueryData` é suficiente e evita um `GET /employees/profile` para
descobrir o que já se sabe. A escolha também fecha uma janela real: com `invalidateQueries`, entre a
resposta do upload e o fim da nova consulta o botão voltaria a ficar habilitado com o arquivo ainda
selecionado — dois cliques rápidos seriam dois uploads e dois arquivos no bucket.

O `updater` é imutável de propósito. Mutar o objeto anterior devolveria a mesma referência, os observadores
não veriam mudança e a foto não trocaria na tela, com o agravante de o cache já estar errado.

Como a consulta é a mesma do menu do usuário, uma escrita atualiza os dois lugares.

### O diálogo resiste ao fechamento durante o envio

Mesma regra da troca de senha: `Esc`, clique fora e "Cancelar" ficam sem efeito enquanto a requisição está
de pé. Fechar no meio descartaria o arquivo com a chamada ainda em andamento, e o erro chegaria a uma tela
sem nada para tentar de novo.

### Sem `Content-Type` manual na requisição

O `FormData` é entregue ao axios sem cabeçalho nenhum, de propósito. O axios só monta
`multipart/form-data; boundary=...` quando o cabeçalho não foi informado; declarando-o na mão, o `boundary`
some e o Fastify não consegue separar as partes.

## Risks / Trade-offs

- **Sem recorte, foto retangular perde as bordas.** O avatar é quadrado e usa `object-cover`. O texto do
  diálogo não promete recorte, e a pré-visualização mostra exatamente o enquadramento final — o usuário vê
  o corte antes de enviar.
- **Não há como remover a foto.** Quem subiu a imagem errada precisa subir outra; voltar às iniciais
  depende de rota que a `api-fr` não tem.
- **Sem progresso de envio.** Em 5 MB numa rede ruim, o botão fica em "Enviando..." sem indicar quanto
  falta. O `onUploadProgress` do axios resolveria, e fica anotado como próximo passo.
- **A validação de formato olha o `mimetype` declarado.** Um arquivo renomeado passa pelo cliente e é
  recusado pela API — que também confia no `mimetype` do multipart. Nenhum dos dois inspeciona os bytes.
- **Falha na remoção da imagem antiga deixa órfão no bucket.** É comportamento da API, registrado aqui
  porque o custo aparece no armazenamento, não na tela.
