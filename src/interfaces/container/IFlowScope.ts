import type { IFlowContainer } from './IFlowContainer.js';
import type { IFlowDisposable } from '../lifecycle/IFlowDisposable.js';

/**
 * Scoped dependency resolution interface
 * Provides isolated service instances within a specific scope
 */
export interface IFlowScope extends IFlowDisposable {
  /**
   * Unique scope identifier
   */
  readonly id: string | symbol;

  /**
   * Parent scope (if any)
   */
  readonly parent?: IFlowScope;

  /**
   * Child scopes created from this scope
   */
  readonly children: ReadonlyArray<IFlowScope>;

  /**
   * Container associated with this scope
   */
  readonly container: IFlowContainer;

  /**
   * Create a child scope
   */
  createChildScope(): IFlowScope;

  /**
   * Check if scope contains a specific service
   */
  hasService(token: string | symbol): boolean;

  /**
   * Get service instance within this scope
   */
  getService<T>(token: string | symbol): Promise<T>;

  /**
   * Clear all services in this scope
   */
  clear(): Promise<void>;

  /**
   * Dispose scope and all child scopes
   */
  dispose(): Promise<void>;
}