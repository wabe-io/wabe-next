/* eslint deprecation/deprecation: 0 */

import { HttpStatusCodes, objectHasProp } from 'wabe-ts';

/**
 * @deprecated use wabe-ts HttpError
 */
export class HttpError extends Error {
  public readonly type = 'http_error';

  public statusCode: HttpStatusCodes;
  public innerError: unknown;
  public publicMessage: string | undefined;

  public static isHttpError(val: unknown): val is HttpError {
    return objectHasProp(val, 'type') && val.type === 'http_error';
  }

  constructor(
    statusCode: HttpStatusCodes,
    params?: { msg?: string; innerError?: unknown; publicMessage?: string },
  ) {
    super(params?.msg);
    this.innerError = params?.innerError;
    this.statusCode = statusCode;
    this.publicMessage = this.publicMessage;
  }

  public toString(): string {
    const data = {
      statusCode: this.statusCode,
      message: this.message,
      innerError: this.innerError != null ? String(this.innerError) : undefined,
      publicMessage: this.publicMessage,
    };

    return JSON.stringify(data);
  }
}
