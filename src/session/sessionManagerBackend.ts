export interface SessionManagerBackend {
  getSerializedSession: (
    sessionId: string,
    ttlSeconds: number,
  ) => Promise<string | undefined>;

  saveSerializedSession: (
    sessionId: string,
    serializedSession: string,
    ttlSeconds: number,
  ) => Promise<void>;

  deleteSession: (sessionId: string) => Promise<void>;
}
