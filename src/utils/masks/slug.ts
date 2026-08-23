/**
 * Espelha o identificador que a `api-fr` vai gravar para a sala: `sala-1`, `plantao-civel`.
 *
 * Lá o slug sai de `slugify(name, { lower: true, strict: true })`, então a prévia precisa imitar as
 * mesmas etapas: acento vira letra simples (`NFD` + corte dos diacríticos), o `strict` derruba tudo
 * que não é letra, número ou espaço — **inclusive o hífen digitado**, por isso "Sala-1" vira `sala1`
 * e não `sala-1` — e só então o espaço se torna hífen.
 *
 * Não há corte de tamanho de propósito: o nome já é limitado a 60 caracteres no formulário, e truncar
 * aqui faria a prévia mentir sobre o slug que a API realmente grava.
 */
export function maskSlug(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase()
}
