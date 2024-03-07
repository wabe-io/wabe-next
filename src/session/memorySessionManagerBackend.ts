import { SessionManagerBackend } from './sessionManagerBackend';

export class MemorySessionManagerBackend implements SessionManagerBackend {
  private serializedSessions: { [key: string]: string } = {};
  private sessionExpirations: { [key: string]: number } = {};

  constructor({
    autoCleanupIntervalSeconds,
  }: {
    autoCleanupIntervalSeconds: number;
  }) {
    if (autoCleanupIntervalSeconds > 0) {
      const cleanupExpiredSessions = this.cleanupExpiredSessions;
      setInterval(() => {
        cleanupExpiredSessions();
      }, autoCleanupIntervalSeconds * 1000);
    }
  }

  private updateExpirationDate = (sessionId: string, ttlSeconds: number) => {
    this.sessionExpirations[sessionId] = Date.now() + ttlSeconds * 1000;
  };

  public deleteSession = async (sessionId: string) => {
    delete this.sessionExpirations[sessionId];
    delete this.serializedSessions[sessionId];
  };

  public getSerializedSession = async (
    sessionId: string,
    ttlSeconds: number,
  ) => {
    const session = this.serializedSessions[sessionId];

    if (!session) {
      await this.deleteSession(sessionId);
    } else {
      this.updateExpirationDate(sessionId, ttlSeconds);
    }

    return session;
  };

  public saveSerializedSession = async (
    sessionId: string,
    serializedSession: string,
    ttlSeconds: number,
  ) => {
    this.serializedSessions[sessionId] = serializedSession;
    this.updateExpirationDate(sessionId, ttlSeconds);
  };

  public cleanupExpiredSessions = async () => {
    const ids = Object.keys(this.sessionExpirations);

    for (const id of ids) {
      const expiration = this.sessionExpirations[id];

      if (expiration && expiration < Date.now()) {
        // expired
        this.deleteSession(id);
      }
    }
  };
}
