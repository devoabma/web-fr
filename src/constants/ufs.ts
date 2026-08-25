/**
 * As 27 unidades federativas do Brasil — espelho da lista fechada da api-fr.
 *
 * A UF da sala não é rótulo: o Desktop a recebe no registro do WebSocket e grava em disco, e é
 * ela que decide se a máquina entra numa publicação de versão dirigida a um estado. Sigla errada
 * não gera erro em lugar nenhum — a estação só deixa de receber a atualização, calada. Por isso a
 * escolha é sempre por `select`, nunca digitada.
 */
export const UFS = [
  'AC',
  'AL',
  'AM',
  'AP',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MG',
  'MS',
  'MT',
  'PA',
  'PB',
  'PE',
  'PI',
  'PR',
  'RJ',
  'RN',
  'RO',
  'RR',
  'RS',
  'SC',
  'SE',
  'SP',
  'TO',
] as const

export type Uf = (typeof UFS)[number]

/** Todas as salas de hoje são do Maranhão — a api-fr assume o mesmo quando o campo não vem. */
export const DEFAULT_UF: Uf = 'MA'

/**
 * O nome por extenso entra só como legenda do `select`: quem cadastra a sala conhece o estado,
 * não necessariamente a sigla, e é justamente a troca de sigla parecida (MA/MT/MS) que o campo
 * existe para evitar.
 */
export const UF_NAMES: Record<Uf, string> = {
  AC: 'Acre',
  AL: 'Alagoas',
  AM: 'Amazonas',
  AP: 'Amapá',
  BA: 'Bahia',
  CE: 'Ceará',
  DF: 'Distrito Federal',
  ES: 'Espírito Santo',
  GO: 'Goiás',
  MA: 'Maranhão',
  MG: 'Minas Gerais',
  MS: 'Mato Grosso do Sul',
  MT: 'Mato Grosso',
  PA: 'Pará',
  PB: 'Paraíba',
  PE: 'Pernambuco',
  PI: 'Piauí',
  PR: 'Paraná',
  RJ: 'Rio de Janeiro',
  RN: 'Rio Grande do Norte',
  RO: 'Rondônia',
  RR: 'Roraima',
  RS: 'Rio Grande do Sul',
  SC: 'Santa Catarina',
  SE: 'Sergipe',
  SP: 'São Paulo',
  TO: 'Tocantins',
}
