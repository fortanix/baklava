/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { mergeProps, useMemoOnce } from '../../../util/reactUtil.ts';
import { type StoreApi, createStore, useStore } from 'zustand';

import { ControllableStateDef, parseControllableState } from './ControllableState.ts';

import {
  type ItemKey,
  type CollectionSlice,
  createCollectionSlice,
  useCollectionWith,
  useCollectionItemWith,
} from './CollectionStore.ts';
import {
  type SelectedState,
  type SelectionMultiSlice,
  createSelectionMultiSlice,
  useSelectionWith,
} from './SelectionMultiStore.ts';


export type { ItemKey, SelectedState };

const SetUtil = {
  add<T>(set: Set<T>, item: T) {
    return new Set([...set, item]);
  },
  remove<T>(set: Set<T>, item: T) {
    return new Set([...set].filter(cur => cur !== item));
  },
};

export type ListBoxSlice = CollectionSlice & SelectionMultiSlice;
export type ListBoxContext = {
  store: StoreApi<ListBoxSlice>,
  /** Called when the user requests the given items (or none) to be selected. */
  requestSelected: (itemKeys: SelectedState) => void,
};
export const ListBoxContext = React.createContext<null | ListBoxContext>(null);
export const useListBoxContext = () => {
  const context = React.use(ListBoxContext);
  if (!context) { throw new Error(`Missing 'ListBoxContext' provider`); }
  return context;
};
export const useListBoxSelector = <T>(selector: (state: ListBoxSlice) => T) => {
  const { store } = useListBoxContext();
  return useStore(store, selector);
};

export type ListBoxProps = ControllableStateDef<SelectedState>;
export const useListBox = <E extends Element = Element>(props: ListBoxProps) => {
  const ref = React.useRef<E>(null);
  const listBoxId = React.useId();
  
  const { isControlled, stateInitial, ...selectionState } = parseControllableState(props);
  
  const store = useMemoOnce(() => createStore<ListBoxSlice>()((...args) => ({
    ...createCollectionSlice({ collectionId: listBoxId })(...args),
    ...createSelectionMultiSlice({ selectedItemKeys: stateInitial ?? new Set() })(...args),
  })));
  
  const { props: propsCollection } = useCollectionWith(store);
  const { props: propsSelection } = useSelectionWith(store, selectionState);
  
  const requestSelected = React.useCallback((selectedItemKeys: SelectedState) => {
    // Note: when controlled, don't directly update the store. Just trigger `onStateChange` and if the consumer
    // chooses to respect the change then it'll be synced to the store through the `useEffect` below.
    if (isControlled) {
      props.onStateChange?.(selectedItemKeys);
    } else {
      store.setState({ selectedItemKeys });
    }
  }, [isControlled, props.onStateChange]);
  
  // Note: this context value should be as stable as possible, the state changing means the entire subtree will get
  // rerendered. The way we've set this up, only a change in `isControlled` will cause this state to change. Changes
  // to `isControlled` after mount should be avoided by consumers (but are technically allowed).
  // This also depends on `onStateChange`, therefore consumers must be really careful to memoize this callback!
  const context: ListBoxContext = React.useMemo(() => ({ store, requestSelected }), [requestSelected]);
  
  // Storing `onStateChange` in a ref, or using `useEffectEvent` could maybe help with the `context` rerendering issue.
  // However, this is explicitly frowned upon by the React team, who recommend just memoizing (or React Compiler).
  // https://github.com/reactjs/rfcs/pull/220#issuecomment-1259938816
  //const onStateChange = React.useEffectEvent(stateDef.onStateChange ?? noop);
  
  return {
    store,
    context,
    Provider: ListBoxContext,
    props: mergeProps(
      { ref },
      propsCollection,
      propsSelection,
      //{ role: 'listbox' }, // Leave this up to the consumer
    ),
  };
};


type UseListBoxItemParams = { itemKey: ItemKey };
export const useListBoxItem = <E extends Element>({ itemKey }: UseListBoxItemParams) => {
  const { store, requestSelected } = useListBoxContext();
  const selected = useStore(store, store => store.selectedItemKeys?.has(itemKey) ?? false);
  
  // FIXME: better way to add/remove item keys from the store. Should `requestSelected` take a callback?
  // FIXME: "requestSelected" doesn't make sense for multi where things can be unselected as well as selected
  const selectedItemKeys = useStore(store, store => store.selectedItemKeys);
  const requestSelectedForItem = () => {
    const selectedItemKeysUpdated = selectedItemKeys.has(itemKey)
      ? SetUtil.remove(selectedItemKeys, itemKey)
      : SetUtil.add(selectedItemKeys, itemKey);
    requestSelected(selectedItemKeysUpdated);
  };
  
  const { props } = useCollectionItemWith<E>(store, { itemKey });
  return {
    store,
    selected,
    requestSelected: requestSelectedForItem,
    props,
  };
};
