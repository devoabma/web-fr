/** A api-fr gera o código com 6 caracteres de `A-Z0-9` (`generateRecoveryCode`). */
export const RECOVERY_CODE_LENGTH = 6

const RECOVERY_CODE_PATTERN = new RegExp(`^[A-Z0-9]{${RECOVERY_CODE_LENGTH}}$`)

/**
 * Formata o código de redefinição enquanto o usuário digita.
 *
 * O caixa-alta não é enfeite — a api-fr procura o token com `findUnique({ code })`, comparação sensível
 * a maiúsculas. Sem isto, um código colado do e-mail em minúsculo voltaria como "código inválido".
 */
export function maskRecoveryCode(value: string) {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, RECOVERY_CODE_LENGTH)
}

/**
 * Confere se o texto já é um código completo no formato da api-fr.
 *
 * Vive aqui, e não no schema do formulário, porque a página (Server Component) também precisa validar o
 * `?code=` do link do e-mail — e o arquivo do schema arrasta o `react-hook-form`, que não roda no servidor.
 */
export function isRecoveryCode(value: string) {
  return RECOVERY_CODE_PATTERN.test(value)
}
