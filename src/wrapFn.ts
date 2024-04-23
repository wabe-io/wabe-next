// /* eslint-disable @typescript-eslint/no-explicit-any */
// import type { NextApiHandler } from 'next';
// import { NextResponse } from 'next/server';
// import { HttpError } from 'wabe-ts';
// import { randomUUID } from 'crypto';

// export type WrapApiErrorLogger = (
//   error: unknown,
//   errorInstanceId: string,
// ) => void;

// // export const wrapApi =
// //   <T = any>(
// //     handler: NextApiHandler<T>,
// //     errorLogger?: WrapApiErrorLogger,
// //   ): NextApiHandler<T> =>
// //   async (req, res) => {
// //     try {
// //       const v = await handler(req, res);
// //       return v;
// //     } catch (error) {
// //       const errorInstanceId = randomUUID();

// //       if (errorLogger) {
// //         errorLogger(error, errorInstanceId);
// //       }

// //       if (HttpError.isHttpError(error)) {
// //         res.statusCode = error.statusCode;

// //         if (error.publicMessage) {
// //           return NextResponse.json({ error: error.publicMessage });
// //         }
// //         return NextResponse.json({ error: errorInstanceId });
// //       } else {
// //         res.statusCode = 500;
// //       }
// //     }
// //   };

// // const sum = (a: number, b: number, c: string): number => {
// //   console.log(c);
// //   return a + b;
// // };

// const wrapApi = <T extends (...args: any[]) => NextResponse>(
//   fn: T,
//   errorLogger?: WrapApiErrorLogger,
// ): T => {
//   return ((...args: Parameters<T>): NextResponse => {
//     // Call the original function with all its arguments

//     try {
//       return fn(...args);
//     } catch (error) {
//       const errorInstanceId = randomUUID();

//       if (errorLogger) {
//         errorLogger(error, errorInstanceId);
//       }

//       if (HttpError.isHttpError(error)) {

//         res.statusCode = error.statusCode;

//         if (error.publicMessage) {
//           return NextResponse.json({ error: error.publicMessage });
//         }
//         return NextResponse.json({ error: errorInstanceId });
//       } else {
//         res.statusCode = 500;
//       }
//     }
//   }) as T;
// };
