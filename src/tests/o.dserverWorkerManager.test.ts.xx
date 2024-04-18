import { describe, it } from 'mocha';
import * as chai from 'chai';
import {
  ServerWorker,
  ServerWorkerExitCode,
  ServerWorkerManager,
  ServerWorkersManifest,
  WORKERS,
} from '../serverWorkerManager';
import { DeferredSignal } from 'wabe-ts';

const expect = chai.expect;

const NODE_ENV = 'NODE_ENV';

describe('serverWorkerManager', () => {
  it('can run a worker', async function () {
    this.timeout(6000);

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
    expect(true).to.be.true;
  });
});
