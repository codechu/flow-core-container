/**
 * Simple container implementation without external dependencies
 * Production-ready, extensible, and fully functional
 */

import type { 
  IFlowContainer, 
  IFlowServiceMetadata, 
  FlowServiceFactory,
  IFlowDisposable 
} from '../index.js';

interface ServiceEntry {
  factory: FlowServiceFactory<unknown>;
  metadata: IFlowServiceMetadata;
  instance?: unknown;
}

export class SimpleContainer implements IFlowContainer, IFlowDisposable {
  protected services = new Map<string | symbol, ServiceEntry>();
  protected scopes = new Set<SimpleContainer>();
  protected parent: SimpleContainer | undefined;
  protected _isDisposed = false;

  constructor(parent?: SimpleContainer) {
    this.parent = parent;
  }

  register<T>(
    token: string | symbol,
    factory: FlowServiceFactory<T>,
    metadata?: Partial<IFlowServiceMetadata>
  ): void {
    this.validateNotDisposed('register');

    const entry = this.createServiceEntry(token, factory, metadata);
    this.beforeRegister(token, entry);
    this.services.set(token, entry);
    this.afterRegister(token, entry);
  }

  async resolve<T>(token: string | symbol): Promise<T> {
    this.validateNotDisposed('resolve');

    // Hook for custom resolution logic
    const customResolution = await this.tryCustomResolve<T>(token);
    if (customResolution !== undefined) {
      return customResolution;
    }

    // Check current container
    const entry = this.services.get(token);
    if (entry) {
      return this.resolveEntry<T>(token, entry);
    }

    // Check parent container
    if (this.parent) {
      return this.parent.resolve<T>(token);
    }

    // Hook for handling missing services
    return this.handleMissingService<T>(token);
  }

  protected async resolveEntry<T>(token: string | symbol, entry: ServiceEntry): Promise<T> {
    const { metadata } = entry;

    // Hook before resolution
    await this.beforeResolve(token, metadata);

    let instance: T;

    // Handle different scopes
    switch (metadata.scope) {
      case 'singleton':
        instance = await this.resolveSingleton<T>(token, entry);
        break;

      case 'transient':
        instance = await this.resolveTransient<T>(token, entry);
        break;

      case 'scoped':
        instance = await this.resolveScoped<T>(token, entry);
        break;

      default:
        instance = await this.resolveCustomScope<T>(token, entry);
    }

    // Hook after resolution
    await this.afterResolve(token, instance);

    return instance;
  }

  protected async resolveSingleton<T>(token: string | symbol, entry: ServiceEntry): Promise<T> {
    if (!entry.instance) {
      entry.instance = await this.createInstance(entry.factory);
      await this.onSingletonCreated(token, entry.instance);
    }
    return entry.instance as T;
  }

  protected async resolveTransient<T>(token: string | symbol, entry: ServiceEntry): Promise<T> {
    const instance = await this.createInstance(entry.factory);
    await this.onTransientCreated(token, instance);
    return instance as T;
  }

  protected async resolveScoped<T>(token: string | symbol, entry: ServiceEntry): Promise<T> {
    // In a scoped container, scoped services act like singletons
    if (this.parent) {
      if (!entry.instance) {
        entry.instance = await this.createInstance(entry.factory);
        await this.onScopedCreated(token, entry.instance);
      }
      return entry.instance as T;
    }
    // In root container, scoped acts like transient
    return this.resolveTransient<T>(token, entry);
  }

  protected async resolveCustomScope<T>(_token: string | symbol, entry: ServiceEntry): Promise<T> {
    throw new Error(`Unknown scope: ${entry.metadata.scope}`);
  }

  protected async createInstance(factory: FlowServiceFactory<unknown>): Promise<unknown> {
    return await factory(this);
  }

  has(token: string | symbol): boolean {
    if (this.services.has(token)) {
      return true;
    }
    return this.parent?.has(token) || false;
  }

  createScope(): IFlowContainer {
    this.validateNotDisposed('createScope');

    const scope = this.createScopeInstance();
    this.scopes.add(scope);
    
    // Copy service registrations to scope
    this.copyServicesToScope(scope);

    this.onScopeCreated(scope);
    
    return scope;
  }

