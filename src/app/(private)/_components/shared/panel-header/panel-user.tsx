'use client'

import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { Skeleton } from '@/components/ui/skeleton'
import { queryKeys } from '@/constants/query-keys'
import { getProfile } from '@/server/employees/get-profile'

/** "Hilquias Ferreira Melo" → "HM". Avatar de quem nunca subiu foto — a API devolve `imageUrl` nula. */
function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) return '?'

  const first = parts[0]?.charAt(0) ?? ''
  const last = parts.length > 1 ? (parts.at(-1)?.charAt(0) ?? '') : ''

  return `${first}${last}`.toUpperCase()
}

/**
 * Ilha cliente da barra superior. O perfil só existe depois da requisição, e é por isso que o bloco do
 * usuário — e não o header inteiro — é que assume o estado de carregamento: o `SidebarTrigger` é o único
 * caminho para abrir a navegação no mobile, então ele não pode desaparecer enquanto o perfil não chega.
 */
export function PanelUser() {
  const { data, isPending } = useQuery({
    queryKey: queryKeys.getProfile(),
    queryFn: getProfile,
    // O perfil não muda durante a sessão; quem o invalida são as ações que o alteram (troca de foto, por
    // exemplo). O `queryClient.clear()` do login garante que ele não atravesse de um usuário para outro.
    staleTime: Number.POSITIVE_INFINITY,
  })

  if (isPending) {
    return (
      <>
        <Skeleton className="hidden h-4 w-32 bg-white/10 sm:block" />
        <Skeleton className="size-8 rounded-md bg-white/10" />
      </>
    )
  }

  // Sem perfil e sem carregamento é erro de leitura (sessão caída, API fora). Não há placeholder honesto
  // para mostrar aqui — a próxima navegação passa pelo `proxy.ts`, que devolve o usuário ao login.
  if (!data) return null

  const { name, imageUrl } = data.employee

  return (
    <>
      <p className="hidden text-sidebar-foreground/80 text-sm sm:block">{name}</p>

      <div className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white/10 ring-1 ring-white/15">
        {imageUrl ? (
          <Image src={imageUrl} alt={name} fill sizes="32px" className="object-cover" priority />
        ) : (
          <span className="font-semibold text-[11px] text-white">{getInitials(name)}</span>
        )}
      </div>
    </>
  )
}
