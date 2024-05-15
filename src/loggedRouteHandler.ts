import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { HttpError } from 'wabe-ts';

export type LoggedRouteHandlerLogger = (
  error: unknown,
  errorInstanceId: string,
) => void;

/**
 * Factory function returning route handler wrapper to log errors
 */
export const loggedRouteHandler =
  (errorLogger: LoggedRouteHandlerLogger) =>
  (
    routeHandler: (
      req: NextRequest,
      ...args: unknown[]
    ) => Promise<NextResponse | undefined>,
  ) =>
  async (req: NextRequest, ...args: unknown[]) => {
    try {
      const result = await routeHandler(req, ...args);
      return result;
    } catch (error) {
      const errorInstanceId = randomUUID();
      errorLogger(error, errorInstanceId);

      let statusCode = 500;
      let data = { error: true as boolean | string };

      if (HttpError.isHttpError(error)) {
        statusCode = error.statusCode;

        if (error.publicMessage) {
          data = { error: error.publicMessage };
        } else {
          data = { error: errorInstanceId };
        }
      }

      return NextResponse.json(data, { status: statusCode });
    }
  };
