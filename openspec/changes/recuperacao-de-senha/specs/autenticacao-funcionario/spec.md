## MODIFIED Requirements

### Requirement: Tela de entrada do funcionário

O painel SHALL apresentar uma tela pública de entrada, identificada por título próprio, onde o funcionário
informa CPF e senha para obter sessão.

O título de cada tela do fluxo de autenticação MUST ser declarado pela própria tela, e não pelo layout que
elas compartilham — o layout atende também as telas de recuperação de acesso, que não são telas de entrada.

**Motivação:** com o fluxo de recuperação sob o mesmo layout, um título fixo no layout rotularia "Entrar" a
aba e o histórico das telas de recuperar e redefinir senha.

#### Scenario: Abertura da tela de entrada

- **WHEN** um visitante sem sessão abre a tela de entrada
- **THEN** a tela é apresentada com o formulário de CPF e senha
- **AND** o título da janela identifica a entrada no painel

#### Scenario: Abertura de uma tela de recuperação

- **WHEN** um visitante sem sessão abre uma tela do fluxo de recuperação de acesso
- **THEN** o título da janela identifica aquela tela, e não a entrada no painel
