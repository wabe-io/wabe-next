import type { NextApiRequest, NextApiResponse } from 'next';
import { HttpStatusCodes, HttpError } from 'wabe-ts';

export type ApiHandler<O> = (params: {
  req: NextApiRequest;
  res: NextApiResponse<O>;
}) => Promise<O> | void;

export const handleApiFactory =
  (errorLogger: (error: unknown) => void) =>
  <A = never, B = never, C = never, D = never>(handlerMap: {
    get?: ApiHandler<A>;
    post?: ApiHandler<B>;
    put?: ApiHandler<C>;
    del?: ApiHandler<D>;
  }) =>
  async (
    req: NextApiRequest,
    res: NextApiResponse<A | B | C | D | { error: string }>,
  ) => {
    const methods = Object.keys(handlerMap);
    try {
      for (const method of methods) {
        if (
          req.method === method.toUpperCase() ||
          (req.method === 'DELETE' && method === 'del')
        ) {
          const handler = (
            handlerMap as { [key: string]: ApiHandler<A | B | C | D> }
          )[method];

          const result = await handler({ req, res });

          if (result !== undefined) {
            res.status(HttpStatusCodes.Ok).json(result);
          } else if (!res.writableEnded) {
            res.status(HttpStatusCodes.NoContent).end();
          }

          return;
        }
      }

      // Method not allowed
      throw new HttpError(HttpStatusCodes.MethodNotAllowed);
    } catch (error) {
      errorLogger(error);

      if (HttpError.isHttpError(error)) {
        res.status(error.statusCode);

        if (error.publicMessage) {
          res.json({ error: error.publicMessage });
        } else {
          res.end();
        }
      } else {
        res.status(500).end();
      }
    }
  };
