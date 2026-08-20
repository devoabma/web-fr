import type { ReactNode } from 'react'

type ProfileRowProps = {
  icon: ReactNode
  label: string
  value: string
}

export function ProfileRow({ icon, label, value }: ProfileRowProps) {
  return (
    <div className="flex items-start gap-3 px-4 py-3.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-muted/50 text-muted-foreground">
        {icon}
      </span>

      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground uppercase tracking-widest">{label}</p>
        <p className="truncate font-medium text-sm">{value}</p>
      </div>
    </div>
  )
}
