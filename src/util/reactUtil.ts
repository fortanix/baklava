/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* Source: https://github.com/wojtekmaj/merge-refs/tree/main */

import * as React from 'react';
import { classNames as cx, isClassNameArgument } from './componentUtil.ts';

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

type Props = { [key: string]: unknown };
type PropsArg = Props | null | undefined;
type NullToObject<T> = T extends (null | undefined) ? {} : T;
type TupleTypes<T> = { [P in keyof T]: T[P] } extends { [key: number]: infer V } ? NullToObject<V> : never;
type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;
/**
 * Takes zero or more callbacks, and returns a new callback that applies each callback one by one. Returns the return
 * value of the last callback.
 * 
 * Adapted from: https://github.com/adobe/react-spectrum/blob/main/packages/%40react-aria/utils/src/mergeProps.ts
 * Copyright 2020 Adobe. All rights reserved.
 */
export const mergeProps = <T extends Array<PropsArg>>(...args: T): UnionToIntersection<TupleTypes<T>> => {
  // Start with a base clone of the first argument. This is a lot faster than starting
  // with an empty object and adding properties as we go.
  const result: Props = {...args[0]};
  for (let i = 1; i < args.length; i++) {
    const props = args[i];
    for (const key in props) {
      const a = result[key];
      const b = props[key];
      
      // Chain events
      if (
        typeof a === 'function' &&
        typeof b === 'function' &&
        // This is a lot faster than a regex.
        key[0] === 'o' &&
        key[1] === 'n' &&
        key.charCodeAt(2) >= /* 'A' */ 65 &&
        key.charCodeAt(2) <= /* 'Z' */ 90
      ) {
        result[key] = chain(a, b);
      } else if (key === 'className' && isClassNameArgument(a) && isClassNameArgument(b)) {
        result[key] = cx(a, b);
      } else if (key === 'ref') {
        // @ts-ignore
        result[key] = mergeRefs(a, b);
      } else {
        result[key] = b !== undefined ? b : a;
      }
    }
  }
  
  return result as UnionToIntersection<TupleTypes<T>>;
};


export const usePrevious = <T>(value: T) => {
  const ref: React.RefObject<null | T> = React.useRef(null);
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
  // biome-ignore lint/correctness/useExhaustiveDependencies: We rely on user deps; adding effect triggers unwanted re-runs
  React.useEffect(() => {
    effect();
  }, inputs);
};
