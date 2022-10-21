import { HttpStatusCodes, HttpError } from 'wabe-ts';

/**
 * @deprecated use wabe-ts ForbiddenError
 */
export class ForbiddenError extends HttpError {
  constructor(
    msg?: string,
    params?: { innerError?: unknown; publicMessage?: string },
  ) {
    super(HttpStatusCodes.Forbidden, { ...params, msg });
  }
}
