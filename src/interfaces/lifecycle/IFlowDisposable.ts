/**
 * Disposable pattern for resource cleanup
 */
export interface IFlowDisposable {
  dispose(): void | Promise<void>;
  readonly isDisposed: boolean;
}

/**
 * Async disposable pattern (Symbol.asyncDispose support)
 */
export interface IFlowAsyncDisposable {
  [Symbol.asyncDispose](): Promise<void>;
  readonly isDisposed: boolean;
}