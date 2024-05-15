/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, test } from '@jest/globals';
import { NextRequest, NextResponse } from 'next/server';
import { loggedRouteHandler } from '../../src/loggedRouteHandler';
import { HttpError, HttpStatusCodes } from 'wabe-ts';

describe('loggedRouteHandler', () => {
  test('can call passthrough', async () => {
    const logged = loggedRouteHandler(() => undefined);
    const loggedHandler = logged(async () => NextResponse.json({ foo: 'bar' }));
    const res = await loggedHandler(undefined as unknown as NextRequest);
    expect(res).not.toBeUndefined();
    expect(await res?.json()).toEqual({ foo: 'bar' });
  });

  test('returns error 500 on generic thrown', async () => {
    let errorThrown: any = undefined;
    const logged = loggedRouteHandler((e) => (errorThrown = e));
    const loggedHandler = logged(async () => {
      throw 42;
    });
    const res = await loggedHandler(undefined as unknown as NextRequest);
    expect(res).not.toBeUndefined();
    expect(res?.status).toEqual(HttpStatusCodes.InternalServerError);
    expect(errorThrown).toBe(42);
  });

  test('returns a specific error and message if HttpError is thrown', async () => {
    let errorThrown: any = undefined;
    const logged = loggedRouteHandler((e) => {
      errorThrown = e;
    });
    const loggedHandler = logged(async () => {
      throw new HttpError(HttpStatusCodes.Forbidden, {
        msg: 'foo',
        publicMessage: 'bar',
      });
    });
    const res = await loggedHandler(undefined as unknown as NextRequest);
    expect(res).not.toBeUndefined();
    expect(res?.status).toEqual(HttpStatusCodes.Forbidden);
    expect(errorThrown?.publicMessage).toBe('bar');
    expect(errorThrown?.message).toBe('foo');
  });
});
