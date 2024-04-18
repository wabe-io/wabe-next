import { describe, expect, test } from '@jest/globals';
import { ServerWorkerExitCode, WORKERS } from '../../src/serverWorkerManager';
import { parseParameters } from '../../src/serverWorkerManager/parseParameters';
import { RunMode } from '../../src/serverWorkerManager/runMode';

const okWorker = async () => ServerWorkerExitCode.Ok;

const NODE_ENV = 'NODE_ENV';

describe('ServerWorker manager parse parameters', () => {
  test('should work unchanged if no workers set up to run on dev', () => {
    const { blockManager, blockManagerUI, blockWeb } = parseParameters({
      manifest: [
        {
          name: 'foo',
          worker: okWorker,
        },
      ],
      settings: {
        [NODE_ENV]: 'development',
        [WORKERS]: '',
      },
    });
    expect(blockWeb).toBeFalsy();
    expect(blockManager).toBeTruthy();
    expect(blockManagerUI).toBeTruthy();
  });

  test('should work unchanged if no workers set up to run on prod', () => {
    const { blockManager, blockManagerUI, blockWeb } = parseParameters({
      manifest: [
        {
          name: 'foo',
          worker: okWorker,
        },
      ],
      settings: {
        [NODE_ENV]: 'production',
        [WORKERS]: '',
      },
    });
    expect(blockWeb).toBeFalsy();
    expect(blockManager).toBeTruthy();
    expect(blockManagerUI).toBeTruthy();
  });

  test('should work unchanged if no workers provisioned dev', () => {
    const { blockManager, blockManagerUI, blockWeb } = parseParameters({
      manifest: [],
      settings: {
        [NODE_ENV]: 'development',
      },
    });
    expect(blockWeb).toBeFalsy();
    expect(blockManager).toBeTruthy();
    expect(blockManagerUI).toBeTruthy();
  });

  test('should work unchanged if no workers provisioned on prod', () => {
    const { blockManager, blockManagerUI, blockWeb } = parseParameters({
      manifest: [],
      settings: {
        [NODE_ENV]: 'production',
      },
    });
    expect(blockWeb).toBeFalsy();
    expect(blockManager).toBeTruthy();
    expect(blockManagerUI).toBeTruthy();
  });

  test('should only block web access on dev', () => {
    const { blockManager, blockManagerUI, blockWeb } = parseParameters({
      manifest: [
        {
          name: 'foo',
          worker: okWorker,
        },
      ],
      settings: {
        [NODE_ENV]: 'development',
        [WORKERS]: 'foo',
      },
    });
    expect(blockWeb).toBeTruthy();
    expect(blockManager).toBeFalsy();
    expect(blockManagerUI).toBeFalsy();
  });

  test('should only block all access on prod', () => {
    const { blockManager, blockManagerUI, blockWeb } = parseParameters({
      manifest: [
        {
          name: 'foo',
          worker: okWorker,
        },
      ],
      settings: {
        [NODE_ENV]: 'production',
        [WORKERS]: 'foo',
      },
    });
    expect(blockWeb).toBeTruthy();
    expect(blockManager).toBeTruthy();
    expect(blockManagerUI).toBeTruthy();
  });

  test('can parse a single worker name', () => {
    const { config } = parseParameters({
      manifest: [
        {
          name: 'foo',
          worker: okWorker,
        },
      ],
      settings: {
        [NODE_ENV]: 'production',
        [WORKERS]: 'foo',
      },
    });
    expect(config.length).toEqual(1);
    expect(config[0]).toEqual({
      quantity: 1,
      runMode: RunMode.Auto,
      worker: okWorker,
      workerName: 'foo',
    });
  });

  test('can parse a single worker name with quantity', () => {
    const { config } = parseParameters({
      manifest: [
        {
          name: 'foo',
          worker: okWorker,
        },
      ],
      settings: {
        [NODE_ENV]: 'production',
        [WORKERS]: '2@foo',
      },
    });

    expect(config[0].quantity).toEqual(2);
  });

  test('can parse a single worker name with mode', () => {
    const { config } = parseParameters({
      manifest: [
        {
          name: 'foo',
          worker: okWorker,
        },
      ],
      settings: {
        [NODE_ENV]: 'production',
        [WORKERS]: 'foo:load',
      },
    });

    expect(config[0].runMode).toEqual(RunMode.Load);
  });

  test('can parse a single worker name with mode and quantity', () => {
    const { config } = parseParameters({
      manifest: [
        {
          name: 'foo',
          worker: okWorker,
        },
      ],
      settings: {
        [NODE_ENV]: 'production',
        [WORKERS]: '4@foo:load',
      },
    });

    expect(config[0].runMode).toEqual(RunMode.Load);
    expect(config[0].quantity).toEqual(4);
  });

  test('can parse muliple workers', () => {
    const { config } = parseParameters({
      manifest: [
        {
          name: 'foo',
          worker: okWorker,
        },
        {
          name: 'bar',
          worker: okWorker,
        },
      ],
      settings: {
        [NODE_ENV]: 'production',
        [WORKERS]: 'foo,bar',
      },
    });
    expect(config.length).toEqual(2);
  });
});
