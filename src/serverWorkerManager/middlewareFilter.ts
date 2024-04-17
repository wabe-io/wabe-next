import { NextRequest } from 'next/server';

export const serverWorkerManagerMiddlewareFilter = (
  request: NextRequest,
): boolean => {
  if (
    request.nextUrl.pathname.startsWith('/swmgr') &&
    (global.wabeWokerManager?.blockManagerUI ||
      global.wabeWokerManager?.blockManager)
  ) {
    return false;
  }

  if (
    request.nextUrl.pathname.startsWith('/swmgr/ui') &&
    !request.nextUrl.pathname.startsWith('/_next/static') &&
    global.wabeWokerManager?.blockManagerUI
  ) {
    return false;
  }

  if (
    !request.nextUrl.pathname.startsWith('/swmgr') &&
    !request.nextUrl.pathname.startsWith('/_next/static') &&
    global.wabeWokerManager?.blockWeb
  ) {
    return false;
  }

  return true;
};
