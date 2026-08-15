/**
 * Formata progressivamente o CPF enquanto o usuário digita: 000.000.000-00.
 * O schema (`cpfSchema`) remove a pontuação antes de validar, então o valor
 * mascarado pode viver no estado do formulário sem quebrar a validação.
 */
export function maskCpf(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}
