## 1. Componentes compartilhados (concluída)

- [x] 1.1 `table.tsx`: célula de `p-2` para `px-4 py-3`, cabeçalho de `h-10 px-2` para `h-11 px-4`
- [x] 1.2 `data-table/index.tsx`: esqueleto de `h-4` para `h-5`, batendo com a altura de linha do texto
- [x] 1.3 `utils/index.ts`: `getAvatarColor`, paleta de oito cores derivada de identificador estável

## 2. Tabela de colaboradores (concluída)

- [x] 2.1 Célula de identidade: avatar com iniciais coloridas, nome e e-mail
- [x] 2.2 CPF pontuado e alinhado
- [x] 2.3 Papel com ênfase por contraste: administrador em violeta, colaborador achatado
- [x] 2.4 Situação e data de criação no padrão das outras tabelas

## 3. Tabela de computadores (concluída)

- [x] 3.1 Número e descrição fundidos numa célula de identidade com ladrilho
- [x] 3.2 Código MAC em ficha monoespaçada, exibido sem transformação
- [x] 3.3 Declarar `appVersion` e `appVersionReportedAt` no tipo do cliente — a API já os enviava
- [x] 3.4 Coluna Desktop com a versão informada, a ausência e o carimbo na dica
- [x] 3.5 Ícone no selo de manutenção, fechando a família dos três estados
- [x] 3.6 Busca alcançando o código MAC, com o texto de apoio atualizado

## 4. Tabela de salas (concluída)

- [x] 4.1 Célula de identidade com ladrilho, nome · UF e descrição
- [x] 4.2 Coluna Equipe com os mesmos rostos e cores da tabela de colaboradores
- [x] 4.3 Coluna Estações com a contagem e a manutenção sinalizada
- [x] 4.4 Sala sem máquina alguma dizendo isso explicitamente
- [x] 4.5 Ícone no selo de situação inativa
- [x] 4.6 Busca alcançando UF e descrição, com o texto de apoio atualizado

## 5. Verificação

- [x] 5.1 `pnpm exec tsc --noEmit` sem erros
- [x] 5.2 `pnpm exec biome check --write` sem issues
- [x] 5.3 `pnpm build` concluindo
- [ ] 5.4 Validar manualmente as três tabelas nos temas claro e escuro
- [ ] 5.5 Conferir o rolamento horizontal em tela estreita, agora que as células têm mais calha