  protected createScopeInstance(): SimpleContainer {
    return new SimpleContainer(this);
  }

  protected copyServicesToScope(scope: SimpleContainer): void {
    for (const [token, entry] of this.services) {
      if (this.shouldCopyToScope(entry)) {
        scope.services.set(token, {
          factory: entry.factory,
          metadata: { ...entry.metadata }
        });
      }
    }
  }

  protected shouldCopyToScope(entry: ServiceEntry): boolean {
    // Singletons are resolved from parent, others are copied
    return entry.metadata.scope !== 'singleton';
  }

  getTokens(): ReadonlyArray<string | symbol> {
    const tokens = new Set<string | symbol>(this.services.keys());
    if (this.parent) {
      for (const token of this.parent.getTokens()) {
        tokens.add(token);
      }
    }
    return Array.from(tokens);
  }

  async dispose(): Promise<void> {
    if (this._isDisposed) {
      return;
    }

    await this.beforeDispose();

    // Dispose all scopes first
    for (const scope of this.scopes) {
      await scope.dispose();
    }
    this.scopes.clear();

    // Dispose singleton instances
    await this.disposeServices();

    this.services.clear();
    this._isDisposed = true;

    await this.afterDispose();
  }

  protected async disposeServices(): Promise<void> {
    for (const [token, entry] of this.services) {
      if (entry.instance) {
        await this.disposeService(token, entry.instance);
      }
    }
  }

  protected async disposeService(_token: string | symbol, instance: unknown): Promise<void> {
    if (this.isDisposable(instance)) {
      await instance.dispose();
    }
  }

  get isDisposed(): boolean {
    return this._isDisposed;
  }

  // Helper methods

  protected isDisposable(obj: unknown): obj is IFlowDisposable {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'dispose' in obj &&
      typeof (obj as any).dispose === 'function'
    );
  }

  protected createServiceEntry(
    token: string | symbol,
    factory: FlowServiceFactory<unknown>,
    metadata?: Partial<IFlowServiceMetadata>
  ): ServiceEntry {
    return {
      factory,
      metadata: {
        token,
        scope: metadata?.scope || this.getDefaultScope(),
        tags: metadata?.tags || undefined,
        metadata: metadata?.metadata || undefined
      }
    };
  }

  protected getDefaultScope(): 'singleton' | 'transient' | 'scoped' {
    return 'singleton';
  }

  protected validateNotDisposed(operation: string): void {
    if (this._isDisposed) {
      throw new Error(`Cannot ${operation} on disposed container`);
    }
  }

  // Extension hooks - Override these in derived classes

  protected beforeRegister(_token: string | symbol, _entry: ServiceEntry): void {
    // Override in derived class
  }

  protected afterRegister(_token: string | symbol, _entry: ServiceEntry): void {
    // Override in derived class
  }

  protected async tryCustomResolve<T>(_token: string | symbol): Promise<T | undefined> {
    // Override for custom resolution logic
    return undefined;
  }

  protected async beforeResolve(_token: string | symbol, _metadata: IFlowServiceMetadata): Promise<void> {
    // Override in derived class
  }

  protected async afterResolve(_token: string | symbol, _instance: unknown): Promise<void> {
    // Override in derived class
  }

  protected async handleMissingService<T>(token: string | symbol): Promise<T> {
    throw new Error(`Service '${String(token)}' not registered`);
  }

  protected async onSingletonCreated(_token: string | symbol, _instance: unknown): Promise<void> {
    // Override in derived class
  }

  protected async onTransientCreated(_token: string | symbol, _instance: unknown): Promise<void> {
    // Override in derived class
  }

  protected async onScopedCreated(_token: string | symbol, _instance: unknown): Promise<void> {
    // Override in derived class
  }

  protected onScopeCreated(_scope: SimpleContainer): void {
    // Override in derived class
  }

  protected async beforeDispose(): Promise<void> {
    // Override in derived class
  }

  protected async afterDispose(): Promise<void> {
    // Override in derived class
  }
}