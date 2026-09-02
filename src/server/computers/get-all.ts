import { API } from '@/lib/axios'

export type ComputerRoomProps = {
  id: string
  name: string
}

export type ComputerWithRoomProps = {
  id: string
  macCode: string
  number: number
  description: string
  inUse: boolean
  /** Data ISO de quando a máquina entrou em manutenção — `null` enquanto ela está em operação. */
  maintenance: string | null
  createdAt: string
  /** Última versão do Desktop informada pela estação. `null` = ela nunca informou; não é erro. */
  appVersion: string | null
  /** Data ISO de **quando informou** a versão — não de quando esteve online pela última vez. */
  appVersionReportedAt: string | null
  /**
   * A estação está com o canal aberto **agora**.
   *
   * Vem do mapa em memória do WebSocket na api-fr, não do banco. É o que separa "atualizar agora"
   * de "ela pega a versão sozinha quando ligar": pedido só chega em quem está pendurado no servidor.
   */
  isOnline: boolean
  /**
   * Situação desta estação diante da versão publicada, **decidida na api-fr**.
   *
   * `unknown` cobre três casos que dão no mesmo para quem olha a tela: a máquina nunca informou a
   * versão, informou algo que não dá para comparar, ou a API ainda não sabe qual é a publicada. Não
   * é o mesmo que "em dia", e a tela nunca deve tratar como se fosse.
   *
   * A conta mora no servidor de propósito: comparar versão como texto diria que `"1.0.10"` é mais
   * velha que `"1.0.9"`, e esse erro não pode ser reescrito em cada tela que precisar dele.
   */
  updateStatus: ComputerUpdateStatus
  room: ComputerRoomProps
}

export type ComputerUpdateStatus = 'outdated' | 'up-to-date' | 'unknown'

/** A versão publicada do Desktop que a api-fr conhece. `null` = nenhuma chegou ainda. */
export type LatestAppVersionProps = {
  version: string
  /** `notas` do manifesto, já em português, escritas para o funcionário ler antes de atualizar. */
  notes: string | null
  /** Data ISO de quando a versão foi publicada — não de quando a API soube dela. */
  generatedAt: string | null
}

export interface GetAllComputersResponse {
  computers: ComputerWithRoomProps[]
  latestVersion: LatestAppVersionProps | null
}

/**
 * Inventário de máquinas para a tela de administração.
 *
 * É **ADMIN-only** na api-fr (`checkIfEmployeeIsAdmin`) — MEMBER toma 401. Serve só a `/admin/computers`;
 * o painel de operação continua lendo os computadores embutidos em `/rooms/get-all`, que já vem com o
 * escopo por papel resolvido no servidor.
 *
 * A rota aceita os filtros `roomId` e `description`, mas **não filtra por nome da sala** e **não pagina**.
 * Como a busca da tela é por sala *ou* descrição, a lista vem inteira e o filtro é aplicado no cliente —
 * um único request, sem ida ao servidor a cada tecla.
 */
export async function getAllComputers(): Promise<GetAllComputersResponse> {
  const response = await API.get<GetAllComputersResponse>('/computers/get-all')

  return response.data
}
