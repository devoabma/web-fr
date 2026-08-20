export const queryKeys = {
  getProfile: () => ['profile'] as const,
  getRooms: () => ['rooms'] as const,
  getReleases: (roomId?: string) => ['releases', roomId] as const,
  getOnlineComputers: (roomId?: string) => ['computers-online', roomId] as const,
}
