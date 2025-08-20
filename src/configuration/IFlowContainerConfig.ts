import type { IFlowContainer } from '../container/IFlowContainer.js';
import type { IFlowContext } from '@codechu/flow-core-seed';

/**
 * Container configuration interface
 */
export interface IFlowContainerConfig {
  readonly enableCircularCheck?: boolean;
  readonly enableAutoWiring?: boolean;
  readonly defaultScope?: 'singleton' | 'transient' | 'scoped';
  readonly parent?: IFlowContainer;
  readonly context?: IFlowContext;
}