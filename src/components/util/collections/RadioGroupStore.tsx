/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { mergeProps, useMemoOnce } from '../../../util/reactUtil.ts';
import { type StoreApi, createStore } from 'zustand';

import { ControllableStateDef, parseControllableState } from './ControllableState.ts';

import {
  type ItemKey,
  type CollectionSlice,
  createCollectionSlice,
  useCollectionWith,
  useCollectionItemWith,
} from './CollectionStore.tsx';
import {
  type SelectedState,
  type SelectionSingleSlice,
  createSelectionSingleSlice,
  useSelectionWith,
} from './SelectionSingleStore.tsx';


export type { ItemKey };

const noop = () => {};

export type RadioGroupSlice = CollectionSlice & SelectionSingleSlice;
export type RadioGroupContext = {
  store: StoreApi<RadioGroupSlice>,
  /** Called when the user requests the given item (or none) to be selected. */
  requestSelect: (itemKey: SelectedState) => void,
};
export const RadioGroupContext = React.createContext<null | RadioGroupContext>(null);
export const useRadioGroupContext = () => {
  const context = React.use(RadioGroupContext);
  if (!context) { throw new Error(`Missing 'RadioGroupContext' provider`); }
  return context;
};

export type RadioGroupProps = ControllableStateDef<SelectedState>;
export const useRadioGroup = (props: RadioGroupProps) => {
  const radioGroupId = React.useId();
  
  const { isControlled, stateInitial, ...selectionState } = parseControllableState(props);
  
  const store = useMemoOnce(() => createStore<RadioGroupSlice>()((...args) => ({
    ...createCollectionSlice({ collectionId: radioGroupId })(...args),
    ...createSelectionSingleSlice({ selectedItemKey: stateInitial ?? null })(...args),
  })));
  
  const { props: propsCollection } = useCollectionWith(store, {
    //onItemsChange: itemKeys => { console.log('Registry update', itemKeys) },
  });
  const { props: propsSelection } = useSelectionWith(store, selectionState);
  
  // FIXME: integrate this into `SelectionSingle`? Would require storing this callback in the zustand slice.
  const onStateChange = React.useEffectEvent(props.onStateChange ?? noop);
  const requestSelect = React.useCallback((selectedItemKey: SelectedState) => {
    // Note: when controlled, don't directly update the store. Just trigger `onStateChange` and if the consumer
    // chooses to respect the change then it'll be synced to the store through the `useEffect` below.
    if (isControlled) {
      onStateChange(selectedItemKey);
    } else {
      store.setState({ selectedItemKey });
    }
  }, [isControlled]);
  
  // Note: this context value should be as stable as possible, the state changing means the entire subtree will get
  // rerendered. The way we've set this up, only a change in `isControlled` will cause this state to change. Changes
  // to `isControlled` after mount should be avoided by consumers (but are technically allowed).
  // `props.onStateChange` should be assumed to be unstable. We use `useEffectEvent` to keep a reference to the latest
  // value of `props.onStateChange` without it being a memo dep. React enforces `useEffectEvent` is not called during
  // rendering in order to avoid bugs in concurrent rendering. We should call `onStateChange` in event listeners only.
  const context: RadioGroupContext = React.useMemo(() => ({ store, requestSelect }), [requestSelect]);
  
  return {
    store,
    context,
    Provider: RadioGroupContext,
    props: mergeProps(
      propsCollection,
      propsSelection,
      //{ role: 'radiogroup' }, // Leave this up to the consumer
    ),
  };
};


type UseRadioGroupItemParams = { itemKey: ItemKey };
export const useRadioGroupItem = <E extends Element>(params: UseRadioGroupItemParams) => {
  const { itemKey } = params;
  
  const { store, requestSelect } = useRadioGroupContext();
  
  const { props } = useCollectionItemWith<E>(store, { itemKey });
  const requestSelectItem = () => requestSelect(itemKey);
  
  return {
    store,
    requestSelect: requestSelectItem,
    props,
  };
};
