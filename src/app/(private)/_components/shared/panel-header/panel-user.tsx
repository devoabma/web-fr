'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { LoaderCircleIcon, LogOutIcon, SettingsIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { queryKeys } from '@/constants/query-keys'
import { SIGN_IN_ROUTE } from '@/lib/auth/routes'
import type { Role } from '@/lib/auth/session'
import { getApiErrorMessage } from '@/lib/http/api-error'
import { getProfile } from '@/server/employees/get-profile'
import { logout } from '@/server/employees/logout'
import { getInitials } from '@/utils'

/** A api-fr devolve o papel como enum; o painel mostra o rótulo em português. */
const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Administrador',
  MEMBER: 'Membro',
}

export function PanelUser() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data, isPending: isLoadingProfile } = useQuery({
    queryKey: queryKeys.getProfile(),
    queryFn: getProfile,
    staleTime: Number.POSITIVE_INFINITY, // O perfil do usuário não muda durante a sessão, então não há necessidade de refetch automático
  })

  const { mutateAsync: logoutMutate, isPending: isLoggingOut } = useMutation({
    mutationFn: logout,
  })

  async function handleLogout() {
    try {
      await logoutMutate()

      queryClient.clear()

      router.replace(SIGN_IN_ROUTE)

      router.refresh()
    } catch (err) {
      // Falha de rede aqui é o pior caso: o cookie continua de pé. Melhor avisar do que fingir que saiu.
      toast.error(getApiErrorMessage(err, 'Não foi possível encerrar a sessão. Verifique sua conexão e tente novamente.'))
    }
  }

  if (isLoadingProfile) {
    return (
      <>
        <Skeleton className="hidden h-4 w-32 bg-white/10 sm:block" />
        <Skeleton className="size-8 rounded-md bg-white/10" />
      </>
    )
  }

  if (!data) return null

  const { name, imageUrl, role, email } = data.employee

  return (
    <>
      <p className="hidden text-sidebar-foreground/80 text-sm sm:block">{name}</p>

      <DropdownMenu>
        {/* O nome ao lado some no mobile, e as iniciais do fallback não descrevem a ação — daí o rótulo fixo. */}
        <DropdownMenuTrigger aria-label="Abrir menu do usuário" className="cursor-pointer rounded-md outline-none">
          <Avatar className="rounded-md after:rounded-md">
            {imageUrl && <AvatarImage src={imageUrl} alt={name} className="rounded-md" />}

            {/* Sempre montado: o primitivo o exibe tanto sem `imageUrl` quanto quando a foto falha ao carregar. */}
            <AvatarFallback className="rounded-md">{getInitials(name)}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        {/* Largura fixa: o padrão do componente é `w-(--anchor-width)`, e a âncora aqui é o avatar de 32px. */}
        <DropdownMenuContent align="end" className="w-60">
          <div className="flex flex-col gap-0.5 px-1.5 py-1.5">
            <p className="truncate font-medium text-sm">{name}</p>
            <p className="truncate text-muted-foreground text-xs">{email}</p>
            <p className="mt-1 text-[10px] text-muted-foreground uppercase tracking-widest">{ROLE_LABELS[role]}</p>
          </div>

          <DropdownMenuSeparator />

          {/* Âncora de verdade (e não `router.push`): mantém abrir em nova aba, prefetch e o alvo visível na status bar. */}
          <DropdownMenuItem className="cursor-pointer" render={<Link href="/profile" />}>
            <SettingsIcon />
            Configurações de Conta
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            variant="destructive"
            className="cursor-pointer"
            disabled={isLoggingOut}
            // O menu fica aberto durante a chamada: fechá-lo antes da hora daria a impressão de que o
            // logout terminou, quando ele ainda pode falhar e devolver um toast de erro.
            closeOnClick={false}
            onClick={handleLogout}
          >
            {isLoggingOut ? <LoaderCircleIcon className="animate-spin" /> : <LogOutIcon />}
            {isLoggingOut ? 'Saindo...' : 'Sair do sistema'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
