import { WorkerInstance } from './workerInstance';

export type WorkerInstanceStatus = Pick<
  WorkerInstance,
  | 'workerName'
  | 'autoRestart'
  | 'lastStatusText'
  | 'exitCode'
  | 'instanceId'
  | 'state'
>;
