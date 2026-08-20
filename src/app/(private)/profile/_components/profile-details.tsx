'use client'

import { useQuery } from '@tanstack/react-query'
import { IdCardIcon, MailIcon, ShieldCheckIcon, TriangleAlertIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { queryKeys } from '@/constants/query-keys'
import type { Role } from '@/lib/auth/session'
import { getProfile } from '@/server/employees/get-profile'
import { maskCpf } from '@/utils/masks/cpf'
import { ChangePasswordDialog } from './change-password-dialog'
import { ProfileRow } from './profile-row'
import { UpdateAvatarDialog } from './update-avatar-dialog'

/** Mesmo rótulo do menu do usuário: a api-fr devolve o papel como enum, a tela mostra em português. */
const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Administrador',
  MEMBER: 'Membro',
}

export function ProfileDetails() {
  const { data, isPending, isError } = useQuery({
    queryKey: queryKeys.getProfile(),
    queryFn: getProfile,
    staleTime: Number.POSITIVE_INFINITY,
  })

  if (isPending) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-52 rounded-xl" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div
        role="alert"
        className="flex items-start gap-2.5 rounded-xl border border-destructive/25 bg-destructive/6 px-4 py-3.5 text-destructive"
      >
        <TriangleAlertIcon className="mt-px size-4 shrink-0" />

        <span className="text-sm leading-snug">
          Não foi possível carregar seus dados agora. Recarregue a página e, se continuar assim, verifique sua conexão.
        </span>
      </div>
    )
  }

  const { name, imageUrl, role, email, cpf } = data.employee

  return (
    <div className="flex flex-col gap-6">
      <section className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-xs">
        <UpdateAvatarDialog name={name} imageUrl={imageUrl} />

        <div className="min-w-0">
          <h2 className="truncate font-semibold text-lg text-primary leading-tight">{name}</h2>

          <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/8 px-2.5 py-1 font-medium text-[11px] text-primary">
            <ShieldCheckIcon className="size-3.5" />
            {ROLE_LABELS[role]}
          </span>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border bg-card shadow-xs">
        <header className="border-b bg-muted/40 px-4 py-3">
          <h3 className="font-semibold text-primary text-sm">Dados da conta</h3>

          {/* Nada aqui é editável pelo painel: cadastro de colaborador é do administrador, e prometer
              um lápis que não existe custa mais caro do que a frase. */}
          <p className="mt-0.5 text-muted-foreground text-xs">
            Para corrigir qualquer um destes dados, procure um administrador.
          </p>
        </header>

        <div className="divide-y">
          <ProfileRow icon={<IdCardIcon className="size-4" />} label="CPF" value={maskCpf(cpf)} />
          <ProfileRow icon={<MailIcon className="size-4" />} label="E-mail" value={email} />
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold text-primary text-sm">Segurança</h3>

          <p className="max-w-lg text-muted-foreground text-sm leading-relaxed">
            A senha é pessoal e dá acesso às liberações da sala. Troque-a se desconfiar que alguém a viu.
          </p>
        </div>

        <div className="sm:shrink-0">
          <ChangePasswordDialog />
        </div>
      </section>
    </div>
  )
}
