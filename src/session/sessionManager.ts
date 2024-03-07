import { cookies } from 'next/headers';
import { Decoder, fromJson } from 'ts-decoder';
import { SessionManagerBackend } from './sessionManagerBackend';
import { MemorySessionManagerBackend } from './memorySessionManagerBackend';
import { randomInt } from 'crypto';

const MAX_RND = 2 ** 48 - 1;
const MAX_TTL_SECONDS = 60 * 60 * 24 * 365;

export type SessionManagerOptions<T> = {
  cookiePrefix?: string;
  sessionDecoder?: Decoder<T>;
  backend?: SessionManagerBackend;
  sessionTTLSeconds?: number;
};

export class SessionManager<T> {
  private backend: SessionManagerBackend;
  private sessionFactory: () => T;
  private cookiePrefix: string;
  private sessionDecoder: Decoder<T> | undefined;
  private sessionTTLSeconds: number;

  constructor(sessionFactory: () => T, options?: SessionManagerOptions<T>) {
    this.sessionFactory = sessionFactory;
    this.cookiePrefix = options?.cookiePrefix ?? 'session-id';
    this.sessionDecoder = options?.sessionDecoder ?? undefined;

    this.backend =
      options?.backend ??
      new MemorySessionManagerBackend({ autoCleanupIntervalSeconds: 120 });

    this.sessionTTLSeconds = options?.sessionTTLSeconds ?? MAX_TTL_SECONDS;
  }

  public getCurrentSession = async (): Promise<T> => {
    const sessionId = this.getCurrentSessionId();
    const session = await this.getSession(sessionId);

    if (session) {
      return session;
    }

    const newSession = this.sessionFactory();
    await this.saveSession(sessionId, newSession);
    return newSession;
  };

  public updateCurrentSession = async (data: T): Promise<void> => {
    const oldData = await this.getCurrentSession();
    const sessionId = this.getCurrentSessionId();
    await this.saveSession(sessionId, { ...oldData, ...data });
  };

  public deleteSession = async (sessionId: string) => {
    const cookieStore = cookies();
    this.backend.deleteSession(sessionId);
    cookieStore.delete(sessionId);
  };

  private saveSession = async (sessionId: string, data: T) => {
    await this.backend.saveSerializedSession(
      sessionId,
      JSON.stringify(data),
      this.sessionTTLSeconds,
    );
  };

  private getSession = async (sessionId: string): Promise<T | undefined> => {
    const session = await this.backend.getSerializedSession(
      sessionId,
      this.sessionTTLSeconds,
    );
    if (!session) return;

    try {
      if (this.sessionDecoder) {
        return fromJson(this.sessionDecoder)(session);
      } else {
        return JSON.parse(session) as T;
      }
    } catch (error) {
      throw new Error('Could not restore session', { cause: error });
    }
  };

  private getCurrentSessionId = (): string => {
    const cookieStore = cookies();
    let sessionId = cookieStore.get(this.cookiePrefix)?.value;

    if (!sessionId) {
      sessionId = randomInt(MAX_RND).toString();
    }

    cookieStore.set(this.cookiePrefix, sessionId, {
      maxAge: this.sessionTTLSeconds,
    });

    return sessionId;
  };
}
