import { ServerWorker } from './serverWorker';

export type ServerWorkersManifest = { name: string; worker: ServerWorker }[];
