import { HttpStatusCodes, HttpError } from 'wabe-ts';

/**
 * @deprecated use wabe-ts UnauthorizedError
 */
export class UnauthorizedError extends HttpError {
  constructor(
    msg?: string,
    params?: { innerError?: unknown; publicMessage?: string },
  ) {
    super(HttpStatusCodes.Unauthorized, { ...params, msg });
  }
}
