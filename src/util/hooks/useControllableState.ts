/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import { capitalizeFirstLetter } from '../formatting.ts';
import { usePrevious } from '../reactUtil.ts';


const formatStateProp = (propName: string, propType: 'state' | 'defaultState' | 'onStateChange'): string => {
  switch (propType) {
    case 'state': return propName;
    case 'defaultState': return `${propName}Default`;
    case 'onStateChange': return `onUpdate${capitalizeFirstLetter(propName)}`;
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
  defaultState: undefined | S,
  stateFallback: S,
  onStateChange: undefined | ((state: S) => void),
};
/**
 * Utility hook for a component that has some state that can be either controlled or uncontrolled. Similar to how
 * built-in React DOM components like `<input/>` work (with `value` as the state). We expect three props:
 * - `state`: If given (not undefined), we consider the state to be controlled with this prop as the current value.
 * - `defaultState`: If uncontrolled, this gives the initial value for the state.
 * - `stateFallback`: If uncontrolled, and no `defaultState` is given, this gives the fallback value.
 * - `onStateChange`: Callback that is called (in either controlled or uncontrolled case) when the state changes.
 * 
 * Note: the above prop naming convention was chosen so as to minimize conflicts with existing DOM props. For instance,
 * for `value` DOM has: `value`, `defaultValue`, and `onChange`. There are events like `onFooChange` (e.g.
 * `onDurationChange`) and `onFooUpdate` (e.g. `onTimeUpdate`), but not `onUpdateFoo`. Defaults are always `defaultFoo`.
 * 
 * Components should never switch from controlled to uncontrolled or vice versa after rendering. If this happens, we
 * print a warning in the console.
 */
export const useControllableState = <S>(props: UseControllableStateProps<S>) => {
  const { componentName: comp, propName, state, defaultState, stateFallback, onStateChange } = props;
  
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
  if (isControlled && typeof defaultState !== 'undefined') {
    console.warn(`[${comp}] '${formatStateProp(propName, 'defaultState')}' passed to controlled component`);
  }
  
  
  // When uncontrolled, we need to keep track of the current state ourselves
  const stateInit = typeof defaultState !== 'undefined' ? defaultState : stateFallback;
  const [stateUncontrolled, updateStateUncontrolled] = React.useState<S>(stateInit);
  
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
  const updateState = React.useCallback((stateDispatch: React.SetStateAction<S>) => {
    if (isControlled) {
      onStateChangeEvent(stateDispatch);
    } else {
      // Note: don't call `onStateChangeEvent` directly, update the internal state first and then let it sync through
      // the `useEffect` above.
      updateStateUncontrolled(stateDispatch);
    }
  }, [isControlled]);
  
  return {
    isControlled,
    state: stateUsed,
    updateState,
  };
};
