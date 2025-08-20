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
} from './container/index.js';

// Service interfaces
export type {
  IFlowServiceProvider,
  IFlowServiceLocator,
  IFlowServiceRegistry,
  IFlowServiceRegistration
} from './services/index.js';

// Lifecycle interfaces
export type {
  IFlowDisposable,
  IFlowAsyncDisposable,
  IFlowServiceLifecycle
} from './lifecycle/index.js';

// Builder interfaces
export type {
  IFlowContainerBuilder,
  IFlowContainerModule,
  IFlowAutoWireConfig,
  IFlowInjectMetadata,
  IFlowInjectable
} from './builders/index.js';

// Configuration interfaces
export type {
  IFlowContainerConfig,
  IFlowContainerEvents
} from './configuration/index.js';

// Advanced interfaces
export type {
  IFlowServiceResolver,
  IFlowAdvancedContainer
} from './advanced/index.js';

// Note: Helper implementations moved to @codechu/flow-bootstrap for unified easy-start experience
// This package maintains pure abstractions only for maximum architectural flexibility