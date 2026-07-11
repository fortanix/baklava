/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import scrollIntoView from 'scroll-into-view-if-needed';
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

export type ListBoxMultiSlice = CollectionSlice & SelectionMultiSlice;
export type ListBoxMultiContext = {
  store: StoreApi<ListBoxMultiSlice>,
  /** Called when the user requests the given items (or none) to be selected. */
  requestSelected: (itemKeys: SelectedState) => void,
};
export const ListBoxMultiContext = React.createContext<null | ListBoxMultiContext>(null);
export const useListBoxMultiContext = () => {
  const context = React.use(ListBoxMultiContext);
  if (!context) { throw new Error(`Missing 'ListBoxMultiContext' provider`); }
  return context;
};
export const useListBoxMultiSelector = <T>(selector: (state: ListBoxMultiSlice) => T) => {
  const { store } = useListBoxMultiContext();
  return useStore(store, selector);
};

export type ListBoxMultiProps = ControllableStateDef<SelectedState>;
export const useListBoxMulti = <E extends HTMLElement = HTMLElement>(props: ListBoxMultiProps) => {
  const ref = React.useRef<E>(null);
  const listBoxId = React.useId();
  
  const { isControlled, stateInitial, ...selectionState } = parseControllableState(props);
  
  const store = useMemoOnce(() => createStore<ListBoxMultiSlice>()((...args) => ({
    ...createCollectionSlice(ref, { collectionId: listBoxId })(...args),
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
  
  // When the selected state changes, focus one of the newly selected/unselected options
  const getCollectionItem = React.useEffectEvent(useStore(store, state => state.collectionItem));
  React.useEffect(() => {
    return store.subscribe((state, prevState) => {
      if (state.selectedItemKeys !== prevState.selectedItemKeys) {
        const itemKeyAdded = [...state.selectedItemKeys.difference(prevState.selectedItemKeys)].at(-1);
        const itemKeyRemoved = [...prevState.selectedItemKeys.difference(state.selectedItemKeys)].at(-1);
        const itemKeyTarget = itemKeyAdded ?? itemKeyRemoved ?? null;
        
        if (itemKeyTarget) {
          const element = getCollectionItem(itemKeyTarget);
          if (element) {
            element.focus({ focusVisible: false, preventScroll: true });
            // Note: `focus()` alone doesn't guarantee scroll (the element might already be focused focused)
            scrollIntoView(element, { scrollMode: 'if-needed' });
          }
        }
      }
    });
  }, []);
  
  // Note: this context value should be as stable as possible, the state changing means the entire subtree will get
  // rerendered. The way we've set this up, only a change in `isControlled` will cause this state to change. Changes
  // to `isControlled` after mount should be avoided by consumers (but are technically allowed).
  // This also depends on `onStateChange`, therefore consumers must be really careful to memoize this callback!
  const context: ListBoxMultiContext = React.useMemo(() => ({ store, requestSelected }), [requestSelected]);
  
  // Storing `onStateChange` in a ref, or using `useEffectEvent` could maybe help with the `context` rerendering issue.
  // However, this is explicitly frowned upon by the React team, who recommend just memoizing (or React Compiler).
  // https://github.com/reactjs/rfcs/pull/220#issuecomment-1259938816
  //const onStateChange = React.useEffectEvent(stateDef.onStateChange ?? noop);
  
  return {
    store,
    context,
    Provider: ListBoxMultiContext,
    props: mergeProps(
      { ref },
      propsCollection,
      propsSelection,
      //{ role: 'listbox' }, // Leave this up to the consumer
    ),
  };
};


type UseListBoxMultiItemParams = { itemKey: ItemKey };
export const useListBoxMultiItem = <E extends HTMLElement = HTMLElement>({ itemKey }: UseListBoxMultiItemParams) => {
  const { store, requestSelected } = useListBoxMultiContext();
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
