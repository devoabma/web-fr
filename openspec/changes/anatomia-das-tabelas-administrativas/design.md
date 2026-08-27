## Context

Três tabelas administrativas construídas em momentos diferentes, cada uma resolvendo identidade,
espaçamento e ênfase à sua maneira. Esta change não acrescenta funcionalidade: alinha as três num mesmo
vocabulário e liga dado que já trafegava.

## Decisões

### O aperto era horizontal, não vertical

`p-2` dá 8px de cada lado, ou seja 16px entre colunas. O sintoma que se percebe como "linha apertada" é a
calha, não a altura. `px-4 py-3` dobra a calha e acompanha na vertical para a linha não ficar achatada de
tanta largura.

**Custo aceito:** as células são `whitespace-nowrap`, então a tabela alarga e passa a rolar horizontalmente
mais cedo em tela pequena. O contêiner já tem `overflow-x-auto`, então rola em vez de quebrar o layout.

### A cor do avatar vem do `id`, não do nome

`getAvatarColor` deriva a cor de um identificador estável. Se derivasse do nome, corrigir "Mariana Costa"
para "Mariana Costa Silva" trocaria a cor da pessoa — e a cor existe justamente para reencontrá-la correndo
o olho pela lista.

As classes da paleta estão escritas por extenso porque o Tailwind lê o código como texto: uma classe
montada em tempo de execução não existiria no CSS gerado.

Repetição é esperada: com oito cores, a partir da nona pessoa alguém repete. A cor é pista, nunca
identidade — quem identifica é o nome escrito ao lado.

### O MAC é monoespaçado e verbatim

É a chave que casa a máquina física com o Desktop: o aplicativo se registra no WebSocket por ela e o
servidor casa byte a byte.

**`font-mono`, e não `tabular-nums`:** MAC tem letra além de número, e `tabular-nums` só alinha dígitos —
a coluna ficava serrilhada. Monoespaçada alinha a coluna inteira, que é o que permite conferir caractere a
caractere.

**Sem `uppercase`:** a `api-fr` guarda o campo como string opaca e única, sem formato imposto. Uma
transformação cosmética mostraria na tela algo diferente do que está gravado, justo onde alguém compara com
a configuração da estação para descobrir por que ela não conecta.

### A versão do Desktop é companheira do MAC

O MAC diz com qual máquina o Desktop deveria falar; a versão diz se ele chegou a falar. Estação cadastrada
e sem versão é o sintoma de instalação que nunca subiu.

A ausência MUST ser apresentada como ausência, não como erro: ou a estação não conectou desde que a
`api-fr` passou a guardar, ou o envio está desligado na configuração local dela.

O carimbo é de **quando informou**, não de "vista por último" — a versão só viaja no `register` do
WebSocket, então máquina que não cai há semanas mantém carimbo antigo estando no ar.

### Manutenção entra na listagem de salas; ocupação não

Manutenção é condição de inventário, que é o assunto da tela administrativa. Ocupação é estado do momento,
muda enquanto se olha e já tem casa no painel de operação. Mostrar as duas transformaria a listagem num
painel pela metade.

### A equipe da sala reusa as cores da tabela de colaboradores

Mesmos rostos e mesmas cores, de propósito: a cor é o que liga a mesma pessoa entre as duas telas.

A `api-fr` já filtra dessa lista os colaboradores **inativos**, então a coluna é a equipe em exercício e
não o histórico de vínculos — um desligado some dali sozinho.

### A busca precisa alcançar o que a tela destaca

Destacar o MAC sem deixar procurar por ele seria meia solução: quem diagnostica estação muda chega com o
código copiado da configuração do Desktop. O mesmo vale para a UF das salas, que é por onde se confere um
estado inteiro de uma vez — que é como o erro de cadastro se revela, com a sala marcada errado aparecendo
ao lado das irmãs.

### Ênfase vem de contraste, não de peso

Na coluna de papel, dois selos lado a lado se anulariam: o olho vê "tem coisa nas duas linhas" e não
distingue qual importa. O administrador recebe cor; o colaborador fica achatado.

A cor escolhida é violeta porque a paleta do painel já tem recados atribuídos — esmeralda é ativo, rosa é
ocupado, âmbar é aviso. Papel não é estado nem alerta; pintá-lo de âmbar faria parecer que ser
administrador é um problema a resolver.

## Riscos

- `table.tsx` e `data-table/index.tsx` são compartilhados: a mudança alcança qualquer tabela futura.
- A célula de identidade concentra dois dados numa coluna; se a descrição crescer muito, a linha alarga.
