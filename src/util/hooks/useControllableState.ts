/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import { capitalizeFirstLetter } from '../formatting.ts';
import { usePrevious } from '../reactUtil.ts';


export type Defined = null | {};

/**
 * Model of React state which can be either uncontrolled (state managed internally by the component) or controlled
 * (state is driven by the consumer). This models the common React pattern seen for example in native form controls:
 * 
 *     <input value={} defaultValue={} onChange={}/>
 * 
 * React considers the state to be uncontrolled when `value` is `undefined`, and controlled otherwise. When
 * uncontrolled, a `defaultValue` may be passed that specifies the desired initial state. When controlled, a
 * `onStateChange` must be passed to handle state updates (if uncontrolled, it's an optional notifification mechanism).
 * State should be either controlled or uncontrolled throughout the lifetime of a component, not switch between.
 * 
 * The naming of the fields is meant to follow DOM conventions (as far as the DOM has a convention for this).
 */
export type ControllableState<S extends Defined, E = S> = (
  | {
    state?: undefined, // Uncontrolled
    defaultState?: undefined | S,
    onStateChange?: undefined | ((event: E) => void),
  }
  | {
    state: S, // Controlled
    defaultState?: undefined,
    onStateChange: (event: E) => void,
  }
);


//
// Utilities
//

const formatStateProp = (propName: string, propType: 'state' | 'defaultState' | 'onStateChange'): string => {
  switch (propType) {
    case 'state': return propName;
    case 'defaultState': return `default${capitalizeFirstLetter(propName)}`;
    case 'onStateChange': return `on${capitalizeFirstLetter(propName)}Change`;
    default: throw new Error(`Unexpected prop type '${propType satisfies never}'`);
  }
};

/*
// For some reason the following does not always work (tested in TS v6). It works outside of function context, but
// inside of a function the narrowing doesn't happen and `stateDef` remains `ControllableState<S, E>`. As a workaround,
// we introduce a type guard `isControlledState`.
const stateDef = null as any as ControllableState<string, { state: string }>;
if (typeof stateDef.state !== 'undefined') { stateDef; }
*/

// Narrowed variants of `ControllableState`
type Uncontrolled<S extends Defined, E> = ControllableState<S, E> & { state: undefined };
type Controlled<S extends Defined, E> = ControllableState<S, E> & { state: S };
//type Test1 = Uncontrolled<string, { state: string }>; // Should equal the uncontrolled branch
//type Test2 = Controlled<string, { state: string }>; // Should equal the controlled branch

const isControlledState = <S extends Defined, E>(stateDef: ControllableState<S, E>): stateDef is Controlled<S, E> => {
  return typeof stateDef.state !== 'undefined';
};


//
// useControllableState
//

export type StateChangeRequest<S extends Defined, E> = E | ((prevState: S) => E);
const isStateChangeRequestCallable = <S extends Defined, E>(
  req: StateChangeRequest<S, E>,
): req is ((prevState: S) => E) => {
  // Note: this type guard is needed because technically the event type `E` could be a function, and it's difficult to
  // contrain the generic `E` to be "not a function type". So for now we simply use a type guard to narrow.
  return typeof req === 'function';
};

export type UseControllableStateOptions<S extends Defined, E> = {
  /** The component or hook name, for use in debug logs. */
  debugName?: undefined | string,
  /** A name to identify this particular piece of state. */
  propName: string,
  /** A fallback value to use for `defaultState` if not given. */
  defaultStateFallback: S,
  /** A function that can take an event and extract the state value from it. */
  stateFromEvent: (event: E) => S,
};
export type UseControllableStateResult<S extends Defined, E> = {
  /**
   * Whether the state is controlled or uncontrolled. Note: this cannot be derived from result `state` because that
   * gives the _tracked_ state value.
   */
  isControlled: boolean,
  /** The state value that was determined by tracking. */
  state: S,
  /** Imperative state update function (e.g. for uncontrolled components to call through a `ref`). */
  requestStateChange: (stateChangeRequest: StateChangeRequest<S, E>) => void,
};
/**
 * Utility hook for a component that has some state that can be either controlled or uncontrolled. Similar to how
 * built-in React DOM components like `<input/>` work (with `value` as the state). We expect three props:
 * - `state`: If given (not undefined), we consider the state to be controlled with this prop as the current value.
 * - `defaultState`: If uncontrolled, this gives the initial value for the state.
 * - `onStateChange`: Callback that is called (in either controlled or uncontrolled case) when the state changes.
 * 
 * Components should never switch from controlled to uncontrolled or vice versa after rendering. If this happens, we
 * print a warning in the console.
 */
