/**
 * O que cada arquivo publicado no painel é — espelho do enum `DownloadKinds` da api-fr.
 *
 * O `kind` é o que liga o registro ao botão da tela: o painel não escolhe o link pelo nome, que é
 * texto livre e editável, mas pelo tipo. Por isso a api-fr garante **um ativo por tipo** — com dois
 * instaladores ativos o front pegaria o primeiro da lista e trocaria de arquivo sem avisar ninguém.
 *
 * A lista é fechada de propósito: um manual em PDF ou um driver amanhã entra aqui e na api-fr ao
 * mesmo tempo, e a tela ganha o slot sozinha.
 */
export const DOWNLOAD_KINDS = ['INSTALLER', 'UNINSTALLER'] as const

export type DownloadKind = (typeof DOWNLOAD_KINDS)[number]

export const DOWNLOAD_KIND_LABELS: Record<DownloadKind, string> = {
  INSTALLER: 'Instalador',
  UNINSTALLER: 'Desinstalador',
}

/** O que o funcionário lê embaixo do título do slot quando ainda não sabe para que serve o arquivo. */
export const DOWNLOAD_KIND_HINTS: Record<DownloadKind, string> = {
  INSTALLER: 'Instala o Sala Livre na estação e é também o que atualiza uma instalação antiga.',
  UNINSTALLER: 'Remove o Sala Livre da estação. Use só quando a máquina sair da operação.',
}
