## Context

`PATCH /rooms/update/:id` é `ADMIN`-only e aceita corpo **parcial**: `name`, `standardTime` e `description`
são todos opcionais. Do lado do servidor, o nome é gravado em maiúsculas e o slug é recalculado por
`slugify` — mas só quando o nome novo difere do gravado, e a colisão de slug com outra sala volta como `400`.
A descrição tem tratamento próprio: a rota testa `description !== undefined` justamente para separar "não
enviei" de "enviei vazio".

Do lado do painel, a listagem já existia com um botão de editar sem ação. O formulário de cadastro
(`new-room.tsx`) já tinha resolvido a prévia do identificador e a leitura do tempo em horas; a edição
reaproveita o arranjo, não o código.

## Goals / Non-Goals

**Goals**

- Fechar o item 6.1 da change anterior: dar ação ao botão de editar.
- Permitir corrigir o tempo padrão, que é a cota diária de cada advogado na sala.
- Proteger o formulário preenchido contra fechamento acidental.

**Non-Goals**

- Editar o identificador (slug) — é derivado do nome pela API.
- Vincular funcionários ou computadores à sala a partir daqui.
- Histórico de alterações da sala: a `api-fr` não registra quem mudou o quê.
- Reaproveitar o formulário de cadastro como componente único de "criar ou editar".

## Decisions

### Diálogo, não painel lateral

O cadastro usa `Sheet` porque é uma tarefa de composição: o administrador chega com a sala na cabeça e
preenche do zero. Editar é uma correção pontual sobre dados que já existem, disparada de dentro de uma linha
da tabela — o diálogo centralizado mantém o contexto da linha visível ao redor e não desloca a leitura para
a borda da tela.

### Clique fora não fecha

`disablePointerDismissal` no `Dialog.Root` do Base UI. O formulário de edição **abre preenchido**, e a
tabela ocupa a tela inteira atrás dele: um clique torto na linha de baixo descartaria tudo que já foi
digitado, sem aviso e sem desfazer.

ESC e Cancelar continuam fechando de propósito. Travar o ESC também deixaria o usuário de teclado sem saída
do modal — modal sem rota de fuga pelo teclado é barreira de acessibilidade, não proteção.

### O formulário é recarregado da sala na abertura, não zerado no fechamento

`reset(roomFormValues)` roda quando o diálogo abre. Resetar no fechamento faria o formulário piscar com os
valores antigos durante a animação de saída; e não resetar em lugar nenhum faria um rascunho abandonado
reaparecer na abertura seguinte parecendo o valor gravado — o pior dos dois, porque é indistinguível de
dado salvo.

Como o `reset` também redefine a base do `isDirty`, reabrir depois de um salvamento parte do estado novo,
já invalidado pela consulta.

### Salvar exige mudança, e uma só

`disabled={!isDirty || isUpdating}`. O `isDirty` do react-hook-form compara com os valores de abertura, então
editar um campo e voltar ao valor original desarma o botão de novo — o que é correto: não há o que salvar.

O `isUpdating` cobre o duplo clique. Sem ele, o segundo `PATCH` chegaria depois do primeiro e, no caso de
renomeação, poderia voltar como "Sala com esse nome já cadastrada." — a sala colidiria com o nome que ela
mesma acabou de receber. O administrador veria um erro para uma edição que deu certo.

### `description` sai como `null`, nunca como `''`

O campo de texto devolve `''` quando o usuário apaga a descrição. Enviar esse `''` gravaria uma descrição em
branco: a sala passaria a ter uma descrição vazia em vez de não ter descrição. Como a rota trata `null` como
"limpe" e `undefined` como "mantenha", o componente converte com `description || null` na hora do envio, e
o tipo em `server/rooms/update.ts` é `string | null` para que o compilador não deixe esquecer.

### O envio manda os três campos

Filtrar por `dirtyFields` e enviar só o que mudou é possível e não traz ganho: a rota é idempotente para
campo igual, e o nome idêntico nem chega a recalcular o slug. O que a filtragem traria de fato é uma
segunda fonte de verdade sobre o que está sujo, divergindo do `isDirty` que já governa o botão.

## Risks / Trade-offs

- **Caixa alta no campo de nome.** A sala volta da API como `SALA DE LIBERAÇÃO 1` e é isso que o campo
  mostra. É honesto com o dado gravado e feio de ler. A correção pertence à exibição — coluna da tabela e
  formulário —, e não foi feita aqui para não mascarar o que a API guarda.
- **Uma renomeação pode ser recusada depois de preenchida.** A colisão de slug só é conhecida na resposta da
  API; a prévia do identificador mostra o slug que sairá, mas não sabe quais já existem. O administrador
  descobre o conflito ao salvar.
- **Duas mãos editando a mesma sala se sobrescrevem.** Não há `updatedAt` no corpo nem verificação de
  versão: a última gravação vence, em silêncio. Para a escala de uma seccional, com poucos administradores,
  é aceitável; é o mesmo comportamento das outras rotas de escrita do painel.
- **O schema de edição duplica as regras do cadastro.** São dois arquivos com os mesmos limites de nome,
  tempo e descrição. Unificar agora acoplaria os dois formulários pela validação antes de saber se eles vão
  divergir — a edição pode precisar aceitar campos que o cadastro exige.
