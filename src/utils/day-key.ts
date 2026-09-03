/**
 * O fuso da Seccional, num lugar só.
 *
 * Uma segunda cópia deste valor em outro arquivo é como um relatório passa a errar a virada do mês
 * sem ninguém perceber. A `api-fr` lê o equivalente de `env.TIMEZONE`; aqui ele está cravado, e
 * corrigir a origem do valor é dívida da marca branca — o que este módulo garante é que a correção
 * acontece num arquivo só.
 */
const SECCIONAL_TIME_ZONE = 'America/Fortaleza'

/**
 * `en-CA` formata como `2026-08-27`, que compara e ordena como texto — é o que deixa uma janela de
 * dias ser um `>=` de strings, sem aritmética de data nenhuma. O fuso é o da Seccional: o corte do
 * dia tem de ser a meia-noite do balcão, não a de quem está com o navegador em outro lugar.
 *
 * Mora em módulo próprio, e não no barril `@/utils` (`src/utils/index.ts`), porque o barril é
 * importado por quase toda tela e carregaria estes `Intl.DateTimeFormat` junto.
 */
const dayKeyFormatter = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: SECCIONAL_TIME_ZONE,
})

/** Chave de dia (`2026-08-27`) do instante recebido, no fuso da Seccional. */
export function formatDayKey(date: Date | number) {
  return dayKeyFormatter.format(date)
}

const dayTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: SECCIONAL_TIME_ZONE,
})

/**
 * `12/03/2025 09:04`, no fuso da Seccional — a data como ela é lida no papel.
 *
 * O `Intl` intercala uma vírgula entre a data e a hora ("12/03/2025, 09:04"). Ela sai daqui porque
 * esta string vai para dentro de célula de tabela e de coluna de PDF, onde cada caractere disputa
 * largura com o dado.
 */
export function formatDayTime(date: Date | number | string) {
  return dayTimeFormatter.format(typeof date === 'string' ? new Date(date) : date).replace(',', '')
}

const spreadsheetPartsFormatter = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: SECCIONAL_TIME_ZONE,
})

/**
 * A data como o Excel precisa recebê-la — e este é o detalhe que faria a planilha mentir.
 *
 * A célula de data de uma planilha **não guarda fuso**: guarda um número de dias desde 1900, e quem
 * escreve converte o `Date` lendo suas partes em UTC. Passar o instante cru faria a liberação das
 * 23h de 31/03 em Fortaleza (02h UTC de 1º/04) aparecer no dia seguinte na planilha — e o relatório
 * do mês perderia uma linha para o mês que vem, bem na virada, que é justamente quando alguém confere.
 *
 * A saída é um `Date` cujas partes **em UTC** são as partes locais da Seccional. Ele não representa
 * o mesmo instante, de propósito: representa o que estava escrito no relógio do balcão, que é o que
 * a diretoria lê na coluna.
 */
export function toSpreadsheetDate(date: Date | number | string) {
  const parts = spreadsheetPartsFormatter.formatToParts(typeof date === 'string' ? new Date(date) : date)
  const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find(part => part.type === type)?.value ?? 0)

  // `hour12: false` ainda produz "24" na meia-noite em alguns motores; o `% 24` devolve a hora ao dia.
  return new Date(Date.UTC(value('year'), value('month') - 1, value('day'), value('hour') % 24, value('minute')))
}
