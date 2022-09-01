import { HttpStatusCodes } from 'wabe-ts';
import { HttpError } from './httpError';

export class InternalServerError extends HttpError {
  constructor(
    msg?: string,
    params?: { innerError?: unknown; publicMessage?: string },
  ) {
    super(HttpStatusCodes.InternalServerError, { ...params, msg });
  }
}
