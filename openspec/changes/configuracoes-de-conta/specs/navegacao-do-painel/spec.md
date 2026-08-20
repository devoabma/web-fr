## MODIFIED Requirements

### Requirement: O menu do usuário leva à área de conta

O item de configurações de conta do menu do usuário SHALL conduzir à área de conta do funcionário. Esse item
MUST se comportar como uma ligação de navegação do navegador — endereço visível, abertura em nova aba pelos
gestos usuais e pré-carregamento do destino — e MUST NOT ser um item que apenas dispara navegação
programática no clique.

**Motivação:** o item nasceu inerte na change `menu-do-usuario-e-logout`, apontando para lugar nenhum. Como
o destino agora é uma rota de verdade, o elemento certo é uma âncora: resolver por clique programático
descartaria abrir em nova aba, o pré-carregamento e o endereço na barra de status.

#### Scenario: Navegação para a conta

- **WHEN** o funcionário aciona o item de configurações de conta no menu do usuário
- **THEN** o painel apresenta a área de conta do funcionário autenticado

#### Scenario: Abertura em nova aba

- **WHEN** o funcionário aciona o item com o gesto de abrir em nova aba
- **THEN** a área de conta é aberta em uma nova aba
- **AND** o painel corrente permanece como está

#### Scenario: Destino visível

- **WHEN** o ponteiro repousa sobre o item de configurações de conta
- **THEN** o navegador indica o endereço de destino
