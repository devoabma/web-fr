/**
 * Formata progressivamente a data enquanto o usuário digita: 00/00/0000.
 * Só formata — quem valida se a data existe de fato é o schema do formulário.
 */
export function maskBirthDate(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 8)
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2')
}
