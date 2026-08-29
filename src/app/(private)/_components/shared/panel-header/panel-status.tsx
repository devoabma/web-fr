'use client'

import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { queryKeys } from '@/constants/query-keys'
import { getReadiness } from '@/server/health/get-readiness'

/**
 * De quanto em quanto tempo o selo reconfere.
 *
 * Mais curto que isso não compra nada: o selo é uma pista de fundo, não um monitor. E o React Query
 * já refaz a conta quando a aba volta ao foco, que é quando alguém de fato olha para o cabeçalho.
 */
const READINESS_REFETCH_INTERVAL_IN_MS = 30_000

export function PanelStatus() {
  const { isPending, isError } = useQuery({
    queryKey: queryKeys.getReadiness(),
    queryFn: getReadiness,
    refetchInterval: READINESS_REFETCH_INTERVAL_IN_MS,
    refetchOnWindowFocus: true,
    // O padrão do cliente é 60s, maior que o intervalo daqui: sem zerar, o dado ficaria "fresco" entre
    // as batidas e o selo demoraria a acusar uma queda.
    staleTime: 0,
    // A política global tenta duas vezes em 5xx e erro de rede. Aqui isso só atrasa a má notícia: a
    // próxima batida já é a nova tentativa, e é ela que deve mudar o selo de volta.
    retry: false,
  })

  // A primeira resposta ainda não chegou. Não dá para dizer "tudo certo" nem "caiu" — e é justamente na
  // carga inicial que um selo verde chapado mentiria com mais confiança.
  if (isPending) {
    return (
      <Badge role="status" className="border-white/15 bg-white/10 text-sidebar-foreground/70">
        <span className="size-1.5 min-w-1.5 animate-pulse rounded-full bg-white/40" />
        Verificando
      </Badge>
    )
  }

  // Qualquer falha cai aqui: 5xx, timeout, DNS, rede caída, CORS. Do ponto de vista de quem opera o
  // balcão a distinção não muda a atitude — o painel não vai responder até isso voltar.
  if (isError) {
    return (
      <Badge role="status" className="border-red-400/25 bg-red-500/15 text-red-200">
        <span className="size-1.5 min-w-1.5 animate-pulse rounded-full bg-red-400" />
        ALL DOWN
      </Badge>
    )
  }

  return (
    <Badge role="status" className="border-white/15 bg-white/10 text-sidebar-foreground">
      <span className="size-1.5 min-w-1.5 animate-pulse rounded-full bg-emerald-400" />
      ALL OK
    </Badge>
  )
}
