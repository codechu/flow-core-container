/**
 * 🏷️ Flow Core Container - Dependency Injection & Service Location Abstractions
 * 
 * Pure interfaces for IoC container patterns in the Flow ecosystem.
 * Zero implementation, maximum flexibility for any DI framework.
 */

// Re-export all interfaces from their modules

// Container interfaces
export type {
  IFlowContainer,
  IFlowScope,
  FlowServiceFactory,
  IFlowServiceMetadata
} from './interfaces/container/index.js';

// Service interfaces
export type {
  IFlowServiceProvider,
  IFlowServiceLocator,
  IFlowServiceRegistry,
  IFlowServiceRegistration
} from './interfaces/services/index.js';

// Lifecycle interfaces
export type {
  IFlowDisposable,
  IFlowAsyncDisposable,
  IFlowServiceLifecycle
} from './interfaces/lifecycle/index.js';

// Builder interfaces
export type {
  IFlowContainerBuilder,
  IFlowContainerModule,
  IFlowAutoWireConfig,
  IFlowInjectMetadata,
  IFlowInjectable
} from './interfaces/builders/index.js';

// Configuration interfaces
export type {
  IFlowContainerConfig,
  IFlowContainerEvents
} from './interfaces/configuration/index.js';

// Advanced interfaces
export type {
  IFlowServiceResolver,
  IFlowAdvancedContainer
} from './interfaces/advanced/index.js';

// Type helpers
export type {
  ServiceToken,
  InferServiceType,
  ServiceMap,
  ServiceRecord,
  ExtractTokenType
} from './types/index.js';

// Export helper implementations
export { SimpleContainer } from './helpers/SimpleContainer.js';
export { ContainerBuilder } from './helpers/ContainerBuilder.js';
export {
  createToken,
  createStringToken,
  createUniqueToken,
  TokenRegistry,
  globalTokenRegistry
} from './helpers/ServiceTokens.js';