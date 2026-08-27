## Context

A listagem de colaboradores nasceu com a coluna de ações desabilitada. Esta change preenche os dois botões
usando rotas que já existiam na `api-fr` — e o desenho inteiro é ditado pelo que essas rotas aceitam e
recusam.

## Decisões

### Painel lateral, e não diálogo

Salas e computadores editam em `Dialog`. Colaboradores cadastra em `Drawer`. Como as três ações da tela de
colaboradores convivem lado a lado na mesma linha, a coerência que importa é a da tela: os dois painéis
novos seguem o cadastro — mesma largura, mesmo respiro, mesmo rodapé de botão único.

### O vínculo é um delta, não um estado

`POST /employees/link-with-rooms` recusa com 400 quando qualquer sala do corpo já está vinculada:

```
As salas X, Y já foram vinculadas ao funcionário.
```

Isso proíbe o desenho óbvio — "manda a seleção inteira e deixa o servidor resolver". O painel compara a
seleção com os vínculos que vieram da listagem e monta dois corpos disjuntos: o que entrou e o que saiu.

**Custo aceito:** duas requisições sem transação comum. A ordem `link` → `unlink` faz a falha do primeiro
passo ser inofensiva (nada foi removido ainda). A falha do segundo é anunciada como sucesso parcial, com as
listas invalidadas — porque o vínculo novo **existe** no servidor, e sumir com o painel faria o
administrador acreditar que nada foi salvo.

### Sala inativa vinculada continua visível

A API recusa **vincular** sala inativa, mas não recusa **desvincular**. Uma sala desativada depois do
vínculo continua ligada ao colaborador. Se o painel mostrasse só as ativas, ela ficaria fora da seleção — e
como o que se envia é o delta contra os vínculos reais, salvar qualquer outra mudança a mandaria para o
`unlink` sem ninguém ter pedido.

Ela aparece marcada como "Inativa" e pode ser desmarcada. Vincular novas salas inativas continua impossível:
elas não entram na lista.

### O nome das salas vem de duas fontes

O painel abre com os chips já preenchidos porque `GET /employees/get-all` traz `employeesRooms` com o nome
de cada sala. O catálogo completo (`GET /rooms/get-all`) só é buscado ao abrir e serve para oferecer as
salas que **faltam**. Sem esse fallback, o primeiro quadro mostraria chips em branco — e chip vazio parece
vínculo corrompido.

### O papel do próprio administrador fica travado

`PATCH /employees/update/:id` aceita `role` de qualquer colaborador, inclusive de quem está fazendo a
chamada. Um administrador que se rebaixa perde, no mesmo instante, o acesso à área administrativa — e o
único caminho de volta seria outro administrador, ou o banco.

**Alternativa descartada:** permitir com diálogo de confirmação. Uma ação irreversível pela própria interface
não deve depender de o usuário ler o aviso.

### Só os campos sujos vão no corpo

A rota monta o `update` com o que chegou preenchido, então mandar tudo funcionaria. Mas o e-mail é `@unique`
e a checagem de duplicidade roda sempre que o campo vem no corpo — reenviar o valor intocado transforma cada
salvamento numa consulta a mais e amplia a janela para um 400 que não tem a ver com o que se editou.

## Riscos

- **Sucesso parcial no vínculo.** Mitigado pelo aviso e pela invalidação, não eliminado: só uma rota de
  sincronização na `api-fr` resolveria de verdade.
- **Listagem sem paginação.** O campo de seleção corta os chips em sete e resume o resto em "+N"; um parque
  com dezenas de salas continua carregando tudo de uma vez, como no cadastro.
