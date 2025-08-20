import type { IFlowContainer } from '../container/IFlowContainer.js';
import type { IFlowServiceMetadata } from '../container/IFlowContainer.js';

/**
 * Container events
 */
export interface IFlowContainerEvents {
  onServiceRegistered?: (token: string | symbol, metadata: IFlowServiceMetadata) => void;
  onServiceResolved?: (token: string | symbol, instance: unknown) => void;
  onServiceCreated?: (token: string | symbol, instance: unknown) => void;
  onServiceDestroyed?: (token: string | symbol, instance: unknown) => void;
  onScopeCreated?: (scope: IFlowContainer) => void;
  onScopeDestroyed?: (scope: IFlowContainer) => void;
}