/**
 * Type helpers for container usage
 */
export type ServiceToken<T> = string | symbol | { readonly token: string | symbol; readonly __type?: T };

export type InferServiceType<T> = T extends ServiceToken<infer U> ? U : unknown;

export type ServiceMap = Map<string | symbol, unknown>;

export type ServiceRecord = Record<string | symbol, unknown>;

export type ExtractTokenType<T> = T extends ServiceToken<infer U> ? U : never;