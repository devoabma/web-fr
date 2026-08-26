## 1. Integração com a `api-fr` (concluída)

- [x] 1.1 Abrir o repositório da `api-fr` e ler `POST /employees/create-account` antes de escrever o schema
- [x] 1.2 Confirmar o prefixo real da rota (`/employees/create-account`, e não `/employees/create` como nas
      demais entidades)
- [x] 1.3 `server/employees/create.ts` com os quatro campos obrigatórios do corpo
- [x] 1.4 Registrar que a resposta é `{ message }`, sem `id` — não dá para encadear o vínculo com salas
- [x] 1.5 Confirmar que `role` não é campo do corpo e que o Prisma aplica `@default(MEMBER)`

## 2. Schema do formulário (concluída)

- [x] 2.1 `new-employee-schema.tsx` no padrão das outras áreas (schema privado, tipo inferido, hook)
- [x] 2.2 Reusar `cpfSchema` de `utils/schemas/cpf` — o mesmo do login
- [x] 2.3 `min(8)` na senha, espelhando a validação da rota
- [x] 2.4 Não incluir confirmação de senha: o valor digitado vai por e-mail como foi escrito

## 3. Formulário de cadastro (concluída)

- [x] 3.1 `new-employee.tsx` como painel lateral, no arranjo de `new-room.tsx` e `new-computer.tsx`
- [x] 3.2 Máscara progressiva de CPF via `Controller`, normalizada pelo schema no envio
- [x] 3.3 Alternância "Mostrar/Ocultar" na senha temporária
- [x] 3.4 `autoComplete="new-password"` para o navegador não oferecer a senha do administrador logado
- [x] 3.5 Bloquear o fechamento enquanto a requisição está de pé
- [x] 3.6 Limpar o formulário e a visibilidade da senha ao fechar
- [x] 3.7 Botão desabilitado durante a chamada, contra o duplo clique
- [x] 3.8 Toast de sucesso nomeando o e-mail de destino

## 4. Tratamento de recusa (concluída)

- [x] 4.1 `resolveDuplicatedField` lendo a mensagem do `400` para descobrir o campo em conflito
- [x] 4.2 `setError` + `setFocus` no campo, sem repetir a frase no toast
- [x] 4.3 Aviso geral com foco no nome quando a mensagem não identifica campo
- [x] 4.4 Tratamento do `429` com `formatWaitTime`, como nas demais telas

## 5. Ligação na página (concluída)

- [x] 5.1 `<NewEmployee />` no lugar do comentário em `/admin/employees/page.tsx`
- [x] 5.2 `queryKeys.getEmployees()` adicionada e invalidada pelo cadastro

## 6. Verificação

- [x] 6.1 `pnpm exec tsc --noEmit` sem erros
- [x] 6.2 `pnpm biome check --write` sem issues
- [x] 6.3 `pnpm build` — `/admin/employees` registrada como rota dinâmica
- [ ] 6.4 Cadastrar um colaborador com um `ADMIN` real e conferir que ele consegue entrar com CPF e senha
- [ ] 6.5 Conferir que o e-mail de boas-vindas chega com a senha digitada
- [ ] 6.6 Repetir um CPF já cadastrado e conferir a mensagem sob o campo de CPF, com o foco nele
- [ ] 6.7 Repetir um e-mail já cadastrado e conferir a mensagem sob o campo de e-mail
- [ ] 6.8 Digitar CPF com dígitos verificadores inválidos e conferir a recusa local, sem requisição
- [ ] 6.9 Conferir que o CPF sai sem pontuação no corpo da requisição
- [ ] 6.10 Conferir que o colaborador criado entra como `MEMBER` e não vê a seção Administração
- [ ] 6.11 Tentar fechar o painel com a requisição em curso e conferir que ele permanece aberto
- [ ] 6.12 Abrir, digitar, fechar, reabrir e conferir que o formulário voltou limpo e a senha oculta
- [ ] 6.13 Conferir o painel lateral abaixo de 768px

## 7. Próximos passos (fora desta change)

- [ ] 7.1 Listar colaboradores (`GET /employees/get-all`) e reusar o `DataTable`
- [ ] 7.2 Editar colaborador (`PATCH /employees/update/:id`)
- [ ] 7.3 Ativar / inativar (`PATCH /employees/activate/:id` e `/deactivate/:id`)
- [ ] 7.4 Vincular / desvincular de salas (`POST /employees/link-with-rooms` e `/unlink-with-rooms`)
- [ ] 7.5 Decidir se a `api-fr` deve devolver o `id` do colaborador criado, para encadear o vínculo
- [ ] 7.6 Decidir se a senha inicial deve ser gerada pelo servidor, ou substituída por link de definição
- [ ] 7.7 Decidir se deve existir rota para promover alguém a `ADMIN`
