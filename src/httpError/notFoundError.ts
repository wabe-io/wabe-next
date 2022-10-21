import { HttpStatusCodes, HttpError } from 'wabe-ts';

/**
 * @deprecated use wabe-ts NotFoundError
 */
export class NotFoundError extends HttpError {
  constructor(
    msg?: string,
    params?: { innerError?: unknown; publicMessage?: string },
  ) {
    super(HttpStatusCodes.NotFound, { ...params, msg });
  }
}
