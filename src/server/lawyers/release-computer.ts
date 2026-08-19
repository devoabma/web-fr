import { API } from '@/lib/axios'

interface ReleaseComputerRequest {
  cpf: string
  oab: string
  /** A API compara com o cadastro da OAB no formato `DDMMYYYY` — sem barras. */
  birth: string
  macCode: string
}

interface ReleaseComputerResponse {
  message: string
  sessionId: string
  lawyerName: string
  remainingTime: number
  expiresAt: string | null
  /**
   * `false` = a sessão foi gravada, mas o Desktop daquela máquina está offline e não recebeu o aviso
   * pelo WebSocket. Liberando do balcão, quem confirma não vê a tela do computador: sem avisar isso,
   * o advogado vai até a máquina e a encontra travada.
   */
  notified: boolean
}

export async function releaseComputer(data: ReleaseComputerRequest): Promise<ReleaseComputerResponse> {
  const response = await API.post<ReleaseComputerResponse>('/lawyers/release-computer', data)

  return response.data
}
