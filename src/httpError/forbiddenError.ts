import { HttpStatusCodes } from 'wabe-ts';
import { HttpError } from './httpError';

export class ForbiddenError extends HttpError {
  constructor(
    msg?: string,
    params?: { innerError?: unknown; publicMessage?: string },
  ) {
    super(HttpStatusCodes.Forbidden, { ...params, msg });
  }
}
