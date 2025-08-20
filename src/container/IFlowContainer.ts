import type { IFlowDisposable } from '../lifecycle/IFlowDisposable.js';

/**
 * Service factory function type
 */
export type FlowServiceFactory<T> = (container: IFlowContainer) => T | Promise<T>;

/**
 * Service registration metadata
 */
export interface IFlowServiceMetadata {
  readonly token: string | symbol;
  readonly scope: 'singleton' | 'transient' | 'scoped';
  readonly tags?: ReadonlyArray<string> | undefined;
  readonly metadata?: Readonly<Record<string, unknown>> | undefined;
}

/**
 * Core container interface for dependency injection
 */
export interface IFlowContainer extends Partial<IFlowDisposable> {
  /**
   * Register a service in the container
   */
  register<T>(
    token: string | symbol,
    factory: FlowServiceFactory<T>,
    metadata?: Partial<IFlowServiceMetadata>
  ): void;

  /**
   * Resolve a service from the container
   */
  resolve<T>(token: string | symbol): Promise<T>;

  /**
   * Check if a service is registered
   */
  has(token: string | symbol): boolean;

  /**
   * Create a child container with isolated scope
   */
  createScope(): IFlowContainer;

  /**
   * Get all registered service tokens
   */
  getTokens(): ReadonlyArray<string | symbol>;

  /**
   * Dispose all singleton services and clear registrations
   */
  dispose?(): Promise<void>;
  
  /**
   * Check if container is disposed
   */
  readonly isDisposed?: boolean;
}