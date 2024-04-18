import { describe, test } from '@jest/globals';

import {
  ServerWorker,
  ServerWorkerExitCode,
  ServerWorkerManager,
  ServerWorkersManifest,
  WORKERS,
} from '../serverWorkerManager';
import { DeferredSignal } from 'wabe-ts';

const NODE_ENV = 'NODE_ENV';

describe('serverWorkerManager', () => {
  test('can run a worker', async function () {
    const signal = new DeferredSignal();

    const okWorker: ServerWorker = async () => {
      signal.resolve();
      return ServerWorkerExitCode.Ok;
    };
    const manifest: ServerWorkersManifest = [{ name: 'foo', worker: okWorker }];
    const manager = new ServerWorkerManager(manifest, {
      [NODE_ENV]: 'production',
      [WORKERS]: 'foo',
    });
    manager.startManager();
    await signal.promise;
    manager.stopManager();
  }, 6000);
});
