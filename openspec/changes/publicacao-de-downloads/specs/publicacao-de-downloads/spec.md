## ADDED Requirements

### Requirement: Tela de downloads do Desktop

O painel SHALL oferecer `/downloads` com os arquivos do Sala Livre publicados pela administração —
**instalador** e **desinstalador**. A tela MUST ser alcançável pelos dois papéis e MUST apresentar
**um espaço por tipo**, ocupado pelo arquivo ativo ou vazio.

A tela MUST NOT oferecer download de arquivo da fila de impressão: aquele bloqueio segue de pé na
`api-fr` e pertence a `/printers`.

**Motivação:** sem um lugar oficial, o executável circula por e-mail e pendrive, e ninguém sabe dizer
qual é o atual. O espaço por tipo é a regra "um ativo por tipo" desenhada na tela — numa lista solta,
dois ativos do mesmo tipo apareceriam como duas linhas igualmente plausíveis.

#### Scenario: Colaborador abre a tela

- **WHEN** um MEMBER acessa `/downloads`
- **THEN** vê o instalador e o desinstalador ativos, cada um com nome, versão, observação e o botão
  de baixar, e **não** vê ação de gestão nem histórico

#### Scenario: Nenhum arquivo publicado daquele tipo

- **WHEN** não há arquivo ativo de um dos tipos
- **THEN** o espaço daquele tipo explica o que ele é e, para o ADMIN, oferece cadastrar; para o MEMBER
  informa que o arquivo aparece assim que a administração publicá-lo

### Requirement: Gestão restrita ao administrador

As ações de publicar, editar, tirar do ar e reativar MUST ser oferecidas apenas ao ADMIN. O papel
MUST ser resolvido **no servidor**, a partir do cookie de sessão, e a ausência de sessão legível MUST
ser tratada como MEMBER.

A decisão de papel na tela MUST NOT ser tratada como controle de acesso: a `api-fr` continua sendo
quem recusa a escrita de quem não é ADMIN.

**Motivação:** resolver o papel no navegador faria o botão de gestão aparecer e sumir na tela de quem
não pode usá-lo. E menor privilégio na dúvida evita oferecer ação a quem a API vai recusar.

#### Scenario: Sessão ilegível

- **WHEN** o cookie de sessão está ausente ou não pode ser lido
- **THEN** a tela é montada como se fosse de um MEMBER, sem ação de gestão

### Requirement: Um arquivo ativo por tipo

O painel MUST oferecer o cadastro de um tipo apenas quando não houver arquivo ativo daquele tipo, e o
formulário de cadastro MUST NOT permitir escolher o tipo — ele vem do espaço vazio que abriu o
formulário.

O tipo de um registro existente MUST NOT ser editável.

**Motivação:** a `api-fr` recusa o segundo ativo do mesmo tipo com `400`. Um seletor livre deixaria o
administrador escolher um tipo ocupado e descobrir o problema só depois de enviar.

#### Scenario: Publicar uma versão nova

- **WHEN** o administrador quer publicar um instalador novo e já existe um no ar
- **THEN** a tela não oferece cadastro de instalador, e o caminho apresentado é tirar o atual do ar
  primeiro

#### Scenario: A API recusa o cadastro mesmo assim

- **WHEN** a `api-fr` responde `400` por já existir um ativo do mesmo tipo
- **THEN** a mensagem da API é repassada como está, porque ela nomeia o registro que está no caminho

### Requirement: Retirada do ar preserva o histórico

Tirar um arquivo do ar MUST ser confirmado, MUST NOT apagar o registro e MUST mantê-lo em um
histórico visível ao ADMIN, com o endereço que usava e a data em que saiu do ar.

O painel MUST oferecer reativar um registro do histórico, e MUST NOT oferecer essa ação quando já
existe um arquivo ativo do mesmo tipo — nesse caso MUST explicar qual passo vem antes.

A ação de confirmar MUST ficar indisponível enquanto a chamada está em andamento.

**Motivação:** o histórico é o que responde "para onde este link apontava antes", que é a pergunta de
quem acabou de publicar um executável quebrado. Botão desabilitado não dispara o tooltip que
explicaria o bloqueio, então a explicação toma o lugar do botão. E sem travar a confirmação, o duplo
clique dispara dois `PATCH` e o segundo volta como erro para uma ação que deu certo.

#### Scenario: Voltar para o instalador anterior

- **WHEN** o administrador tira o instalador novo do ar e reativa o anterior pelo histórico
- **THEN** o endereço antigo volta a valer sem que ninguém precise recolar a URL à mão

#### Scenario: Reativação bloqueada

- **WHEN** o registro do histórico é de um tipo que já tem arquivo no ar
- **THEN** a linha informa que é preciso tirar o atual do ar antes, em vez de oferecer um clique que
  a API recusaria

### Requirement: Endereço conferido antes de virar link

O painel MUST validar o endereço de cada arquivo antes de desenhá-lo como link, aceitando apenas
`http` e `https`. Endereço recusado ou malformado MUST produzir um aviso no lugar do botão de baixar.

O link MUST abrir em nova aba com `rel="noopener noreferrer"`.

O elemento que leva ao arquivo MUST ser uma âncora, com a semântica de link preservada. O estilo de
botão MUST ser compartilhado por classe, e o componente de botão do base-ui MUST NOT emprestar sua
tag a essa âncora.

**Motivação:** a `api-fr` fecha o protocolo na entrada, mas um valor gravado antes dessa regra ou
colado direto no banco ainda chegaria à tela. Um `javascript:` num `href` não é link quebrado — é
script rodando no navegador de quem só queria o instalador. E sem `noopener`, a página de destino
recebe `window.opener` e pode navegar a aba do painel.

#### Scenario: Registro com endereço inutilizável

- **WHEN** o arquivo ativo tem um endereço que não é http(s) ou não é uma URL válida
- **THEN** o card informa que o endereço é inválido e não oferece o botão de baixar

#### Scenario: Leitor de tela sobre o botão de baixar

- **WHEN** o arquivo ativo tem endereço utilizável
- **THEN** o elemento é anunciado como link, e não como botão

### Requirement: Versão e observação podem ser apagadas

Na edição, MUST ser possível esvaziar a versão e a observação de um registro, e o painel MUST enviar
`null` nesses campos — não ausência.

No cadastro, campo vazio MUST ser omitido do envio, para o registro nascer sem valor em vez de com
texto vazio.

**Motivação:** a `api-fr` distingue ausência de `null`. Tratar campo esvaziado como "não informado"
deixaria a versão antiga colada num arquivo novo.

#### Scenario: Apagar a versão de um link

- **WHEN** o administrador limpa o campo de versão e salva
- **THEN** o registro fica sem versão, e o card deixa de exibir a etiqueta
