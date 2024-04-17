import { WorkerConfig } from './workerConfig';
import { ServerWorkersManifest } from './serverWorkersManifest';
import { parseParameters } from './parseParameters';
import { WorkerInstance, WorkerInstanceState } from './workerInstance';
import { RunMode } from './runMode';
import { randomString } from './randomString';
import { ServerWorkerExitCode } from './serverWorker';
import { sleep } from './sleep';

const BACKOFF_TIME = 5000;

/**
 * Workers config
 *
 * Worker run modes (WORKERS):
 *    auto: (default) Starts the worker immediately and restarts it after a backoff period if it throws an error
 *    load: Loads the worker but does not start it
 *    start: Starts the worker immediately. Will take no action if it throws an error
 *
 * Worker node mode (WORKER_NODE_MODE):
 *    auto: (default) Disables general access to all routes except for "/wmgr" if at least one worker is assigned to this node
 *    mixed: Enables general access (along with "/swmgr" if at least one worker is assigned to this node)
 *
 * Worker manager mode (WORKER_MANAGER_MODE):
 *    auto: (default) In DEV mode, will enable service routes and UI if at least one worker is assigned to this node. In PRODUCTION mode will disable both.
 *    force: Enables service routes and UI. Will not start if no workers are assigned to this node.
 *    force-svc: Enables service routes only. Will not start if no workers are assigned to this node.
 *
 */

export class ServerWorkerManager {
  private config: WorkerConfig[] | undefined;
  public blockWeb: boolean = true;
  public blockManager: boolean = true;
  public blockManagerUI: boolean = true;
  private instances: WorkerInstance[] = [];
  private stopQueue: string[] = [];
  private startQueue: string[] = [];
  private loopController: AbortController | undefined;

  public constructor(
    manifest: ServerWorkersManifest,
    settings: { [key: string]: string | undefined },
    optionals?: { onInitializationError?: (error: unknown) => void },
  ) {
    const onInitializationError =
      optionals?.onInitializationError ||
      (() => {
        process.exit();
      });

    try {
      const { config, blockManager, blockManagerUI, blockWeb } =
        parseParameters({ manifest, settings });
      this.config = config;
      this.blockWeb = blockWeb;
      this.blockManager = blockManager;
      this.blockManagerUI = blockManagerUI;

      if (config.length > 0) {
        const instanceQtty = config.reduce((p, v) => p + v.quantity, 0);
        let txt = 'ServerWorker manager config loaded\n';
        txt += `Will load ${instanceQtty} instances of ${config.length} workers\n`;

        if (blockWeb && blockManager) {
          txt += 'Access to routes is blocked\n';
        } else if (blockWeb) {
          txt += 'Access to non-server worker routes is blocked\n';
        } else if (blockManagerUI) {
          txt += 'Access to server workers UI is blocked\n';
        } else if (blockManager) {
          txt += 'Access to server workers routes is blocked\n';
        }

        console.log(txt);
      }
    } catch (e) {
      console.error(e);
      onInitializationError(e);
    }
  }

  public stopManager = () => {
    this.loopController?.abort();
  };

  public startManager = () => {
    if (!this.config) {
      throw new Error(
        'Invalid state: config has not been successfully initialized ',
      );
    }

    if (this.config.length > 0) {
      for (const workerConfig of this.config) {
        const shouldStart =
          workerConfig.runMode === RunMode.Auto ||
          workerConfig.runMode === RunMode.Start;

        for (let index = 0; index < workerConfig.quantity; index++) {
          const instance: WorkerInstance = {
            instanceId: randomString(),
            workerName: workerConfig.workerName,
            worker: workerConfig.worker,
            autoRestart: workerConfig.runMode === RunMode.Auto,
            lastStatusText: undefined,
            exitCode: undefined,
            abortController: new AbortController(),
            backoffTime: undefined,
            state: shouldStart
              ? WorkerInstanceState.Starting
              : WorkerInstanceState.Idle,
          };

          if (shouldStart) {
            this.startQueue.push(instance.instanceId);
          }

          this.instances.push(instance);
        }
      }

      this.loop();
    }
  };

  private getInstance = (instanceId: string): WorkerInstance => {
    const workerInstance = this.instances.find(
      (instance) => instanceId === instance.instanceId,
    );
    if (!workerInstance) {
      throw new Error(`Worker instance ${instanceId} not found`);
    }
    return workerInstance;
  };

  // Main loop
  private loop = async () => {
    const lc = new AbortController();
    this.loopController = lc;

    while (!lc.signal.aborted) {
      // Start as needed
      const idsToStart = [...this.startQueue];
      this.startQueue = [];

      let idToStart = idsToStart.shift();

      while (idToStart) {
        // Searches for instance
        const instance = this.getInstance(idToStart);

        if (instance.backoffTime && instance.backoffTime > Date.now()) {
          this.startQueue.push(idToStart);
        } else {
          instance.backoffTime = undefined;
          instance.state = WorkerInstanceState.Running;
          instance.exitCode = undefined;

          instance
            .worker({
              instanceId: instance.instanceId,
              signal: instance.abortController.signal,
              setStatus: (status: string) => {
                instance.lastStatusText = status;
              },
            })
            .then((exitCode) => {
              instance.exitCode = exitCode;
              instance.state = WorkerInstanceState.Idle;
            })
            .catch((error) => {
              console.error(
                `Unhandled exception in server worker ${instance.workerName} with instance id ${instance.instanceId}: ${error}`,
              );
              instance.exitCode = ServerWorkerExitCode.UnhandledError;

              if (instance.autoRestart) {
                this.startQueue.push(instance.instanceId);
                instance.state = WorkerInstanceState.BackingOff;
                instance.backoffTime = Date.now() + BACKOFF_TIME;
              } else {
                instance.state = WorkerInstanceState.Idle;
              }
            });
        }

        idToStart = idsToStart.shift();
      }

      // Stop as needed
      let idToStop = this.stopQueue.shift();
      while (idToStop) {
        // Searches for instance
        const instance = this.getInstance(idToStop);
        instance.abortController.abort();

        idToStop = this.stopQueue.shift();
      }

      await sleep(1000);
    }
  };

  public startWorker = (instanceId: string) => {
    if (!this.startQueue.includes(instanceId)) {
      this.getInstance(instanceId).state = WorkerInstanceState.Starting;
      this.startQueue.push(instanceId);
    }
  };

  public stopWorker = (instanceId: string) => {
    if (!this.stopQueue.includes(instanceId)) {
      const instance = this.getInstance(instanceId);
      instance.autoRestart = false;
      instance.state = WorkerInstanceState.Stopping;
      this.stopQueue.push(instanceId);
    }
  };

  public getWorkersStatus = () => {
    return this.instances.map(
      ({
        workerName,
        autoRestart,
        lastStatusText,
        exitCode,
        instanceId,
        state,
      }) => ({
        workerName,
        autoRestart,
        lastStatusText,
        exitCode,
        instanceId,
        state,
      }),
    );
  };
}

const NODE_RUNTIME = 'nodejs';

export const registerWorkerManager = (manifest: ServerWorkersManifest) => {
  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv !== 'development' && nodeEnv !== 'production') {
    console.log(`Skipping registerWorkerManager node env "${nodeEnv}"`);
    return;
  }

  if (global.wabeWokerManager != null) {
    console.log(
      "Skipping registerWorkerManager because it's already registered",
    );
    return;
  }

  global.wabeWokerManager = new ServerWorkerManager(manifest, process.env);

  const runtime = process.env['NEXT_RUNTIME'];
  if (runtime === NODE_RUNTIME) {
    global.wabeWokerManager.startManager();
  }
};
