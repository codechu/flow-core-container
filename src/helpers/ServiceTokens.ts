/**
 * Type-safe service token helpers
 * Provides strongly typed tokens for dependency injection
 */

import type { ServiceToken } from '../index.js';

/**
 * Creates a type-safe service token with Symbol
 * @example
 * const LoggerToken = createToken<ILogger>('Logger');
 */
export function createToken<T>(name: string): ServiceToken<T> {
  const token = Symbol.for(name);
  return token as ServiceToken<T>;
}

/**
 * Creates a type-safe string token
 * @example
 * const ConfigToken = createStringToken<IConfig>('IConfig');
 */
export function createStringToken<T>(name: string): ServiceToken<T> {
  return name as ServiceToken<T>;
}

/**
 * Creates a unique token that cannot be duplicated
 * @example
 * const PrivateToken = createUniqueToken<IPrivateService>('PrivateService');
 */
export function createUniqueToken<T>(description?: string): ServiceToken<T> {
  const token = Symbol(description);
  return token as ServiceToken<T>;
}

/**
 * Token registry for managing application-wide tokens
 * Prevents duplicate token creation and provides central registry
 */
export class TokenRegistry {
  private tokens = new Map<string, symbol>();

  /**
   * Get or create a token
   */
  get<T>(name: string): ServiceToken<T> {
    let token = this.tokens.get(name);
    if (!token) {
      token = Symbol.for(name);
      this.tokens.set(name, token);
    }
    return token as ServiceToken<T>;
  }

  /**
   * Create a new token (throws if exists)
   */
  create<T>(name: string): ServiceToken<T> {
    if (this.tokens.has(name)) {
      throw new Error(`Token '${name}' already exists in registry`);
    }
    const token = Symbol.for(name);
    this.tokens.set(name, token);
    return token as ServiceToken<T>;
  }

  /**
   * Create or get existing token
   */
  ensure<T>(name: string): ServiceToken<T> {
    return this.tokens.has(name) ? this.get<T>(name) : this.create<T>(name);
  }

  /**
   * Check if token exists
   */
  has(name: string): boolean {
    return this.tokens.has(name);
  }

  /**
   * Remove a token from registry
   */
  delete(name: string): boolean {
    return this.tokens.delete(name);
  }

  /**
   * Clear all tokens
   */
  clear(): void {
    this.tokens.clear();
  }

  /**
   * Get all registered token names
   */
  getNames(): string[] {
    return Array.from(this.tokens.keys());
  }

  /**
   * Get token count
   */
  get size(): number {
    return this.tokens.size;
  }
}

/**
 * Global token registry instance
 */
export const globalTokenRegistry = new TokenRegistry();

/**
 * Helper to extract type from a service token
 * @example
 * type LoggerType = ExtractTokenType<typeof LoggerToken>;
 */
export type ExtractTokenType<T> = T extends ServiceToken<infer U> ? U : never;