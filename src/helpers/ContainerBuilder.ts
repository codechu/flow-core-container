/**
 * Fluent container builder implementation
 * Provides a clean API for configuring containers
 */

import type {
  IFlowContainerBuilder,
  IFlowContainer,
  IFlowContainerModule,
  IFlowAutoWireConfig,
  FlowServiceFactory
} from '../index.js';
import { SimpleContainer } from './SimpleContainer.js';

interface BuilderRegistration {
  token: string | symbol;
  factory: FlowServiceFactory<unknown>;
  scope: 'singleton' | 'transient' | 'scoped';
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export class ContainerBuilder implements IFlowContainerBuilder {
  protected registrations: BuilderRegistration[] = [];
  protected modules: IFlowContainerModule[] = [];
  protected autoWireConfigs: IFlowAutoWireConfig[] = [];
  protected containerFactory?: () => IFlowContainer;

  singleton<T>(token: string | symbol, factory: FlowServiceFactory<T>): IFlowContainerBuilder {
    return this.addRegistration(token, factory, 'singleton');
  }

  transient<T>(token: string | symbol, factory: FlowServiceFactory<T>): IFlowContainerBuilder {
    return this.addRegistration(token, factory, 'transient');
  }

  scoped<T>(token: string | symbol, factory: FlowServiceFactory<T>): IFlowContainerBuilder {
    return this.addRegistration(token, factory, 'scoped');
  }

  protected addRegistration<T>(
    token: string | symbol,
    factory: FlowServiceFactory<T>,
    scope: 'singleton' | 'transient' | 'scoped'
  ): IFlowContainerBuilder {
    this.registrations.push({
      token,
      factory: factory as FlowServiceFactory<unknown>,
      scope
    });
    return this;
  }

  withTags(token: string | symbol, tags: string[]): IFlowContainerBuilder {
    const registration = this.findRegistration(token);
    if (registration) {
      registration.tags = tags;
    }
    return this;
  }

  withMetadata(token: string | symbol, metadata: Record<string, unknown>): IFlowContainerBuilder {
    const registration = this.findRegistration(token);
    if (registration) {
      registration.metadata = metadata;
    }
    return this;
  }

  autoWire(config: IFlowAutoWireConfig): IFlowContainerBuilder {
    this.autoWireConfigs.push(config);
    return this;
  }

  useModule(module: IFlowContainerModule): IFlowContainerBuilder {
    this.modules.push(module);
    return this;
  }

  useContainer(factory: () => IFlowContainer): IFlowContainerBuilder {
    this.containerFactory = factory;
    return this;
  }

  build(): IFlowContainer {
    const container = this.createContainer();

    // Apply direct registrations
    this.applyRegistrations(container);

    // Apply modules
    this.applyModules(container);

    // Apply auto-wiring
    this.applyAutoWiring(container);

    // Final configuration
    this.configureContainer(container);

    return container;
  }

  protected createContainer(): IFlowContainer {
    if (this.containerFactory) {
      return this.containerFactory();
    }
    return new SimpleContainer();
  }

  protected applyRegistrations(container: IFlowContainer): void {
    for (const registration of this.registrations) {
      container.register(
        registration.token,
        registration.factory,
        {
          scope: registration.scope,
          tags: registration.tags || undefined,
          metadata: registration.metadata || undefined
        }
      );
    }
  }

  protected applyModules(container: IFlowContainer): void {
    for (const module of this.modules) {
      // Create a temporary builder for the module
      const moduleBuilder = new ModuleBuilderProxy(container);
      module.configure(moduleBuilder);
    }
  }

  protected applyAutoWiring(container: IFlowContainer): void {
    // Auto-wiring implementation would go here
    // This is a placeholder for now
    for (const config of this.autoWireConfigs) {
      this.configureAutoWire(container, config);
    }
  }

  protected configureAutoWire(_container: IFlowContainer, _config: IFlowAutoWireConfig): void {
    // Override in derived class for custom auto-wiring logic
  }

  protected configureContainer(_container: IFlowContainer): void {
    // Override in derived class for final configuration
  }

  protected findRegistration(token: string | symbol): BuilderRegistration | undefined {
    return this.registrations.find(r => r.token === token);
  }

  // Factory method for creating builders
  static create(): ContainerBuilder {
    return new ContainerBuilder();
  }
}

/**
 * Proxy builder for modules that directly registers to container
 */
class ModuleBuilderProxy implements IFlowContainerBuilder {
  constructor(private container: IFlowContainer) {}

  singleton<T>(token: string | symbol, factory: FlowServiceFactory<T>): IFlowContainerBuilder {
    this.container.register(token, factory, { scope: 'singleton' });
    return this;
  }

  transient<T>(token: string | symbol, factory: FlowServiceFactory<T>): IFlowContainerBuilder {
    this.container.register(token, factory, { scope: 'transient' });
    return this;
  }

  scoped<T>(token: string | symbol, factory: FlowServiceFactory<T>): IFlowContainerBuilder {
    this.container.register(token, factory, { scope: 'scoped' });
    return this;
  }

  autoWire(_config: IFlowAutoWireConfig): IFlowContainerBuilder {
    // Auto-wiring in module context
    return this;
  }

  useModule(module: IFlowContainerModule): IFlowContainerBuilder {
    module.configure(this);
    return this;
  }

  build(): IFlowContainer {
    return this.container;
  }
}