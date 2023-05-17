import type { NextApiRequest, NextApiResponse } from 'next';
import { HttpStatusCodes, HttpError } from 'wabe-ts';
import { ApiResponse, isApiResponse } from './apiResponse';

export type ApiHandler<O> = (params: {
  req: NextApiRequest;
  res: NextApiResponse<O>;
}) => Promise<O> | Promise<ApiResponse<O>> | void;

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

          // If handler responded with an ApiResponse object
          if (isApiResponse(result)) {
            if (result.setHeaders) {
              for (const header of result.setHeaders) {
                res.setHeader(header[0], header[1]);
              }
            }

            if (result.contentType) {
              res.setHeader('Content-Type', result.contentType);
            }

            if (result.status) {
              res.status(result.status);
            }

            if (result.setCookies) {
              throw new Error('Not implemented');
            }

            if (result.data) {
              res.send(result.data);
            }

            res.end();
          }
          // If response was something else than undefined, we assume it is json
          else if (result !== undefined) {
            res.status(HttpStatusCodes.Ok).json(result);
          }
          // If response === undefined then check if response was closed
          else if (!res.writableEnded) {
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
