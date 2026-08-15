import { cn } from '@/lib/utils'

type BrandMarkProps = React.ComponentProps<'svg'> & {
  accentClassName?: string
}

export function BrandMark({ className, accentClassName = 'text-rose-500', ...props }: BrandMarkProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" aria-hidden className={cn('size-9', className)} {...props}>
      <path
        d="M24 60 L24 64 A12 12 0 0 0 36 76 L64 76 A12 12 0 0 0 76 64 L76 36 A12 12 0 0 0 64 24 L36 24 A12 12 0 0 0 24 36 L24 40"
        stroke="currentColor"
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g className={accentClassName}>
        <path d="M24 40 L45 53" stroke="currentColor" strokeWidth={6} strokeLinecap="round" />
        <circle cx="45" cy="53" r="3.4" fill="currentColor" />
      </g>
    </svg>
  )
}
