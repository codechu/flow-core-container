/**
 * 🏷️ Flow Core Container - Dependency Injection & Service Location Abstractions
 * 
 * Pure interfaces for IoC container patterns in the Flow ecosystem.
 * Zero implementation, maximum flexibility for any DI framework.
 */

import type { IFlowContext, FlowResult } from '@codechu/flow-core-seed';

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
 * Service factory function type
 */
export type FlowServiceFactory<T> = (container: IFlowContainer) => T | Promise<T>;

/**
 * Service registration interface
 */
export interface IFlowServiceRegistration<T = unknown> {
  readonly token: string | symbol;
  readonly factory: FlowServiceFactory<T>;
  readonly metadata: IFlowServiceMetadata;
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

/**
 * Service provider interface for lazy resolution
 */
export interface IFlowServiceProvider<T> {
  readonly token: string | symbol;
  get(): Promise<T>;
  getSync(): T | undefined;
  isResolved(): boolean;
}

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

/**
 * Disposable pattern for resource cleanup
 */
export interface IFlowDisposable {
  dispose(): void | Promise<void>;
  readonly isDisposed: boolean;
}

/**
 * Async disposable pattern (Symbol.asyncDispose support)
 */
export interface IFlowAsyncDisposable {
  [Symbol.asyncDispose](): Promise<void>;
  readonly isDisposed: boolean;
}

/**
 * Service lifecycle hooks
 */
export interface IFlowServiceLifecycle extends Partial<IFlowDisposable> {
  onInit?(): void | Promise<void>;
  onDestroy?(): void | Promise<void>;
  onScopeCreated?(scope: IFlowContainer): void | Promise<void>;
  onScopeDestroyed?(scope: IFlowContainer): void | Promise<void>;
}

/**
 * Injectable service interface
 */
export interface IFlowInjectable<T = unknown> {
  readonly token: string | symbol;
  readonly dependencies?: ReadonlyArray<string | symbol>;
  readonly optional?: ReadonlyArray<string | symbol>;
  create(deps: Record<string | symbol, unknown>): T | Promise<T>;
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

/**
 * Container module for grouping related services
 */
export interface IFlowContainerModule {
  readonly name: string;
  readonly version?: string;
  configure(builder: IFlowContainerBuilder): void;
}

/**
 * Type helpers for container usage
 */
export type ServiceToken<T> = string | symbol | { readonly token: string | symbol; readonly __type?: T };

export type InferServiceType<T> = T extends ServiceToken<infer U> ? U : unknown;

export type ServiceMap = Map<string | symbol, unknown>;

export type ServiceRecord = Record<string | symbol, unknown>;

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

/**
 * Advanced container with full features
 */
export interface IFlowAdvancedContainer extends IFlowContainer, IFlowServiceResolver, IFlowServiceRegistry {
  readonly config: IFlowContainerConfig;
  readonly events: IFlowContainerEvents;
  readonly parent?: IFlowAdvancedContainer;
  readonly children: ReadonlyArray<IFlowAdvancedContainer>;
}

// Export helpers and implementations
export { SimpleContainer } from './helpers/SimpleContainer.js';
export { ContainerBuilder } from './helpers/ContainerBuilder.js';
export {
  createToken,
  createStringToken,
  createUniqueToken,
  TokenRegistry,
  globalTokenRegistry,
  type ExtractTokenType
} from './helpers/ServiceTokens.js';