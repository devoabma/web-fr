import type { Uf } from '@/constants/ufs'
import { API } from '@/lib/axios'

type EmployeeRoomProps = {
  employees: {
    id: string
    name: string
    imageUrl: string | null
  }
}

export type ComputerProps = {
  id: string
  macCode: string
  number: number
  description: string
  inUse: boolean
  /** Data ISO de quando a máquina entrou em manutenção — `null` enquanto ela está em operação. */
  maintenance: string | null
  /**
   * Última versão do Desktop que a estação informou, como texto (`"1.0.7"`).
   *
   * `null` significa que ela nunca informou: ou não conectou desde que a api-fr passou a guardar,
   * ou o envio está desligado na configuração local da máquina. Nenhum dos dois é erro.
   *
   * Tipado como `string` e não como união fechada de propósito — quem decide quais versões
   * existem é o parque, não o painel.
   */
  appVersion: string | null
  /**
   * Data ISO de quando a estação **informou** a versão — não de quando esteve online.
   *
   * A versão só viaja no `register` do WebSocket, isto é, a cada conexão. Uma máquina que fica
   * semanas no ar sem cair mantém um carimbo antigo enquanto está funcionando normalmente, então
   * este campo nunca vale como "vista por último". Quem responde isso é `/computers/online`.
   */
  appVersionReportedAt: string | null
}

export type RoomProps = {
  id: string
  name: string
  /**
   * Estado da sala, sempre em duas letras maiúsculas. Nunca chega nulo nem vazio: a coluna é
   * NOT NULL na api-fr e as salas que existiam antes da migração nasceram em 'MA'.
   *
   * Tipado como união fechada (e não `string`) porque toda escrita passa pelo enum das 27 UFs no
   * servidor — qualquer outro valor seria defeito de dado, não um formato que o painel deva prever.
   */
  uf: Uf
  standardTime: number
  description: string | null
  /** Data ISO da desativação da sala — `null` enquanto ela está ativa. */
  inactive: string | null
  createdAt: string
  employeesRooms: EmployeeRoomProps[]
  computers: ComputerProps[]
}

export interface GetAllRoomsResponse {
  rooms: RoomProps[]
}

/**
 * Fonte única dos computadores do painel.
 *
 * `/computers/get-all` também lista máquinas, mas é ADMIN-only e o painel é operado por MEMBER —
 * ele tomaria 401. Aqui os computadores já vêm embutidos na sala, com o escopo por papel resolvido
 * no servidor e numa requisição só.
 */
export async function getAllRooms(): Promise<GetAllRoomsResponse> {
  const response = await API.get<GetAllRoomsResponse>('/rooms/get-all')

  return response.data
}
