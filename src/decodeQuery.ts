import type { NextRequest } from 'next/server';
import { HttpStatusCodes, HttpError } from 'wabe-ts';
import { Decoder } from 'ts-decoder';

export const decodeQuery =
  <T>(decoder: Decoder<T>) =>
  (request: NextRequest): T => {
    try {
      const url = new URL(request.url);
      const obj: { [key: string]: string } = {};
      for (const [paramKey, paramValue] of url.searchParams) {
        obj[paramKey] = paramValue;
      }
      return decoder(obj);
    } catch (innerError) {
      throw new HttpError(HttpStatusCodes.BadRequest, {
        msg: 'Error decoding query',
        innerError,
      });
    }
  };
