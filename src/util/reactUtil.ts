/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* Source: https://github.com/wojtekmaj/merge-refs/tree/main */

import * as React from 'react';

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

/**
 * Utility function that takes a React ID (as returned by `useId()`), and converts it to a CSS custom
 * identifier. React IDs by default contain colons, which makes them unsuitable for use as CSS identifiers.
 */
export const idToCssIdent = (id: string) => {
  return `--${id.replaceAll(':', '')}`;
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
