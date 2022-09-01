import { HttpStatusCodes } from 'wabe-ts';
import { HttpError } from './httpError';

export class UnauthorizedError extends HttpError {
  constructor(
    msg?: string,
    params?: { innerError?: unknown; publicMessage?: string },
  ) {
    super(HttpStatusCodes.Unauthorized, { ...params, msg });
  }
}
