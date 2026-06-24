/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { RequireOnly } from '../../../util/types.ts';
import * as React from 'react';
import { useMemoOnce } from '../../../util/reactUtil.ts';
import { type StateCreator, type StoreApi, createStore, useStore } from 'zustand';

import { type CollectionSlice, createCollectionSlice } from './CollectionStore.tsx';


export type ControllableState<S extends null | {}> = (
  | {
    state?: undefined, // Uncontrolled
    defaultState?: undefined | S,
    onStateChange?: undefined | ((state: S) => void),
  }
  | {
    state: S, // Controlled
    defaultState?: undefined,
    onStateChange: (state: S) => void,
  }
);
export type ControllableStateDef<S extends null | {}> = {
  state: undefined | S,
  defaultState: undefined | S,
  defaultStateFallback: undefined | S,
  onStateChange: undefined | ((state: S) => void),
};

export type ItemKey = string;
export type SelectedState = null | ItemKey;

export type RadioGroupState = {
  selectedItemKey: null | ItemKey,
};
export type RadioGroupSlice = RadioGroupState & {
  selectItem: (itemKey: null | ItemKey) => void,
};

export type CreateRadioGroupSliceProps = RequireOnly<RadioGroupState, 'selectedItemKey'>;
export const createRadioGroupSlice = (
  { selectedItemKey }: CreateRadioGroupSliceProps,
): StateCreator<RadioGroupSlice, [], [], RadioGroupSlice> => set => {
  return {
    selectedItemKey,
    selectItem: itemKey => { set({ selectedItemKey: itemKey }); },
  };
};


export type RadioGroupCollectionSlice = CollectionSlice & RadioGroupSlice;
export type RadioGroupContext = {
  store: StoreApi<RadioGroupCollectionSlice>,
  /** Called when the user requests the given item (or none) to be selected. */
  requestSelect: (store: StoreApi<RadioGroupCollectionSlice>, itemKey: null | ItemKey) => void,
};
export const RadioGroupContext = React.createContext<null | RadioGroupContext>(null);

export type RadioGroupProps = ControllableStateDef<SelectedState>;
export const useRadioGroup = (props: RadioGroupProps) => {
  const radioGroupId = React.useId();
  
  const isControlled = typeof props.state !== 'undefined';
  const selectedItemKeyInit = isControlled
    ? props.state
    : (typeof props.defaultState !== 'undefined' ? props.defaultState : props.defaultStateFallback);
  
  const requestSelect = React.useCallback((
    store: RadioGroupContext['store'],
    selectedItemKey: SelectedState,
  ) => {
    // Note: when controlled, don't directly update the store. Just trigger `onStateChange` and if the consumer
    // respects the change then it'll be handled in the `useEffect` below.
    if (!isControlled) {
      store.setState({ selectedItemKey });
    }
    props.onStateChange?.(selectedItemKey);
  }, [isControlled, props.onStateChange]);
  
  const store = useMemoOnce(() => createStore<RadioGroupCollectionSlice>()((...args) => ({
    ...createCollectionSlice({ collectionId: radioGroupId })(...args),
    ...createRadioGroupSlice({ selectedItemKey: selectedItemKeyInit ?? null })(...args),
  })));
  const context: RadioGroupContext = React.useMemo(() => ({ store, requestSelect }), [requestSelect]);
  
  const Provider = useMemoOnce(() => ({ children }: React.PropsWithChildren) =>
    <RadioGroupContext value={context}>{children}</RadioGroupContext>,
  );
  
  const radioGroupIdStored = useStore(context.store, state => state.collectionId);
  const consumeDirty = useStore(context.store, state => state.consumeDirty);
  const getItemKeys = useStore(context.store, state => state.getItemKeys);
  
  // Uncontrolled case: call `onUpdateSelected` when state changes
  const handleUpdateSelected = React.useEffectEvent((selected: SelectedState) => { props.onStateChange?.(selected); });
  React.useEffect(() => {
    return store.subscribe((state, prevState) => {
      if (!isControlled && state.selectedItemKey !== prevState.selectedItemKey) {
        handleUpdateSelected(state.selectedItemKey);
      }
    });
  }, [isControlled]);
  // Controlled case: update store when controlled state changes
  React.useEffect(() => {
    if (isControlled) {
      store.setState({ selectedItemKey: props.state ?? null });
    }
  }, [isControlled, props.state]);
  
  // TODO: move this inside the `Provider` instead?
  React.useLayoutEffect(() => {
    // FIXME: how do we make sure that only the `useRadioGroup` hook can call `consumeDirty()`?
    if (consumeDirty()) {
      console.log('REGISTRY UPDATE', getItemKeys());
    }
  });
  
  return {
    context,
    Provider,
    store: context.store,
    props: {
      'data-bk-radio-group-id': radioGroupIdStored,
    },
  };
};


type UseRadioGroupItemParams = { itemKey: ItemKey };
type UseRadioGroupItemResult<E extends Element> = {
  store: RadioGroupContext['store'],
  requestSelect: () => void,
  itemProps: {
    ref: React.RefCallback<E>,
    'data-bk-radio-group-parent': string,
    'data-bk-radio-group-item': string,
  },
};
export const useRadioGroupItem = <E extends Element>(params: UseRadioGroupItemParams): UseRadioGroupItemResult<E> => {
  const { itemKey } = params;
  
  const context = React.use(RadioGroupContext);
  if (!context) { throw new Error(`[RadioGroupItem] Missing 'RadioGroupContext' provider`); }
  const { store, requestSelect } = context;
  
  const radioGroupId = useStore(store, state => state.collectionId);
  const registerItem = useStore(store, state => state.registerItem);
  const unregisterItem = useStore(store, state => state.unregisterItem);
  const requestSelectItem = () => requestSelect(store, itemKey);
  
  const ref = React.useCallback<React.RefCallback<E>>(el => {
    if (typeof itemKey === 'undefined') {
      console.warn(`[RadioGroup] Found item without an 'itemKey'`, el);
      return;
    }
    
    if (el === null) {
      // Note: in React 19+ `el` should never be `null` anymore when we return a cleanup function, but we handle this
      // scenario just in case.
      unregisterItem(itemKey);
    } else {
      registerItem(itemKey, el);
    }
    
    return () => {
      unregisterItem(itemKey);
    };
  }, [itemKey, registerItem, unregisterItem]);
  
  return {
    store,
    requestSelect: requestSelectItem,
    itemProps: {
      ref,
      'data-bk-radio-group-parent': radioGroupId,
      'data-bk-radio-group-item': itemKey,
    },
  };
};
