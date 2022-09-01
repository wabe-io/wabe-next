import { HttpStatusCodes } from 'wabe-ts';
import { HttpError } from './httpError';

export class NotFoundError extends HttpError {
  constructor(
    msg?: string,
    params?: { innerError?: unknown; publicMessage?: string },
  ) {
    super(HttpStatusCodes.NotFound, { ...params, msg });
  }
}
