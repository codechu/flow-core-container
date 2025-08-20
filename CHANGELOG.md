# Changelog

All notable changes to @codechu/flow-core-container will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-08-20

### ✨ Initial Release - Pure Abstractions Architecture

### Added
- **Pure TypeScript Interfaces**: 20 comprehensive interfaces for DI/IoC patterns
- **Zero Implementation Logic**: Maximum flexibility for any DI framework
- **Bootstrap Strategy**: Users directed to `@codechu/flow-bootstrap` for ready-to-use implementations
- **Modular Organization**: 6 logical interface groups (container, services, lifecycle, builders, configuration, advanced)
- **Complete Type Safety**: Full TypeScript 5.5+ support with strict mode
- **Interface Compliance**: 16 comprehensive tests validating all contracts

### Core Interfaces
- `IFlowContainer` - Primary DI container contract
- `IFlowScope` - Scoped dependency resolution  
- `IFlowServiceProvider` - Lazy service resolution
- `IFlowServiceLocator` - Service lookup patterns
- `IFlowContainerBuilder` - Fluent configuration
- `IFlowServiceResolver` - Advanced resolution with circular detection
- Full lifecycle, configuration, and advanced interfaces

### Documentation
- Complete architecture diagram showing bootstrap strategy
- Professional README with quick start guide  
- Modular import examples and usage patterns
- Bootstrap package recommendation for easy onboarding

### Quality
- 16 interface compliance tests (100% pass rate)
- TypeScript strict mode compliance
- Node.js 18.x, 20.x, 22.x support
- Zero external dependencies

### Added
- New `IFlowScope` interface for scoped dependency resolution
- Modular architecture with 6 logical module groups:
  - `src/interfaces/container/` - Core container and scope interfaces
  - `src/interfaces/services/` - Service provider, locator, and registry
  - `src/interfaces/lifecycle/` - Disposable and lifecycle hooks
  - `src/interfaces/builders/` - Container builder, injectable, and modules
  - `src/interfaces/configuration/` - Configuration and events
  - `src/interfaces/advanced/` - Advanced container and service resolver
- Enhanced type system with better developer experience
- Organized imports with modular index files

### Changed
- **BREAKING**: Restructured from single file to modular architecture
- Enhanced test coverage to 20 tests across 16 suites
- Improved documentation with modular structure guide
- Better developer experience with organized imports

### Performance
- No performance impact from modular restructure
- Maintained zero-logic pure abstractions approach
- Tree-shaking friendly modular exports

## [1.0.0] - 2025-01-20

### Added
- Initial release with pure container abstractions
- Core container interface (`IFlowContainer`) with optional disposal
- Service registry and resolver interfaces
- Service provider and locator patterns
- Injectable service interface with dependencies
- Container builder with fluent API
- Container modules for grouping services
- Service lifecycle hooks
- Disposable patterns (`IFlowDisposable`, `IFlowAsyncDisposable`)
- Symbol.asyncDispose support for modern resource management
- Circular dependency detection
- Auto-wiring configuration
- Type-safe service tokens
- Comprehensive test suite (15 tests, 12 suites)
- Full TypeScript support with strict mode
- Professional documentation