## ADDED Requirements

### Requirement: Endereço de downloads navegável

O painel SHALL oferecer `/downloads` a funcionários autenticados dos dois papéis, com o cabeçalho da
tela, o aviso do recorte e um bloco declarando que a lista de arquivos está em construção.

A tela MUST NOT apresentar controles inertes — botão desabilitado, campo de filtro sem efeito ou
número de exemplo. Declarar a ausência é honesto; simular a presença faz o funcionário tentar.

**Motivação:** o arquivo de impressão é apagado toda sexta-feira às 23:59 e `/printers` só consegue
abri-lo em aba nova, porque o `fileUrl` aponta para outro domínio. O endereço existir com o prazo
escrito é o que informa o funcionário de que há uma janela para guardar o que importa.

#### Scenario: Funcionário abre a tela

- **WHEN** um funcionário autenticado acessa `/downloads`
- **THEN** vê o cabeçalho, o aviso do expurgo semanal e do recorte por salas vinculadas, e a
  declaração de que a lista está sendo construída

#### Scenario: Visitante sem sessão

- **WHEN** alguém sem sessão acessa `/downloads`
- **THEN** o `proxy.ts` o envia para `/auth/sign-in`, porque a rota não está em `PUBLIC_ROUTES` e a
  política do painel é negar por padrão

### Requirement: Endereço de relatórios restrito à administração

O painel SHALL oferecer `/admin/reports` a funcionários com papel `ADMIN`, com o cabeçalho da tela,
o aviso do escopo e um bloco declarando que os relatórios estão em construção.

O acesso MUST ser barrado para `MEMBER` pelo prefixo `/admin` de `ADMIN_ROUTES`, sem exigir registro
próprio da rota.

#### Scenario: Administrador abre a tela

- **WHEN** um funcionário `ADMIN` acessa `/admin/reports`
- **THEN** vê o cabeçalho, o aviso de que a tela enxerga todas as salas e de que registro excluído
  continua contando no histórico, e a declaração de que os relatórios estão sendo construídos

#### Scenario: Colaborador tenta abrir a tela

- **WHEN** um funcionário `MEMBER` digita `/admin/reports` no endereço
- **THEN** o `proxy.ts` o devolve ao painel, o mesmo desfecho das demais telas de administração —
  e a seção "Administração" da sidebar não é renderizada para ele

### Requirement: Itens novos na navegação do painel

A sidebar SHALL apresentar `Métricas` e `Downloads` na seção do painel e `Relatórios` na seção de
administração, cada um levando à rota correspondente e marcado como ativo quando ela estiver aberta.

O item `Relatórios` MUST seguir a regra da seção que o contém: invisível para `MEMBER`.

#### Scenario: Colaborador vê o menu

- **WHEN** um funcionário `MEMBER` abre o painel
- **THEN** enxerga `Métricas` e `Downloads` junto de Painel, Impressões e Liberações, e nenhum item
  da seção de administração
