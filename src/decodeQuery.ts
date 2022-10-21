import type { NextApiRequest } from 'next';
import { HttpStatusCodes, HttpError } from 'wabe-ts';
import { Decoder } from 'ts-decoder';

export const decodeQuery =
  <T>(decoder: Decoder<T>) =>
  (request: NextApiRequest): T => {
    try {
      return decoder(request.query);
    } catch (innerError) {
      throw new HttpError(HttpStatusCodes.BadRequest, {
        msg: 'Error decoding query',
        innerError,
      });
    }
  };
