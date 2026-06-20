/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* Source: https://github.com/wojtekmaj/merge-refs/tree/main */

import { capitalizeFirstLetter } from './formatting.ts';
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


// Helper hook 'useLazyRef' lazily initializes a ref value without re-running the initializer
// on every render. Passing an expression directly to 'React.useRef()' (e.g. 'React.useRef(fn())')
// would unnecessarily invoke 'fn' on each render, even though the ref value itself is preserved.
// This helper ensures the initializer runs exactly once.
export const useRefWithInitializer = <T>(initializer: () => T) => {
  const ref = React.useRef<null | T>(null);
  
  if (ref.current === null) { ref.current = initializer(); }
  
  return ref as React.RefObject<T>;
};


const formatStateProp = (propName: string, propType: 'state' | 'stateDefault' | 'onStateChange'): string => {
  switch (propType) {
    case 'state': return propName;
    case 'stateDefault': return `${propName}Default`;
    case 'onStateChange': return `on${capitalizeFirstLetter(propName)}Change`;
    default: throw new Error(`Unexpected prop type '${propType satisfies never}'`);
  }
};
const isStateDispatchCallable = <S>(stateDispatch: React.SetStateAction<S>): stateDispatch is ((prevState: S) => S) => {
  return typeof stateDispatch === 'function';
};

type UseControllableStateProps<S> = {
  componentName: string,
  propName: string,
  state: undefined | S,
  stateDefault: undefined | S,
  stateFallback: S,
  onStateChange: undefined | ((state: S) => void),
};
/**
 * Utility hook for a component that has some state that can be either controlled or uncontrolled. Similar to how
 * built-in React DOM components like `<input/>` work (with `value` as the state). We expect three props:
 * - `state`: If given (not undefined), we consider the state to be controlled with this prop as the current value.
 * - `stateDefault`: If uncontrolled, this gives the initial value for the state.
 * - `stateFallback`: If uncontrolled, and no `stateDefault` is given, this gives the fallback value.
 * - `onStateChange`: Callback that is called (in either controlled or uncontrolled case) when the state changes.
 * 
 * Components should never switch from controlled to uncontrolled or vice versa after rendering. If this happens, we
 * print a warning in the console.
 */
export const useControllableState = <S>(props: UseControllableStateProps<S>) => {
  const { componentName: comp, propName, state, stateDefault, stateFallback, onStateChange } = props;
  
  // When `state` is explicitly given (not undefined), we consider the state to be controlled
  const isControlled = typeof state !== 'undefined';
  
  
  // Track when the component changes from controlled to uncontrolled or vice versa
  const wasControlled: undefined | boolean = usePrevious(isControlled);
  const handleControlledChange = React.useEffectEvent((isControlled: boolean) => {
    if (typeof wasControlled !== 'undefined' && isControlled !== wasControlled) {
      const change = isControlled ? `uncontrolled to controlled` : `controlled to uncontrolled`;
      console.warn(`[${comp}] Component switched from ${change} upon rerendering`);
    }
  });
  React.useEffect(() => { handleControlledChange(isControlled); }, [isControlled]);
  
  
  // Validate preconditions
  if (isControlled && typeof onStateChange === 'undefined') {
    console.warn(`[${comp}] 'Missing ${formatStateProp(propName, 'onStateChange')}' in controlled component`);
  }
  if (isControlled && typeof stateDefault !== 'undefined') {
    console.warn(`[${comp}] '${formatStateProp(propName, 'stateDefault')}' passed to controlled component`);
  }
  
  
  // When uncontrolled, we need to keep track of the current state ourselves
  const [stateUncontrolled, setStateUncontrolled] = React.useState<S>(stateDefault ?? stateFallback);
  
  // The actual state to be used by the component (whether controlled or uncontrolled)
  const stateUsed: S = isControlled ? state : stateUncontrolled;
  
  // When uncontrolled, notify the consumer whenever the state changes
  const onStateChangeEvent = React.useEffectEvent((stateDispatch: React.SetStateAction<S>) => {
    const stateUpdated = isStateDispatchCallable(stateDispatch) ? stateDispatch(stateUsed) : stateDispatch;
    onStateChange?.(stateUpdated);
  });
  React.useEffect(() => {
    onStateChangeEvent(stateUncontrolled);
  }, [stateUncontrolled]);
  
  // Allow the component to trigger an update to the state (e.g. in response to user action)
  const setState = React.useCallback((stateDispatch: React.SetStateAction<S>) => {
    if (isControlled) {
      onStateChangeEvent(stateDispatch);
    } else {
      // Note: don't call `onStateChangeEvent` directly, update the internal state first and then let it sync through
      // the `useEffect` above.
      setStateUncontrolled(stateDispatch);
    }
  }, [isControlled]);
  
  return {
    isControlled,
    state: stateUsed,
    setState,
  };
};
