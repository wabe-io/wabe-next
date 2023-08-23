/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiHandler } from 'next';
import { NextResponse } from 'next/server';
import { HttpError } from 'wabe-ts';

export type WrapApiErrorLogger = (error: unknown) => void;

export const wrapApi =
  <T = any>(
    handler: NextApiHandler<T>,
    errorLogger?: WrapApiErrorLogger,
  ): NextApiHandler<T> =>
  async (req, res) => {
    try {
      const v = await handler(req, res);
      return v;
    } catch (error) {
      if (errorLogger) {
        errorLogger(error);
      }

      if (HttpError.isHttpError(error)) {
        res.statusCode = error.statusCode;

        if (error.publicMessage) {
          return NextResponse.json({ error: error.publicMessage });
        }
        return NextResponse.json('');
      } else {
        res.statusCode = 500;
      }
    }
  };
