import { API } from '@/lib/axios'

interface UpdateComputerAppResponse {
  message: string
  macCode: string
  /** Versão que a api-fr esperava instalar. Ausente quando ela ainda não sabe qual é a publicada. */
  version?: string
}

/**
 * Manda a estação consultar o manifesto e atualizar **agora**, sem esperar o ciclo de 6 horas dela.
 *
 * O caminho é `POST /computers/update-app/:id` — **não** `/computers/update/:id`, que é o `PATCH` do
 * cadastro da máquina. A api-fr separou os dois de propósito: mesma URL com verbos diferentes fazendo
 * coisas sem nada em comum é erro esperando acontecer.
 *
 * A api-fr empurra um `update_now` pelo WebSocket que a máquina já mantém aberto — ninguém alcança a
 * estação por IP, é ela que fica pendurada no servidor.
 *
 * **A resposta confirma o envio do recado, nunca a atualização.** O que a estação faz depois (baixar
 * ~60 MB, conferir assinatura e SHA-256, rodar o autoteste, reiniciar) leva minutos, e a prova de
 * que deu certo é a versão nova aparecendo na coluna Desktop quando ela voltar.
 *
 * Recusas previstas, todas com mensagem pronta em português vinda da api-fr:
 * - `400` máquina em uso (a atualização nunca interrompe advogado(a)) ou já na versão publicada;
 * - `409` estação desconectada — não vira fila, ela busca sozinha na próxima vez que for ligada;
 * - `429` teto de disparos por máquina (10 a cada 5 minutos).
 */
export async function updateComputerApp(computerId: string): Promise<UpdateComputerAppResponse> {
  const response = await API.post<UpdateComputerAppResponse>(`/computers/update-app/${computerId}`)

  return response.data
}
