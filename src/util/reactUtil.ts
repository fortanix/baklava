/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { UnionToIntersection } from './types.ts';
import { isObject } from './objectUtil.ts';
import * as React from 'react';
import { classNames as cx, isClassNameArgument } from './componentUtil.ts';


/* Source: https://github.com/wojtekmaj/merge-refs/tree/main */
/**
 * A function that merges React refs into one.
 * Supports both functions and ref objects created using createRef() and useRef().
 *
 * Usage:
 * ```tsx
 * <div ref={mergeRefs(ref1, ref2, ref3)} />
 * ```
 *
 * @param {(React.Ref<T> | undefined)[]} inputRefs Array of refs
 * @returns {React.Ref<T> | React.RefCallback<T>} Merged refs
 */
export const mergeRefs = <T>(
  ...inputRefs: Array<undefined | React.Ref<T>>
): React.Ref<T> | React.RefCallback<T> => {
  const filteredInputRefs = inputRefs.filter(Boolean);
  
  if (filteredInputRefs.length <= 1) {
    const firstRef = filteredInputRefs[0];
    return firstRef || null;
  }
  
  return (ref) => {
    filteredInputRefs.forEach((inputRef) => {
      if (typeof inputRef === 'function') {
        inputRef(ref);
      } else if (inputRef) {
        inputRef.current = ref;
      }
    });
  };
};

/**
 * Takes zero or more callbacks, and returns a new callback that applies each callback one by one. Returns the return
 * value of the last callback.
 */
export const mergeCallbacks = <Args extends Array<unknown>, Return = undefined>(
  callbacks: Array<undefined | ((...args: Args) => Return)>
) => (...args: Args): Return => {
  // Note: this always returns the result of the last callback. If we want to instead accumulate the return values
  // we could consider an additional argument callback to merge an array of `Return` values into a single `Return`.
  const returnValue = callbacks.reduce<undefined | Return>(
    (_returnValue, callback) => {
      return typeof callback === 'function' ? callback.apply(null, args) : undefined;
    },
    undefined,
  );
  
  // If there is at least one callback, the return value should be an instance of `Return`. If there is no callback,
  // then the `Return` generic will be inferred as `undefined` anyway.
  return returnValue as Return;
};


const chain = (...callbacks: Array<unknown>): ((...args: Array<unknown>) => void) => {
  return (...args: Array<unknown>) => {
    for (const callback of callbacks) {
      if (typeof callback === 'function') {
        callback(...args);
      }
    }
  };
};

// biome-ignore lint/suspicious/noExplicitAny: `any` here is needed for function argument `extends` to work.
type Props = { [key: string]: any };
type PropsArg = undefined | null | Props;
type NullishToObject<T> = T extends (null | undefined) ? {} : T;
type TupleTypes<T> = { [P in keyof T]: T[P] } extends { [key: number]: infer V } ? NullishToObject<V> : never;

/**
 * Take a series of props objects, and merges them, with later props taking precedence. Wherever possible, props will
 * be combined together:
 * - Event listeners (prop names starting with `on[A-Z]`) will be chained.
 * - Class names will be concatenated.
 * - `ref` props are merged into a single ref.
 * - `style` props are merged into a single object.
 */
export const mergeProps = <T extends Array<PropsArg>>(...args: T): UnionToIntersection<TupleTypes<T>> => {
  // Start with a base clone of the first argument. This is a lot faster than starting
  // with an empty object and adding properties as we go.
  const result = { ...args[0] } as Props;
  for (let i = 1; i < args.length; i++) {
    const props = args[i];
    for (const key in props) {
      const a = result[key];
      const b = props[key];
      
      if (
        typeof a === 'function' && typeof b === 'function'
        // Check if the key is of the form `on[A-Z]`. Do not use a regex for this (slow).
        && key[0] === 'o' && key[1] === 'n'
        && key.charCodeAt(2) >= 65 /*A*/ && key.charCodeAt(2) <= 90 /*Z*/
      ) {
        // Chain event listeners
        result[key] = chain(a, b);
      } else if (key === 'className' && isClassNameArgument(a) && isClassNameArgument(b)) {
        result[key] = cx(a, b);
      } else if (key === 'ref') {
        result[key] = mergeRefs(a, b);
      } else if (key === 'style' && isObject(a) && isObject(b)) {
        result[key] = { ...a, ...b };
      } else {
        result[key] = b !== undefined ? b : a;
      }
    }
  }
  
  return result as UnionToIntersection<TupleTypes<T>>;
};



/**
 * Similar to `useMemo(fn, [])` but with the guarantee to only run the initializer once.
 * @see {@link https://tkdodo.eu/blog/use-state-for-one-time-initializations}
 */
export const useMemoOnce = <T>(initialize: () => T) => {
  const [state] = React.useState(initialize);
  return state;
};


export const usePrevious = <T>(value: T) => {
  const ref: React.RefObject<undefined | T> = React.useRef(undefined);
  React.useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};


export const useEffectOnce = (fn: () => void) => {
  const isCalledRef = React.useRef(false);
  
  // biome-ignore lint/correctness/useExhaustiveDependencies: Should run only once
  React.useEffect(() => {
    if (!isCalledRef.current) {
      isCalledRef.current = true;
      fn();
    }
  }, []);
};

export const useEffectAsync = (effect: () => Promise<unknown>, inputs?: undefined | React.DependencyList): void => {
  React.useEffect(() => {
    effect();
    // biome-ignore lint/correctness/useExhaustiveDependencies: We rely on user deps; adding effect triggers unwanted re-runs
  }, inputs);
};


// Lazily initializes a ref value without re-running the initializer on every render. Passing an expression directly
// to `useRef()` (e.g. `useRef(fn())`) would unnecessarily invoke `fn` on each render, even though the ref value itself
// is preserved. This helper ensures the initializer runs exactly once.
const useRefWithInitializerSentinal = Symbol();
export const useRefWithInitializer = <T>(initializer: () => T) => {
  const ref = React.useRef<T | typeof useRefWithInitializerSentinal>(useRefWithInitializerSentinal);
  
  if (ref.current === useRefWithInitializerSentinal) { ref.current = initializer(); }
  
  // The cast here is safe since `useRefWithInitializerSentinal` is not exposed (cannot be returned by `initializer`)
  return ref as React.RefObject<T>;
};
