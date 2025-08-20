/**
 * Service locator pattern interface
 */
export interface IFlowServiceLocator {
  /**
   * Get a service by token
   */
  get<T>(token: string | symbol): T;

  /**
   * Get a service asynchronously
   */
  getAsync<T>(token: string | symbol): Promise<T>;

  /**
   * Get all services with a specific tag
   */
  getByTag<T>(tag: string): ReadonlyArray<T>;

  /**
   * Try to get a service, return undefined if not found
   */
  tryGet<T>(token: string | symbol): T | undefined;
}