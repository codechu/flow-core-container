```
███████╗██╗      ██████╗ ██╗    ██╗
██╔════╝██║     ██╔═══██╗██║    ██║
█████╗  ██║     ██║   ██║██║ █╗ ██║
██╔══╝  ██║     ██║   ██║██║███╗██║
██║     ███████╗╚██████╔╝╚███╔███╔╝
╚═╝     ╚══════╝ ╚═════╝  ╚══╝╚══╝ 
     CORE CONTAINER 🏷️
```

# 🏷️ Flow Core Container

[![NPM Version](https://img.shields.io/npm/v/@codechu/flow-core-container)](https://www.npmjs.com/package/@codechu/flow-core-container)
[![License](https://img.shields.io/npm/l/@codechu/flow-core-container)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)

**Pure dependency injection and service location abstractions for the Flow ecosystem**

## 📦 Installation

```bash
npm install @codechu/flow-core-container
```

## 🎯 Purpose

Flow Core Container provides pure TypeScript interfaces for dependency injection and service location patterns with **zero implementation logic**. Build any IoC container implementation while maintaining complete type safety.

## 🔧 Core Interfaces

### Container & Registry
- `IFlowContainer` - Core dependency injection container
- `IFlowServiceRegistry` - Service registration management
- `IFlowServiceResolver` - Advanced resolution with circular detection
- `IFlowAdvancedContainer` - Full-featured container combining all capabilities

### Service Management
- `IFlowServiceProvider<T>` - Lazy service resolution
- `IFlowServiceLocator` - Service locator pattern
- `IFlowServiceLifecycle` - Service lifecycle hooks
- `IFlowInjectable<T>` - Self-describing injectable services

### Configuration
- `IFlowContainerBuilder` - Fluent container configuration
- `IFlowContainerModule` - Modular service registration
- `IFlowContainerConfig` - Container behavior configuration
- `IFlowAutoWireConfig` - Auto-wiring configuration

### Resource Management
- `IFlowDisposable` - Standard disposal pattern
- `IFlowAsyncDisposable` - Async disposal with Symbol.asyncDispose

## 💡 Usage Examples

### Basic Container Usage

```typescript
import type { 
  IFlowContainer, 
  IFlowServiceMetadata,
  FlowServiceFactory 
} from '@codechu/flow-core-container';

// Your container implementation
class MyContainer implements IFlowContainer {
  register<T>(
    token: string | symbol,
    factory: FlowServiceFactory<T>,
    metadata?: Partial<IFlowServiceMetadata>
  ): void {
    // Implementation
  }
  
  async resolve<T>(token: string | symbol): Promise<T> {
    // Implementation
  }
  
  has(token: string | symbol): boolean {
    // Implementation
  }
  
  createScope(): IFlowContainer {
    // Implementation
  }
  
  getTokens(): ReadonlyArray<string | symbol> {
    // Implementation
  }
}
```

### Service Provider Pattern

```typescript
import type { IFlowServiceProvider } from '@codechu/flow-core-container';

class LazyProvider<T> implements IFlowServiceProvider<T> {
  readonly token: string | symbol;
  
  async get(): Promise<T> {
    // Lazy resolution
  }
  
  getSync(): T | undefined {
    // Synchronous access if resolved
  }
  
  isResolved(): boolean {
    // Check resolution status
  }
}
```

### Fluent Container Builder

```typescript
import type { 
  IFlowContainerBuilder,
  IFlowContainerModule 
} from '@codechu/flow-core-container';

const container = builder
  .singleton('Logger', async () => new ConsoleLogger())
  .transient('Request', async () => new Request())
  .scoped('Session', async () => new Session())
  .useModule(new DatabaseModule())
  .useModule(new CacheModule())
  .build();
```

### Injectable Services

```typescript
import type { IFlowInjectable } from '@codechu/flow-core-container';

class UserService implements IFlowInjectable<IUserService> {
  readonly token = 'UserService';
  readonly dependencies = ['Database', 'Logger'];
  readonly optional = ['Cache'];
  
  async create(deps: Record<string | symbol, unknown>): Promise<IUserService> {
    return new UserServiceImpl(
      deps['Database'] as IDatabase,
      deps['Logger'] as ILogger,
      deps['Cache'] as ICache | undefined
    );
  }
}
```

### Circular Dependency Detection

```typescript
import type { IFlowServiceResolver } from '@codechu/flow-core-container';

const resolver: IFlowServiceResolver = getResolver();

const result = await resolver.resolveWithCircularCheck('ServiceA', ['ServiceB', 'ServiceC']);
if (!result.success) {
  console.error('Circular dependency detected:', result.error.message);
}
```

### Disposable Services

```typescript
import type { IFlowDisposable, IFlowAsyncDisposable } from '@codechu/flow-core-container';

// Standard disposal
class DatabaseConnection implements IFlowDisposable {
  isDisposed = false;
  
  async dispose(): Promise<void> {
    await this.closeConnection();
    this.isDisposed = true;
  }
}

// Modern async disposal
class ResourceManager implements IFlowAsyncDisposable {
  isDisposed = false;
  
  async [Symbol.asyncDispose](): Promise<void> {
    await this.cleanup();
    this.isDisposed = true;
  }
}

// Usage with using statement (TC39 proposal)
{
  await using resource = new ResourceManager();
  // Resource automatically disposed when scope ends
}
```

## 🏗️ Service Scopes

- **Singleton** - Single instance per container
- **Transient** - New instance per resolution
- **Scoped** - Single instance per scope/request

## 🎨 Type Helpers

```typescript
import type { ServiceToken, InferServiceType } from '@codechu/flow-core-container';

// Strongly typed tokens
const LoggerToken: ServiceToken<ILogger> = Symbol('Logger');
type LoggerType = InferServiceType<typeof LoggerToken>; // ILogger

// Use with container
const logger = await container.resolve<LoggerType>(LoggerToken);
```

## 🔌 Integration

Works with any DI container library:
- InversifyJS
- TSyringe  
- Awilix
- Custom implementations

## 📄 License

MIT © Codechu