import { ServerWorkersManifest } from './serverWorkersManifest';
import { WorkerConfig } from './workerConfig';
import { ManagerMode, allManagerModes } from './managerMode';
import { NodeMode, allNodeModes } from './nodeMode';
import { RunMode, allRunModes } from './runMode';
import { WORKERS, WORKER_MANAGER_MODE, WORKER_NODE_MODE } from './envConstants';

const NODE_ENV = 'NODE_ENV';

export const parseParameters = ({
  manifest,
  settings,
}: {
  manifest: ServerWorkersManifest;
  settings: { [key: string]: string | undefined };
}): {
  config: WorkerConfig[];
  blockWeb: boolean;
  blockManager: boolean;
  blockManagerUI: boolean;
} => {
  const nodeModeParam = settings[WORKER_NODE_MODE]?.trim() || ManagerMode.Auto;

  if (!(allNodeModes as string[]).includes(nodeModeParam)) {
    throw new Error(`Worker node mode not supported: ${nodeModeParam}`);
  }

  const workerNodeMode = nodeModeParam as NodeMode;

  const managerModeParam =
    settings[WORKER_MANAGER_MODE]?.trim() || ManagerMode.Auto;

  if (!(allManagerModes as string[]).includes(managerModeParam)) {
    throw new Error(
      `Worker manager service mode not supported: ${managerModeParam}`,
    );
  }

  const managerMode = managerModeParam as ManagerMode;

  const config = (settings[WORKERS] ?? '')
    .split(',')
    .filter((line) => line !== '')
    .map((workerLine) => {
      const atSplit = workerLine.split('@');
      const qttyText = atSplit.length === 2 ? atSplit[0] : undefined;
      const colonSplit = atSplit[atSplit.length - 1].split(':');
      const workerName = colonSplit[0];
      const runMode = colonSplit[1];

      let quantity: number;

      try {
        quantity = qttyText ? parseInt(qttyText, 10) : 1;
      } catch (e) {
        throw new Error(`Error parsing worker config: ${qttyText}`);
      }

      if (runMode && !(allRunModes as string[]).includes(runMode)) {
        throw new Error(
          `Error parsing worker config. Unsupported run mode: ${runMode}`,
        );
      }

      const worker = manifest.find(({ name }) => name === workerName)?.worker;

      if (!worker) {
        throw new Error(`Unknown worker ${workerName}`);
      }

      return {
        workerName,
        quantity,
        worker,
        runMode: (runMode as RunMode) || RunMode.Auto,
      };
    });

  const provisioned = config.length > 0;
  const isDev = settings[NODE_ENV] === 'development';

  if (
    !provisioned &&
    (managerMode === ManagerMode.Force || managerMode === ManagerMode.ForceSvc)
  ) {
    throw new Error(
      'Worker manager mode has been set to force but no workers have been assigned to this node',
    );
  }

  return {
    config,
    blockWeb: provisioned && workerNodeMode === NodeMode.Auto,
    blockManager: !provisioned || (!isDev && managerMode === ManagerMode.Auto),
    blockManagerUI:
      !provisioned ||
      (!isDev && managerMode === ManagerMode.Auto) ||
      managerMode === ManagerMode.ForceSvc,
  };
};
