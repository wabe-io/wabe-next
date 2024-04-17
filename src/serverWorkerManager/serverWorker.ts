export enum ServerWorkerExitCode {
  Ok = 'ok',
  Error = 'error',
  AbortedOnRequest = 'aborted',
  UnhandledError = 'unhandled_error',
}

export type ServerWorker = (params: {
  instanceId: string;
  signal: AbortSignal;
  setStatus: (status: string) => void;
}) => Promise<ServerWorkerExitCode>;
