import type { IFlowServiceMetadata, FlowServiceFactory } from '../container/IFlowContainer.js';

/**
 * Service registration interface
 */
export interface IFlowServiceRegistration<T = unknown> {
  readonly token: string | symbol;
  readonly factory: FlowServiceFactory<T>;
  readonly metadata: IFlowServiceMetadata;
}

/**
 * Service registry for managing registrations
 */
export interface IFlowServiceRegistry {
  /**
   * Unregister a service
   */
  unregister(token: string | symbol): boolean;

  /**
   * Get registration metadata
   */
  getRegistration(token: string | symbol): IFlowServiceRegistration | undefined;

  /**
   * Get all registrations
   */
  getAllRegistrations(): ReadonlyArray<IFlowServiceRegistration>;

  /**
   * Clear all registrations
   */
  clear(): void;
}