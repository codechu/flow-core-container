/**
 * @fileoverview Tests for Flow Core Container interfaces
 * 
 * These tests verify interface compliance and type safety, not implementation logic.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import type {
  IFlowContainer,
  IFlowScope,
  IFlowServiceMetadata,
  IFlowServiceRegistration,
  IFlowServiceProvider,
  IFlowServiceLocator,
  IFlowServiceLifecycle,
  IFlowInjectable,
  IFlowServiceResolver,
  IFlowContainerConfig,
  IFlowServiceRegistry,
  IFlowContainerBuilder,
  IFlowContainerModule,
  IFlowAdvancedContainer,
  IFlowDisposable,
  IFlowAsyncDisposable,
  FlowServiceFactory,
  ServiceToken,
  InferServiceType
} from '../dist/index.js';

import {
  SimpleContainer,
  ContainerBuilder,
  createToken,
  createStringToken,
  createUniqueToken,
  TokenRegistry
} from '../dist/index.js';
import type { IFlowContext, FlowResult } from '@codechu/flow-core-seed';
import { success, failure, flowError } from '@codechu/flow-core-seed';

// Test implementations for interface compliance

class TestContainer implements IFlowContainer {
  private services = new Map<string | symbol, FlowServiceFactory<unknown>>();
  private metadata = new Map<string | symbol, IFlowServiceMetadata>();
  
  register<T>(
    token: string | symbol,
    factory: FlowServiceFactory<T>,
    metadata?: Partial<IFlowServiceMetadata>
  ): void {
    this.services.set(token, factory as FlowServiceFactory<unknown>);
    this.metadata.set(token, {
      token,
      scope: metadata?.scope || 'singleton',
      tags: metadata?.tags,
      metadata: metadata?.metadata
    });
  }
  
  async resolve<T>(token: string | symbol): Promise<T> {
    const factory = this.services.get(token);
    if (!factory) throw new Error(`Service ${String(token)} not found`);
    return factory(this) as T;
  }
  
  has(token: string | symbol): boolean {
    return this.services.has(token);
  }
  
  createScope(): IFlowContainer {
    return new TestContainer();
  }
  
  getTokens(): ReadonlyArray<string | symbol> {
    return Array.from(this.services.keys());
  }
}

class TestServiceProvider<T> implements IFlowServiceProvider<T> {
  readonly token: string | symbol;
  private value?: T;
  private resolved = false;
  private factory: () => Promise<T>;
  
  constructor(token: string | symbol, factory: () => Promise<T>) {
    this.token = token;
    this.factory = factory;
  }
  
  async get(): Promise<T> {
    if (!this.resolved) {
      this.value = await this.factory();
      this.resolved = true;
    }
    return this.value!;
  }
  
  getSync(): T | undefined {
    return this.value;
  }
  
  isResolved(): boolean {
    return this.resolved;
  }
}

class TestServiceLocator implements IFlowServiceLocator {
  private services = new Map<string | symbol, unknown>();
  private tags = new Map<string, unknown[]>();
  
  get<T>(token: string | symbol): T {
    const service = this.services.get(token);
    if (!service) throw new Error(`Service ${String(token)} not found`);
    return service as T;
  }
  
  async getAsync<T>(token: string | symbol): Promise<T> {
    return this.get<T>(token);
  }
  
  getByTag<T>(tag: string): ReadonlyArray<T> {
    return (this.tags.get(tag) || []) as T[];
  }
  
  tryGet<T>(token: string | symbol): T | undefined {
    return this.services.get(token) as T | undefined;
  }
}

class TestLifecycleService implements IFlowServiceLifecycle {
  initCalled = false;
  destroyCalled = false;
  
  async onInit(): Promise<void> {
    this.initCalled = true;
  }
  
  async onDestroy(): Promise<void> {
    this.destroyCalled = true;
  }
}

class TestInjectable implements IFlowInjectable<TestService> {
  readonly token = 'TestService';
  readonly dependencies = ['Logger', 'Config'];
  readonly optional = ['Metrics'];
  
  async create(deps: Record<string | symbol, unknown>): Promise<TestService> {
    return new TestService(deps['Logger'], deps['Config']);
  }
}

class TestService {
  public logger: unknown;
  public config: unknown;
  
  constructor(logger: unknown, config: unknown) {
    this.logger = logger;
    this.config = config;
  }
}

class TestServiceResolver implements IFlowServiceResolver {
  async resolveWithCircularCheck<T>(
    token: string | symbol,
    chain?: ReadonlyArray<string | symbol>
  ): Promise<FlowResult<T>> {
    if (chain?.includes(token)) {
      return failure(flowError('CIRCULAR_DEPENDENCY', `Circular dependency detected: ${String(token)}`));
    }
    return success({} as T);
  }
  
  async resolvePattern<T>(pattern: RegExp | ((token: string | symbol) => boolean)): Promise<ReadonlyArray<T>> {
    return [];
  }
  
  async resolveWithFallback<T>(
    token: string | symbol,
    fallback: T | FlowServiceFactory<T>
  ): Promise<T> {
    if (typeof fallback === 'function') {
      const container = new TestContainer();
      return await (fallback as FlowServiceFactory<T>)(container);
    }
    return fallback as T;
  }
}

class TestContainerBuilder implements IFlowContainerBuilder {
  private registrations: Array<{ token: string | symbol; factory: FlowServiceFactory<unknown>; scope: string }> = [];
  
  singleton<T>(token: string | symbol, factory: FlowServiceFactory<T>): IFlowContainerBuilder {
    this.registrations.push({ token, factory: factory as FlowServiceFactory<unknown>, scope: 'singleton' });
    return this;
  }
  
  transient<T>(token: string | symbol, factory: FlowServiceFactory<T>): IFlowContainerBuilder {
    this.registrations.push({ token, factory: factory as FlowServiceFactory<unknown>, scope: 'transient' });
    return this;
  }
  
  scoped<T>(token: string | symbol, factory: FlowServiceFactory<T>): IFlowContainerBuilder {
    this.registrations.push({ token, factory: factory as FlowServiceFactory<unknown>, scope: 'scoped' });
    return this;
  }
  
  autoWire(config: any): IFlowContainerBuilder {
    return this;
  }
  
  useModule(module: IFlowContainerModule): IFlowContainerBuilder {
    module.configure(this);
    return this;
  }
  
  build(): IFlowContainer {
    const container = new TestContainer();
    for (const reg of this.registrations) {
      container.register(reg.token, reg.factory, { scope: reg.scope as any });
    }
    return container;
  }
}

class TestModule implements IFlowContainerModule {
  readonly name = 'TestModule';
  readonly version = '1.0.0';
  
  configure(builder: IFlowContainerBuilder): void {
    builder.singleton('ModuleService', async () => ({ name: 'module-service' }));
  }
}

// Mock context for testing
function createMockContext(): IFlowContext {
  return {
    data: new Map(),
    emit: async () => {},
    logger: {
      info: () => {},
      error: () => {},
      debug: () => {},
      warn: () => {}
    }
  };
}

describe('Flow Core Container Interfaces', () => {
  describe('IFlowContainer', () => {
    it('should implement basic container interface', async () => {
      const container = new TestContainer();
      
      // Register a service
      container.register('TestService', async () => ({ name: 'test' }), {
        scope: 'singleton',
        tags: ['test']
      });
      
      assert.strictEqual(container.has('TestService'), true);
      assert.strictEqual(container.has('NonExistent'), false);
      
      const service = await container.resolve<{ name: string }>('TestService');
      assert.strictEqual(service.name, 'test');
      
      const tokens = container.getTokens();
      assert.strictEqual(tokens.length, 1);
      assert.strictEqual(tokens[0], 'TestService');
      
      const scope = container.createScope();
      assert.ok(scope instanceof TestContainer);
    });

    it('should support disposable pattern', async () => {
      const container = new TestContainer();
      
      // Container should optionally be disposable
      if (container.dispose) {
        assert.strictEqual(typeof container.dispose, 'function');
      }
      
      if (container.isDisposed !== undefined) {
        assert.strictEqual(typeof container.isDisposed, 'boolean');
      }
    });
  });

  describe('IFlowServiceProvider', () => {
    it('should implement lazy service provider', async () => {
      let created = false;
      const provider = new TestServiceProvider('LazyService', async () => {
        created = true;
        return { name: 'lazy' };
      });
      
      assert.strictEqual(provider.token, 'LazyService');
      assert.strictEqual(provider.isResolved(), false);
      assert.strictEqual(provider.getSync(), undefined);
      assert.strictEqual(created, false);
      
      const service = await provider.get();
      assert.strictEqual(service.name, 'lazy');
      assert.strictEqual(created, true);
      assert.strictEqual(provider.isResolved(), true);
      assert.deepStrictEqual(provider.getSync(), { name: 'lazy' });
      
      // Second call should return cached value
      const service2 = await provider.get();
      assert.strictEqual(service, service2);
    });
  });

  describe('IFlowServiceLocator', () => {
    it('should implement service locator pattern', () => {
      const locator = new TestServiceLocator();
      const logger = { log: () => {} };
      
      // Add service manually for testing
      (locator as any).services.set('Logger', logger);
      
      assert.strictEqual(locator.get('Logger'), logger);
      assert.strictEqual(locator.tryGet('Logger'), logger);
      assert.strictEqual(locator.tryGet('NonExistent'), undefined);
      
      assert.throws(() => locator.get('NonExistent'), /not found/);
    });
  });

  describe('IFlowServiceLifecycle', () => {
    it('should implement lifecycle hooks', async () => {
      const service = new TestLifecycleService();
      
      assert.strictEqual(service.initCalled, false);
      assert.strictEqual(service.destroyCalled, false);
      
      await service.onInit();
      assert.strictEqual(service.initCalled, true);
      
      await service.onDestroy();
      assert.strictEqual(service.destroyCalled, true);
    });
  });

  describe('IFlowInjectable', () => {
    it('should implement injectable interface', async () => {
      const injectable = new TestInjectable();
      
      assert.strictEqual(injectable.token, 'TestService');
      assert.deepStrictEqual(injectable.dependencies, ['Logger', 'Config']);
      assert.deepStrictEqual(injectable.optional, ['Metrics']);
      
      const deps = {
        'Logger': { log: () => {} },
        'Config': { get: () => {} }
      };
      
      const service = await injectable.create(deps);
      assert.ok(service instanceof TestService);
      assert.strictEqual(service.logger, deps['Logger']);
      assert.strictEqual(service.config, deps['Config']);
    });
  });

  describe('IFlowServiceResolver', () => {
    it('should detect circular dependencies', async () => {
      const resolver = new TestServiceResolver();
      
      const result1 = await resolver.resolveWithCircularCheck('ServiceA', []);
      assert.strictEqual(result1.success, true);
      
      const result2 = await resolver.resolveWithCircularCheck('ServiceA', ['ServiceB', 'ServiceA']);
      assert.strictEqual(result2.success, false);
      if (!result2.success) {
        assert.strictEqual(result2.error.code, 'CIRCULAR_DEPENDENCY');
      }
    });
    
    it('should resolve with fallback', async () => {
      const resolver = new TestServiceResolver();
      
      const fallbackValue = { name: 'fallback' };
      const result1 = await resolver.resolveWithFallback('Service', fallbackValue);
      assert.strictEqual(result1, fallbackValue);
      
      const result2 = await resolver.resolveWithFallback('Service', async () => ({ name: 'factory' }));
      assert.deepStrictEqual(result2, { name: 'factory' });
    });
  });

  describe('IFlowContainerBuilder', () => {
    it('should build container with fluent API', async () => {
      const builder = new TestContainerBuilder();
      
      const container = builder
        .singleton('Logger', async () => ({ log: () => {} }))
        .transient('Request', async () => ({ id: Math.random() }))
        .scoped('Session', async () => ({ userId: 'user123' }))
        .build();
      
      assert.ok(container.has('Logger'));
      assert.ok(container.has('Request'));
      assert.ok(container.has('Session'));
      
      const logger = await container.resolve('Logger');
      assert.ok(logger);
    });
    
    it('should use modules', async () => {
      const builder = new TestContainerBuilder();
      const module = new TestModule();
      
      const container = builder.useModule(module).build();
      
      assert.ok(container.has('ModuleService'));
      const service = await container.resolve<{ name: string }>('ModuleService');
      assert.strictEqual(service.name, 'module-service');
    });
  });

  describe('Type Helpers', () => {
    it('should support service tokens with type information', () => {
      // Type-level tests (compilation validates these)
      interface ILogger {
        log(msg: string): void;
      }
      
      const LoggerToken: ServiceToken<ILogger> = Symbol('Logger');
      type LoggerType = InferServiceType<typeof LoggerToken>;
      
      // This would fail compilation if types were wrong
      const logger: LoggerType = {
        log: (msg: string) => {}
      };
      
      assert.ok(logger);
    });
  });

  describe('Container Configuration', () => {
    it('should support configuration options', () => {
      const config: IFlowContainerConfig = {
        enableCircularCheck: true,
        enableAutoWiring: false,
        defaultScope: 'transient',
        context: createMockContext()
      };
      
      assert.strictEqual(config.enableCircularCheck, true);
      assert.strictEqual(config.enableAutoWiring, false);
      assert.strictEqual(config.defaultScope, 'transient');
      assert.ok(config.context);
    });
  });

  describe('Service Metadata', () => {
    it('should support service metadata', () => {
      const metadata: IFlowServiceMetadata = {
        token: 'TestService',
        scope: 'singleton',
        tags: ['core', 'essential'],
        metadata: {
          version: '1.0.0',
          author: 'test'
        }
      };
      
      assert.strictEqual(metadata.token, 'TestService');
      assert.strictEqual(metadata.scope, 'singleton');
      assert.deepStrictEqual(metadata.tags, ['core', 'essential']);
      assert.strictEqual(metadata.metadata?.['version'], '1.0.0');
    });
  });

  describe('Disposable Patterns', () => {
    it('should support IFlowDisposable interface', async () => {
      class DisposableService implements IFlowDisposable {
        isDisposed = false;
        
        async dispose(): Promise<void> {
          this.isDisposed = true;
        }
      }
      
      const service = new DisposableService();
      assert.strictEqual(service.isDisposed, false);
      
      await service.dispose();
      assert.strictEqual(service.isDisposed, true);
    });

    it('should support IFlowAsyncDisposable with Symbol.asyncDispose', async () => {
      class AsyncDisposableService implements IFlowAsyncDisposable {
        isDisposed = false;
        
        async [Symbol.asyncDispose](): Promise<void> {
          this.isDisposed = true;
        }
      }
      
      const service = new AsyncDisposableService();
      assert.strictEqual(service.isDisposed, false);
      
      // Test Symbol.asyncDispose
      await service[Symbol.asyncDispose]();
      assert.strictEqual(service.isDisposed, true);
    });
  });

  describe('SimpleContainer Implementation', () => {
    it('should work as a production-ready container', async () => {
      const container = new SimpleContainer();
      
      // Register services with different scopes
      container.register('Logger', async () => ({ log: vi => console.log(vi) }), { scope: 'singleton' });
      container.register('Request', async () => ({ id: Math.random() }), { scope: 'transient' });
      container.register('Session', async () => ({ userId: 'user123' }), { scope: 'scoped' });
      
      // Resolve services
      const logger1 = await container.resolve('Logger');
      const logger2 = await container.resolve('Logger');
      assert.strictEqual(logger1, logger2); // Singleton
      
      const request1 = await container.resolve('Request');
      const request2 = await container.resolve('Request');
      assert.notStrictEqual(request1, request2); // Transient
      
      // Test scope
      const scope = container.createScope();
      const scopedSession1 = await scope.resolve('Session');
      const scopedSession2 = await scope.resolve('Session');
      assert.strictEqual(scopedSession1, scopedSession2); // Scoped singleton
      
      // Test disposal
      assert.strictEqual(container.isDisposed, false);
      await container.dispose();
      assert.strictEqual(container.isDisposed, true);
    });
  });

  describe('ContainerBuilder Implementation', () => {
    it('should build container with fluent API', async () => {
      const container = ContainerBuilder
        .create()
        .singleton('Logger', async () => ({ log: () => {} }))
        .transient('Request', async () => ({ id: Date.now() }))
        .scoped('Session', async () => ({ userId: 'user' }))
        .build();
      
      assert.ok(container.has('Logger'));
      assert.ok(container.has('Request'));
      assert.ok(container.has('Session'));
      
      const logger = await container.resolve('Logger');
      assert.ok(logger);
    });
  });

  describe('Token Helpers', () => {
    it('should create type-safe tokens', () => {
      interface ITestService {
        test(): string;
      }
      
      const symbolToken = createToken<ITestService>('TestService');
      const stringToken = createStringToken<ITestService>('TestServiceString');
      const uniqueToken = createUniqueToken<ITestService>('UniqueService');
      
      assert.strictEqual(typeof symbolToken, 'symbol');
      assert.strictEqual(typeof stringToken, 'string');
      assert.strictEqual(typeof uniqueToken, 'symbol');
      
      // Symbol.for creates global symbols
      const sameToken = createToken<ITestService>('TestService');
      assert.strictEqual(symbolToken, sameToken);
      
      // Unique tokens are always different
      const anotherUniqueToken = createUniqueToken<ITestService>('UniqueService');
      assert.notStrictEqual(uniqueToken, anotherUniqueToken);
    });
    
    it('should manage token registry', () => {
      const registry = new TokenRegistry();
      
      interface IMyService {
        getName(): string;
      }
      
      const token1 = registry.create<IMyService>('MyService');
      assert.ok(registry.has('MyService'));
      
      const token2 = registry.get<IMyService>('MyService');
      assert.strictEqual(token1, token2);
      
      assert.throws(() => registry.create<IMyService>('MyService'), /already exists/);
      
      const token3 = registry.ensure<IMyService>('AnotherService');
      assert.ok(registry.has('AnotherService'));
      
      assert.strictEqual(registry.size, 2);
      assert.deepStrictEqual(registry.getNames().sort(), ['AnotherService', 'MyService']);
      
      registry.clear();
      assert.strictEqual(registry.size, 0);
    });
  });

  describe('IFlowScope', () => {
    it('should implement scoped dependency resolution interface', () => {
      // Test interface compliance
      const mockScope: IFlowScope = {
        id: Symbol('test-scope'),
        parent: undefined,
        children: [],
        container: {} as IFlowContainer,
        isDisposed: false,
        createChildScope: () => mockScope,
        hasService: (token: string | symbol) => false,
        getService: async <T>(token: string | symbol): Promise<T> => ({} as T),
        clear: async () => {},
        dispose: async () => {}
      };

      assert.strictEqual(typeof mockScope.id, 'symbol');
      assert.strictEqual(mockScope.parent, undefined);
      assert.strictEqual(Array.isArray(mockScope.children), true);
      assert.strictEqual(typeof mockScope.createChildScope, 'function');
      assert.strictEqual(typeof mockScope.hasService, 'function');
      assert.strictEqual(typeof mockScope.getService, 'function');
      assert.strictEqual(typeof mockScope.clear, 'function');
      assert.strictEqual(typeof mockScope.dispose, 'function');
    });
  });
});