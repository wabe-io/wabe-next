export class DeferredSignal<T = void> {
  private promiseResolve!: (val: T | PromiseLike<T>) => void;
  private promiseReject!: (cause?: unknown) => void;

  public promise!: Promise<T>;

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.promiseResolve = resolve;
      this.promiseReject = reject;
    });
  }

  public resolve(val: T) {
    this.promiseResolve(val);
  }

  public reject(cause?: unknown) {
    this.promiseReject(cause);
  }
}
