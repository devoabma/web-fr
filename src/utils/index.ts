/**
 * Lê uma duração em minutos no vocabulário do relógio: `90` → `1h30`, `45` → `45min`.
 *
 * Devolve `null` quando não há valor para ler — campo `number` vazio chega como `NaN` no
 * react-hook-form, e `0min` de cota não é leitura, é ausência de resposta.
 */
export function formatDuration(minutes: number) {
  if (!Number.isFinite(minutes) || minutes <= 0) return null

  const hours = Math.floor(minutes / 60)
  const restOfMinutes = minutes % 60

  if (hours === 0) return `${restOfMinutes}min`
  if (restOfMinutes === 0) return `${hours}h`

  return `${hours}h${String(restOfMinutes).padStart(2, '0')}`
}

/**
 * Formata a cota diária como `120min (2h)`.
 *
 * O valor bruto vem primeiro porque é ele que o cadastro grava e o painel usa na cota;
 * a leitura em horas entra entre parênteses só quando acrescenta algo (>= 60min).
 */
export function formatMinutes(minutes: number) {
  const readable = formatDuration(minutes)

  if (!readable) return '—'
  if (minutes < 60) return readable

  return `${minutes}min (${readable})`
}

export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) return '?'

  const first = parts[0]?.charAt(0) ?? ''
  const last = parts.length > 1 ? (parts.at(-1)?.charAt(0) ?? '') : ''

  return `${first}${last}`.toUpperCase()
}

/**
 * Paleta dos avatares sem foto.
 *
 * As classes estão escritas por extenso porque o Tailwind lê o código como texto: um
 * `bg-${cor}-500/15` montado em tempo de execução simplesmente não existiria no CSS gerado.
 *
 * O fundo é o mesmo nos dois temas — é alfa sobre a superfície, então ele acompanha o tema sozinho.
 * Só o texto troca: a inicial em `-700` desaparece no escuro.
 */
const AVATAR_COLORS = [
  'bg-orange-500/15 text-orange-700 dark:text-orange-300',
  'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  'bg-violet-500/15 text-violet-700 dark:text-violet-300',
  'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  'bg-rose-500/15 text-rose-700 dark:text-rose-300',
  'bg-sky-500/15 text-sky-700 dark:text-sky-300',
  'bg-teal-500/15 text-teal-700 dark:text-teal-300',
  'bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300',
]

/**
 * Dá ao avatar sem foto uma cor estável, derivada de um identificador.
 *
 * Passe o `id` do colaborador, **não o nome**: a cor serve para reencontrar a mesma pessoa correndo
 * o olho pela lista, e uma correção de nome não pode trocá-la de cor. A soma dos códigos distribui o
 * suficiente para uma tabela de dezenas de linhas — não é, nem tenta ser, hash criptográfico.
 *
 * Repetição é esperada e inofensiva: com 8 cores, a partir da nona pessoa alguém repete. A cor é
 * pista, nunca identidade — quem identifica é o nome escrito ao lado.
 */
export function getAvatarColor(seed: string) {
  const sum = [...seed].reduce((total, char) => total + char.charCodeAt(0), 0)

  return AVATAR_COLORS[sum % AVATAR_COLORS.length] ?? ''
}
