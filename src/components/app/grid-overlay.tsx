export function GridOverlay() {
  return (
    <div
      aria-hidden
      className="mask-[radial-gradient(ellipse_75%_55%_at_50%_16%,#000_35%,transparent_78%)] pointer-events-none absolute inset-0 -z-10 bg-size-[48px_48px] [-webkit-mask-image:radial-gradient(ellipse_75%_55%_at_50%_16%,#000_35%,transparent_78%)] [background-image:linear-gradient(var(--grid-line)_1px,transparent_1px),linear-gradient(90deg,var(--grid-line)_1px,transparent_1px)]"
    />
  )
}
