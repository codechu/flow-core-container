# Changelog

All notable changes to @codechu/flow-core-container will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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