/**
 * Injectable service interface
 */
export interface IFlowInjectable<T = unknown> {
  readonly token: string | symbol;
  readonly dependencies?: ReadonlyArray<string | symbol>;
  readonly optional?: ReadonlyArray<string | symbol>;
  create(deps: Record<string | symbol, unknown>): T | Promise<T>;
}