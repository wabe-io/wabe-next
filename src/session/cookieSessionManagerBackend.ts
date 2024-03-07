import { cookies } from 'next/headers';
import { SessionManagerBackend } from './sessionManagerBackend';
import { createCipheriv, createDecipheriv } from 'crypto';

const COOKIE_NAME = 'csmbesessionData';

export class CookieSessionManagerBackend implements SessionManagerBackend {
  private key: string;
  private iv: string;

  constructor(key: string, iv: string) {
    this.key = key;
    this.iv = iv;

    if (key.length !== 32) {
      throw new Error('Key should be 32 chars long');
    }

    if (iv.length !== 16) {
      throw new Error('IV should be 16 chars long');
    }
  }

  public getSerializedSession = async (
    sessionId: string,
    ttlSeconds: number,
  ) => {
    const cookieStore = cookies();
    const serializedSession = cookieStore.get(
      this.getCookieNameWithId(sessionId),
    )?.value;

    if (serializedSession) {
      try {
        const decrypted = serializedSession
          ? this.decryptSymmetric(this.key, serializedSession, this.iv)
          : undefined;

        cookieStore.set(
          this.getCookieNameWithId(sessionId),
          serializedSession,
          {
            maxAge: ttlSeconds,
          },
        );

        return decrypted;
      } catch {}
    }

    return undefined;
  };

  public saveSerializedSession = async (
    sessionId: string,
    serializedSession: string,
    ttlSeconds: number,
  ) => {
    const cookieStore = cookies();
    cookieStore.set(
      this.getCookieNameWithId(sessionId),
      this.encryptSymmetric(this.key, serializedSession, this.iv),
      {
        maxAge: ttlSeconds,
      },
    );
  };

  public deleteSession = async (sessionId: string) => {
    const cookieStore = cookies();
    cookieStore.delete(this.getCookieNameWithId(sessionId));
  };

  private getCookieNameWithId = (sessionId: string) =>
    `${COOKIE_NAME}_${sessionId}`;

  /**
   *
   * @param key Must be 32 characters in length
   * @param plaintext
   * @param iv Must be 16 characters in length
   * @returns
   */
  private encryptSymmetric = (key: string, plaintext: string, iv: string) => {
    const cipher = createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  };

  private decryptSymmetric = (key: string, ciphertext: string, iv: string) => {
    const decipher = createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  };
}