export const useControllableState = <S extends Defined, E = S>(
  stateDef: ControllableState<S, E>,
  options: UseControllableStateOptions<S, E>,
): UseControllableStateResult<S, E> => {
  const { debugName, propName, defaultStateFallback, stateFromEvent } = options;
  const logPrefix = `[${debugName ? `${debugName}.` : ''}${propName}]`;
  
  // Note: using an `isControlledState` type guard as workaround here for a TS bug, see explanation above
  const isControlled = isControlledState(stateDef);
  
  // Detect when the component changes from controlled to uncontrolled or vice versa
  const wasControlled = usePrevious(isControlled);
  // biome-ignore lint/correctness/useExhaustiveDependencies(logPrefix): Should only run on `isControlled` change.
  // biome-ignore lint/correctness/useExhaustiveDependencies(wasControlled): Should only run on `isControlled` change.
  React.useEffect(() => {
    if (typeof wasControlled !== 'undefined' && isControlled !== wasControlled) {
      const change = isControlled ? `uncontrolled to controlled` : `controlled to uncontrolled`;
      console.warn(`${logPrefix} Component switched from ${change} state upon rerendering`);
    }
  }, [isControlled]);
  
  
  // When uncontrolled, we need to keep track of the current state ourselves
  const [stateUncontrolled, setStateUncontrolled] = React.useState<S>(() =>
    typeof stateDef.defaultState !== 'undefined' ? stateDef.defaultState : defaultStateFallback,
  );
  
  // The actual state to be used by the component (whether controlled or uncontrolled)
  const stateUsed: S = isControlled ? stateDef.state : stateUncontrolled;
  
  // An imperative request to change the state (e.g. in response to user action)
  const requestStateChange = React.useCallback((stateRequest: StateChangeRequest<S, E>) => {
    if (isControlled) { // When controlled, we just pass the request on to `onStateChange`
      /*
      CAUTION: normally, with an updater callback, you would expect the values to be queued as follows:
      
        - `requestStateChange(count => count + 1)`
        - `requestStateChange(count => count + 1)`
        - Total effect would normally be `count + 2`
      
      However this does not work for controlled state, because the state update (if any) won't be visible to us until
      the next render cycle. Instead, you will just get the current `state` multiple times in the same render cycle.
      
      Idea #1: we could maybe internally keep track of the resulting state through `stateFromEvent()`, store that in a
      ref and then pass that on to the next call (and then reset to passed `state` on next render cycle). However, that
      risks a desync because the consumer is not guaranteed to respect the `onStateChange` event.
      
      Idea #2: change the type of the `onStateChange` prop so it must take a `React.SetStateAction`. This would resolve
      it, though at the cost of consumers now having to handle an updater and not just a value.
      
      Idea #3: model it through declarative events instead. For example instead of a `toggled => !toggled` updater
      function, you could instead have an event `{ action: 'invert' }`. Arguably, this is not much better than idea #2
      because then the consumer must still handle this event and convert it to a `setState` updater function.
      
      if (isStateChangeRequestCallable(stateRequest)) {
        console.warn(`${logPrefix} 'requestStateChange' was called with an updater callback despite controlled state`);
      }
      */
      
      const event: E = isStateChangeRequestCallable(stateRequest) ? stateRequest(stateDef.state) : stateRequest;
      stateDef.onStateChange?.(event);
    } else { // When uncontrolled, update the internal state
      setStateUncontrolled(prevState => {
        const event: E = isStateChangeRequestCallable(stateRequest)
          ? stateRequest(prevState)
          : stateRequest;
        
        // Notify the consumer
        stateDef.onStateChange?.(event);
        
        return stateFromEvent(event);
      });
    }
  }, [stateFromEvent, isControlled, stateDef.state, stateDef.onStateChange]);
  
  return {
    isControlled,
    state: stateUsed,
    requestStateChange,
  };
};


//
// Non-strictly typed `ControllableStateProps` + utilities
//

/**
 * Similar to `ControllableState`, but weakly-typed (the union is flattened). This is useful for component props, where
 * a strictly-typed union is not always practical.
 */
export type ControllableStateProps<S extends Defined, E = S> = {
  state?: undefined | S,
  defaultState?: undefined | S,
  onStateChange?: undefined | ((event: E) => void),
};

export type ParseControllableStateResult<S extends Defined, E> = {
  stateDef: ControllableState<S, E>,
  isControlled: boolean,
  stateInitial: undefined | S,
};
export const parseControllableStateProps = <S extends Defined, E>(
  stateProps: ControllableStateProps<S, E>,
  options: Pick<UseControllableStateOptions<S, E>, 'debugName' | 'propName'>,
): ParseControllableStateResult<S, E> => {
  const { debugName, propName } = options;
  const logPrefix = `[${debugName ? `${debugName}.` : ''}${propName}]`;
  
  const isControlled = typeof stateProps.state !== 'undefined';
  
  // Validate preconditions
  if (isControlled && typeof stateProps.onStateChange === 'undefined') {
    console.warn(`${logPrefix} 'Missing ${formatStateProp(propName, 'onStateChange')}' in controlled component`);
  }
  if (isControlled && typeof stateProps.defaultState !== 'undefined') {
    console.warn(`${logPrefix} '${formatStateProp(propName, 'defaultState')}' passed to controlled component`);
  }
  
  const stateInitial: undefined | S = isControlled
    ? stateProps.state
    : (typeof stateProps.defaultState !== 'undefined' ? stateProps.defaultState : undefined);
  
  // The type cast below should be safe through the above runtime checks. Note: given that we only warn and not throw,
  // `useControllableState` must still be able to gracefully handle failed preconditions.
  const stateDef = stateProps as ControllableState<S, E>;
  
  return {
    stateDef,
    isControlled,
    stateInitial,
  };
};

/** Variant of `useControllableState` that takes in a weakly-typed props type. */
export const useControllableStateFromProps = <S extends Defined, E = S>(
  stateProps: ControllableStateProps<S, E>,
  options: UseControllableStateOptions<S, E>,
): UseControllableStateResult<S, E> => {
  const parseOptions = { debugName: options.debugName, propName: options.propName };
  const { stateDef } = parseControllableStateProps(stateProps, parseOptions);
  return useControllableState(stateDef, options);
};
