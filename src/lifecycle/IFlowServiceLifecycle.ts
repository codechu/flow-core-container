import type { IFlowDisposable } from './IFlowDisposable.js';
import type { IFlowContainer } from '../container/IFlowContainer.js';

/**
 * Service lifecycle hooks
 */
export interface IFlowServiceLifecycle extends Partial<IFlowDisposable> {
  onInit?(): void | Promise<void>;
  onDestroy?(): void | Promise<void>;
  onScopeCreated?(scope: IFlowContainer): void | Promise<void>;
  onScopeDestroyed?(scope: IFlowContainer): void | Promise<void>;
}