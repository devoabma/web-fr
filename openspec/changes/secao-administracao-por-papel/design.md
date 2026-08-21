## Context

A change `sessao-e-guarda-de-rotas` entregou três coisas que esta aproveita: `src/lib/auth/session.ts`, que
decodifica o payload do JWT e valida papel e expiração; o cookie `@fr-auth-token`, gravado pela `api-fr`
como `httpOnly`; e o `proxy.ts`, que já corta `/admin/*` para quem não é `ADMIN`.

O que ficou de fora foi a sidebar. `NAV_SECTIONS` é uma constante de módulo, renderizada inteira por um
componente `'use client'`. Ninguém perguntava quem era o funcionário antes de desenhar o menu.

O `(private)/layout.tsx` já era `async` e já lia `cookies()` — para resolver o `defaultOpen` da sidebar a
partir de `sidebar_state`. O ponto de leitura do papel, portanto, já existia; faltava usá-lo.

## Goals / Non-Goals

**Goals**
- Apresentar ao `MEMBER` apenas as áreas que ele alcança.
- Resolver o papel **no servidor**, para que o HTML já saia com a navegação certa.
- Manter a navegação declarada como dado, filtrável, sem `if` espalhado pela árvore.
- Devolver o título da aba a cada rota.

**Non-Goals**
- Trocar o `proxy.ts` por qualquer coisa. A guarda de rotas continua como está.
- Criar as áreas `/admin/*` — continuam 404.
- Filtro por item (`adminOnly` no `NavItem`). Hoje o recorte é de seção inteira; item avulso restrito não
  existe ainda.
- Papel na barra superior, no `PanelHeader` — o menu do usuário já o exibe, vindo do perfil.

## Decisions

### O papel vem do cookie no layout, não do perfil no cliente

O `GET /employees/profile` devolve o `role` e o menu do usuário já o usa. Seria o caminho óbvio, e é o
errado para a sidebar.

Ler do perfil coloca a decisão dentro de uma query: o primeiro HTML sai sem saber o papel. Ou a sidebar
nasce sem a seção e a faz aparecer quando a resposta chega — piscada em quem tem direito —, ou nasce com a
seção e a remove — piscada de uma área administrativa na tela de um `MEMBER`, que é exatamente o que esta
change existe para impedir.

O cookie resolve antes de qualquer pintura. O `readSession` já faz o trabalho: token malformado, papel
desconhecido ou expirado devolvem `null`.

```ts
const session = readSession(cookieStore.get(SESSION_COOKIE_NAME)?.value)
const role = session?.role ?? 'MEMBER'
```

O custo é o `role` viajar por prop até o `NavItems`. Duas passagens (`PanelSidebar` → `NavItems`),
aceitável para não introduzir contexto por causa de um enum de dois valores.

### Sem sessão legível, o papel é `MEMBER`

O `??` não é detalhe de sintaxe. Se o cookie sumiu, venceu ou veio quebrado, a resposta segura é o **menor**
privilégio, não o maior. Na prática o proxy já teria redirecionado esse visitante para o login antes de o
layout renderizar; o `MEMBER` é a rede embaixo, para o caso de a ordem mudar.

O caminho oposto — assumir `ADMIN` na dúvida — mostraria o inventário a quem tem um cookie corrompido.

### A restrição é da seção, declarada junto com ela

```ts
type NavSection = {
  title: string
  adminOnly?: boolean
  items: NavItem[]
}
```

A marcação fica ao lado dos itens que ela governa, dentro de `NAV_SECTIONS`. Quem adicionar uma seção
administrativa nova lê a marcação na linha de cima da que está copiando.

O filtro é uma expressão só, calculada no corpo do componente:

```ts
const sections = NAV_SECTIONS.filter(section => !section.adminOnly || role === 'ADMIN')
```

Sem `useMemo`: são duas seções e o React Compiler está ligado no projeto.

### `adminOnly` é opt-in, e isso é uma escolha com custo

O padrão de uma seção sem marcação é **visível**. O contrário — toda seção nasce restrita e a operação
declara `public: true` — seria mais seguro por omissão, e mais barulhento: a maior parte do painel é
operação diária, visível para os dois papéis.

A troca fica registrada: seção administrativa que esquecer o `adminOnly` vaza para o `MEMBER`. A tarefa 4.2
existe para conferir isso quando as áreas `/admin/*` forem criadas.

### Filtrar, não desabilitar

Item desabilitado ainda ocupa espaço, ainda tem rótulo e ainda conta a existência de uma área. Para um
`MEMBER`, "Funcionários" cinza é uma pergunta sem resposta. A seção some inteira — inclusive o rótulo
"Administração" e o espaçamento do grupo.

### O título da aba pertence à rota

`metadata` em `layout.tsx` vale como padrão para todo o grupo. Com `title: 'Painel'` ali, `/profile` só
tinha o título certo porque o declarava; qualquer rota nova nasceria "Painel • Sala Livre".

O título desceu para `(private)/panel/page.tsx`. O template `%s • Sala Livre` continua no layout raiz, que
é onde ele deve estar — layout define template, rota define nome.

## Risks / Trade-offs

- **A sidebar não é autorização, e alguém vai achar que é.** O comentário no layout diz isso em duas
  linhas, e o proposal repete. O filtro roda no servidor, mas a decisão que ele usa vem de um JWT cujo
  payload é lido **sem verificar assinatura** — o `readSession` não faz criptografia. Um cookie forjado com
  `role: 'ADMIN'` mostra a seção. E não leva a lugar nenhum: a `api-fr` valida a assinatura e responde
  `401`.
- **Papel novo cai no ramo restrito.** `role === 'ADMIN'` não é exaustivo como um `Record<Role, ...>` seria;
  um terceiro papel com direito ao inventário não veria a seção, e o TypeScript não avisaria. Erra para o
  lado seguro, mas erra em silêncio.
- **Prop drilling de dois níveis.** Se a sidebar ganhar mais um nível de composição, ou se outra parte do
  shell precisar do papel, vale promover para contexto ou ler o cookie no próprio componente servidor que
  precisa dele.
- **A troca de papel exige nova sessão.** O `role` está no token; um funcionário promovido a `ADMIN` só vê
  a seção depois de sair e entrar. Coerente com a `api-fr`, que autoriza pelo mesmo token.

## Open Questions

- Quando as áreas `/admin/*` existirem, a seção "Administração" some por completo para o `MEMBER` — ou o
  painel dele ganha alguma seção própria no lugar, para o grupo não ficar solitário?
- O `proxy.ts` e o `nav-items.tsx` decidem "isto é de ADMIN" em dois lugares: `ADMIN_ROUTES` e `adminOnly`.
  Vale derivar um do outro antes que divirjam?
