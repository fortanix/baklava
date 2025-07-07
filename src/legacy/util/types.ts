
export const isPromise = (value: unknown): value is PromiseLike<unknown> => {
  return typeof value === 'object' && value !== null && typeof (value as any).then === 'function';
};

export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
