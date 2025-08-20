/**
 * Service provider interface for lazy resolution
 */
export interface IFlowServiceProvider<T> {
  readonly token: string | symbol;
  get(): Promise<T>;
  getSync(): T | undefined;
  isResolved(): boolean;
}