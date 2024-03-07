import { SessionManagerBackend } from './sessionManagerBackend';
import { createClient, RedisClientType } from 'redis';

export type RedisSessionManagerBackendOptions = (
  | {
      redisUrl: string;
    }
  | { redisClient: RedisClientType }
) & {
  prefix: string;
};

export class RedisSessionManagerBackend implements SessionManagerBackend {
  redisClient: RedisClientType | undefined;
  redisUrl: string | undefined = undefined;
  prefix: string;

  constructor(options: RedisSessionManagerBackendOptions) {
    if ('redisUrl' in options) {
      this.redisUrl = options.redisUrl;
    } else if (options?.redisClient) {
      this.redisClient = options?.redisClient;
    } else {
      throw Error();
    }

    this.prefix = options.prefix;
  }

  public getSerializedSession = async (
    sessionId: string,
    ttlSeconds: number,
  ) => {
    const redis = await this.getRedisClient();
    const key = this.getKeyWithId(sessionId);
    const session = await redis.get(key);

    if (session) {
      await redis.expire(key, ttlSeconds);
    }

    return session ?? undefined;
  };

  public saveSerializedSession = async (
    sessionId: string,
    serializedSession: string,
    ttlSeconds: number,
  ) => {
    const redis = await this.getRedisClient();
    await redis.set(this.getKeyWithId(sessionId), serializedSession, {
      EX: ttlSeconds,
    });
  };

  public deleteSession = async (sessionId: string) => {
    const redis = await this.getRedisClient();
    await redis.del(this.getKeyWithId(sessionId));
  };

  private getRedisClient = async () => {
    if (!this.redisClient) {
      this.redisClient = createClient({ url: this.redisUrl });
      this.redisClient.on('error', (err) =>
        console.log('Redis Client Error', err),
      );
      await this.redisClient.connect();
    }

    if (this.redisClient.isReady) {
      return this.redisClient;
    }

    throw new Error('Redis not ready');
  };

  private getKeyWithId = (sessionId: string) => `${this.prefix}:${sessionId}`;
}
