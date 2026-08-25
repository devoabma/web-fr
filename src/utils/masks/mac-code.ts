export function maskMacCode(value: string) {
  return value
    .replace(/[^0-9a-fA-F]/g, '')
    .slice(0, 12)
    .toUpperCase()
    .replace(/(.{2})(?=.)/g, '$1-')
}
