import type { IFlowContainer } from '../container/IFlowContainer.js';
import type { IFlowServiceResolver } from './IFlowServiceResolver.js';
import type { IFlowServiceRegistry } from '../services/IFlowServiceRegistry.js';
import type { IFlowContainerConfig } from '../configuration/IFlowContainerConfig.js';
import type { IFlowContainerEvents } from '../configuration/IFlowContainerEvents.js';

/**
 * Advanced container with full features
 */
export interface IFlowAdvancedContainer extends IFlowContainer, IFlowServiceResolver, IFlowServiceRegistry {
  readonly config: IFlowContainerConfig;
  readonly events: IFlowContainerEvents;
  readonly parent?: IFlowAdvancedContainer;
  readonly children: ReadonlyArray<IFlowAdvancedContainer>;
}