export const queryKeys = {
  getReadiness: () => ['readiness'] as const,
  getProfile: () => ['profile'] as const,
  getRooms: () => ['rooms'] as const,
  getEmployees: () => ['employees'] as const,
  getComputers: () => ['computers'] as const,
  getReleases: (roomId?: string) => ['releases', roomId] as const,
  getOnlineComputers: (roomId?: string) => ['computers-online', roomId] as const,
  getPrinters: (roomId?: string) => ['printers', roomId] as const,
}
