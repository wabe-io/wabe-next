import { ServerWorker } from './serverWorker';
import { RunMode } from './runMode';

export type WorkerConfig = {
  workerName: string;
  quantity: number;
  worker: ServerWorker;
  runMode: RunMode;
};
