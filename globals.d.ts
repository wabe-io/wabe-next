import { ServerWorkerManager } from './src/serverWorkerManager';

// global.d.ts
export {}; // This line makes sure the file is treated as a module

declare global {
  // eslint-disable-next-line no-var
  var wabeWokerManager: ServerWorkerManager | undefined; // Declaring a global variable
}
