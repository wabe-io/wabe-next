import { ServerWorker, ServerWorkerExitCode } from './serverWorker';

export enum WorkerInstanceState {
  Idle = 'idle',
  Starting = 'starting',
  Running = 'running',
  Stopping = 'stopping',
  BackingOff = 'backing_off',
}

export type WorkerInstance = {
  workerName: string;
  worker: ServerWorker;
  autoRestart: boolean;
  instanceId: string;
  lastStatusText: string | undefined;
  exitCode: ServerWorkerExitCode | undefined;
  abortController: AbortController;
  backoffTime: number | undefined;
  state: WorkerInstanceState;
};
