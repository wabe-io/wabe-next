import { HttpStatusCodes, HttpError } from 'wabe-ts';

/**
 * @deprecated use wabe-ts InternalServerError
 */
export class InternalServerError extends HttpError {
  constructor(
    msg?: string,
    params?: { innerError?: unknown; publicMessage?: string },
  ) {
    super(HttpStatusCodes.InternalServerError, { ...params, msg });
  }
}
