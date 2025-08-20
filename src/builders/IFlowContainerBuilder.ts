import type { IFlowContainer, FlowServiceFactory } from '../container/IFlowContainer.js';

/**
 * Auto-wiring configuration
 */
export interface IFlowAutoWireConfig {
  readonly token: string | symbol;
  readonly targetType?: string;
  readonly inject?: ReadonlyArray<IFlowInjectMetadata>;
  readonly singleton?: boolean;
}

/**
 * Decorator metadata for dependency injection
 */
export interface IFlowInjectMetadata {
  readonly token: string | symbol;
  readonly index?: number;
  readonly optional?: boolean;
  readonly defaultValue?: unknown;
}

/**
 * Container module for grouping related services
 */
export interface IFlowContainerModule {
  readonly name: string;
  readonly version?: string;
  configure(builder: IFlowContainerBuilder): void;
}

/**
 * Container builder for fluent configuration
 */
export interface IFlowContainerBuilder {
  /**
   * Register a singleton service
   */
  singleton<T>(token: string | symbol, factory: FlowServiceFactory<T>): IFlowContainerBuilder;

  /**
   * Register a transient service
   */
  transient<T>(token: string | symbol, factory: FlowServiceFactory<T>): IFlowContainerBuilder;

  /**
   * Register a scoped service
   */
  scoped<T>(token: string | symbol, factory: FlowServiceFactory<T>): IFlowContainerBuilder;

  /**
   * Configure auto-wiring
   */
  autoWire(config: IFlowAutoWireConfig): IFlowContainerBuilder;

  /**
   * Use a module
   */
  useModule(module: IFlowContainerModule): IFlowContainerBuilder;

  /**
   * Build the container
   */
  build(): IFlowContainer;
}