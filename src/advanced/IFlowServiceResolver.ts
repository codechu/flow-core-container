import type { FlowResult } from '@codechu/flow-core-seed';
import type { FlowServiceFactory } from '../container/IFlowContainer.js';

/**
 * Service resolver with advanced features
 */
export interface IFlowServiceResolver {
  /**
   * Resolve with circular dependency detection
   */
  resolveWithCircularCheck<T>(
    token: string | symbol,
    chain?: ReadonlyArray<string | symbol>
  ): Promise<FlowResult<T>>;

  /**
   * Resolve all services matching a pattern
   */
  resolvePattern<T>(pattern: RegExp | ((token: string | symbol) => boolean)): Promise<ReadonlyArray<T>>;

  /**
   * Resolve with fallback
   */
  resolveWithFallback<T>(
    token: string | symbol,
    fallback: T | FlowServiceFactory<T>
  ): Promise<T>;
}