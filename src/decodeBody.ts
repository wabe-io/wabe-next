import type { NextRequest } from 'next/server';
import { HttpStatusCodes, HttpError } from 'wabe-ts';
import { Decoder } from 'ts-decoder';

export const decodeBody =
  <T>(decoder: Decoder<T>) =>
  async (request: NextRequest): Promise<T> => {
    try {
      return decoder(await request.json());
    } catch (innerError) {
      throw new HttpError(HttpStatusCodes.BadRequest, {
        msg: 'Error decoding body',
        innerError,
      });
    }
  };
