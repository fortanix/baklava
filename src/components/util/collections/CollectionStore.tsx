/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { useMemoOnce } from '../../../util/reactUtil.ts';
import { type StateCreator, type StoreApi, createStore, useStore } from 'zustand';


export type ItemKey = string;


//
// Store slice
//

export const consumeRegistryChange = Symbol('baklava.CollectionStore.consumeRegistryChange');

export type CollectionState = {
  collectionId: string,
};
export interface CollectionSlice extends CollectionState {
  registerItem: (itemKey: ItemKey, el: Element) => void,
  unregisterItem: (itemKey: ItemKey) => void,
  getItemKeys: () => Set<ItemKey>,
  
  /** Returns whether the registry has changed since the last `consumeRegistryChange` call, and clears the flag. */
  [consumeRegistryChange]: () => boolean,
};

export type CollectionProps = Pick<CollectionState, 'collectionId'>;
export const createCollectionSlice = (
  { collectionId }: CollectionProps,
): StateCreator<CollectionSlice, [], [], CollectionSlice> => (_set, _get, _store) => {
  // Private, mutable registry for bookkeeping purposes
  const registry = new Map<ItemKey, Element>();
  let registryHasChanged = true; // Dirty flag to track whether the registry has changed since it was last processed
  
  return {
    collectionId,
    
    registerItem: (itemKey, el) => {
      if (registry.has(itemKey)) {
        console.warn(`[Collection] Found duplicate item key '${itemKey}'`);
      }
      registry.set(itemKey, el);
      registryHasChanged = true;
    },
    
    unregisterItem: (itemKey) => {
      if (!registry.has(itemKey)) { return; }
      registry.delete(itemKey);
      registryHasChanged = true;
    },
    
    // Internal method: consume the `registryHasChanged` flag, returning it then resetting the flag.
    // Uses a `consumeRegistryChange`, because this should only ever be called by us and exactly once per render.
    [consumeRegistryChange]: () => {
      const changed = registryHasChanged;
      registryHasChanged = false;
      return changed;
    },
    
    getItemKeys: () => new Set(registry.keys()),
  };
};


//
// Hooks
//

type UseCollectionParams = {
  onItemsChange?: undefined | ((itemKeys: Set<ItemKey>) => void),
};
export const useCollectionWith = (store: StoreApi<CollectionSlice>, { onItemsChange }: UseCollectionParams = {}) => {
  const collectionId = useStore(store, state => state.collectionId);
  const consumeChange = useStore(store, state => state[consumeRegistryChange]);
  const getItemKeys = useStore(store, state => state.getItemKeys);
  
  // `useLayoutEffect` on the collection parent is guaranteed to run after all the component children have rerendered.
  // If any items were added/removed in this rerender batch, then `consumeRegistryChange` will return `true`. Caveat:
  // merely reordering the elements (e.g. two items swap) does not trigger a layout effect in React, hence the registry
  // must be considered unordered.
  React.useLayoutEffect(() => {
    if (consumeChange()) {
      onItemsChange?.(getItemKeys());
    }
  });
  
  return {
    props: {
      'data-bk-coll-id': collectionId,
    },
  };
};

type UseCollectionItemParams = { itemKey: ItemKey };
export const useCollectionItemWith = <E extends Element>(
  store: StoreApi<CollectionSlice>,
  { itemKey }: UseCollectionItemParams,
) => {
  const collectionId = useStore(store, state => state.collectionId);
  const registerItem = useStore(store, state => state.registerItem);
  const unregisterItem = useStore(store, state => state.unregisterItem);
  
  const ref = React.useCallback<React.RefCallback<E>>(el => {
    if (typeof itemKey === 'undefined') {
      console.warn(`[Collection] Found item without an 'itemKey'`, el);
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
    props: {
      ref,
      'data-bk-coll-parent': collectionId,
      'data-bk-coll-item': itemKey,
    },
  };
};


//
// Hooks with context provider
//

export type CollectionContext = { store: StoreApi<CollectionSlice> };
export const CollectionContext = React.createContext<null | CollectionContext>(null);
export const useCollectionContext = () => {
  const context = React.use(CollectionContext);
  if (!context) { throw new Error(`Missing 'CollectionContext' provider`); }
  return context;
};

export const useCollection = (params: UseCollectionParams = {}) => {
  const collectionId = React.useId();
  
  const store = useMemoOnce(() => createStore(createCollectionSlice({ collectionId })));
  
  const context = useMemoOnce(() => ({ store }));
  const Provider = useMemoOnce(() => ({ children }: React.PropsWithChildren) =>
    <CollectionContext value={context}>{children}</CollectionContext>,
  );
  
  const { props } = useCollectionWith(store, params);
  return {
    store,
    context,
    Provider,
    props,
  };
};

type UseCollectionItemResult<E extends Element> = {
  store: CollectionContext['store'],
  itemProps: {
    ref: React.RefCallback<E>,
    'data-bk-coll-parent': string,
    'data-bk-coll-item': string,
  },
};
export const useCollectionItem = <E extends Element>(params: UseCollectionItemParams): UseCollectionItemResult<E> => {
  const { itemKey } = params;
  
  const { store } = useCollectionContext();
  
  const collectionId = useStore(store, state => state.collectionId);
  const registerItem = useStore(store, state => state.registerItem);
  const unregisterItem = useStore(store, state => state.unregisterItem);
  
  const ref = React.useCallback<React.RefCallback<E>>(el => {
    if (typeof itemKey === 'undefined') {
      console.warn(`[Collection] Found item without an 'itemKey'`, el);
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
    itemProps: {
      ref,
      'data-bk-coll-parent': collectionId,
      'data-bk-coll-item': itemKey,
    },
  };
};


export const _internalKeyForTestingOnly: typeof consumeRegistryChange = consumeRegistryChange;
