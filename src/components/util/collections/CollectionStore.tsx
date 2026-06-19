/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { RequireOnly } from '../../../util/types.ts';
import * as React from 'react';
import { useMemoOnce } from '../../../util/reactUtil.ts';
import { type StateCreator, type StoreApi, createStore, useStore } from 'zustand';


export type ItemKey = string;

export type CollectionState = {
  collectionId: string,
};
export type CollectionSlice = CollectionState & {
  /** Returns whether the registry has changed since the last `consumeDirty()` call, and clears the flag. */
  consumeDirty: () => boolean,
  registerItem: (itemKey: ItemKey, el: Element) => void,
  unregisterItem: (itemKey: ItemKey) => void,
  getItemKeys: () => Set<ItemKey>,
};

// Ref: https://zustand.docs.pmnd.rs/guides/initialize-state-with-props#wrapping-the-context-provider

export type CollectionProps = RequireOnly<CollectionState, 'collectionId'>;
export const createCollectionSlice = (
  { collectionId }: CollectionProps,
): StateCreator<CollectionSlice, [], [], CollectionSlice> => (_set, _get, _store) => {
  // Private, mutable registry for bookkeeping purposes
  const registry = new Map<ItemKey, Element>();
  let dirty = true; // Whether the registry has changed since it was last processed
  
  return {
    collectionId,
    
    consumeDirty: () => {
      const wasDirty = dirty;
      dirty = false;
      return wasDirty;
    },
    
    registerItem: (itemKey, el) => {
      if (registry.has(itemKey)) {
        console.warn(`[Collection] Found duplicate item key '${itemKey}'`);
      }
      registry.set(itemKey, el);
      dirty = true;
    },
    
    unregisterItem: (itemKey) => {
      if (!registry.has(itemKey)) { return; }
      registry.delete(itemKey);
      dirty = true;
    },
    
    getItemKeys: () => new Set(registry.keys()),
  };
};


export type CollectionContext = { store: StoreApi<CollectionSlice> };
export const CollectionContext = React.createContext<null | CollectionContext>(null);

type UseCollectionProps = {
  onItemsChange?: undefined | (() => void),
};
export const useCollection = /*<E extends Element>*/(props: UseCollectionProps = {}) => {
  const collectionId = React.useId();
  //const ref = React.useRef<E>(null);
  
  const store = useMemoOnce(() => createStore(createCollectionSlice({ collectionId })));
  const context = useMemoOnce(() => ({ store }));
  
  const Provider = useMemoOnce(() => ({ children }: React.PropsWithChildren) =>
    <CollectionContext value={context}>{children}</CollectionContext>,
  );
  
  const collectionIdStored = useStore(store, state => state.collectionId);
  const consumeDirty = useStore(store, state => state.consumeDirty);
  //const getItemKeys = useStore(store, state => state.getItemKeys);
  
  // `useLayoutEffect` on the collection parent is guaranteed to run after all the component children have rerendered.
  // If any registered item was updated in this rerender batch, then `consumeDirty()` will return `true`. This allows
  // us to detect if there was an insertion or deletion. Note: we cannot detect a change in the *order* of the items.
  React.useLayoutEffect(() => {
    if (consumeDirty()) {
      props.onItemsChange?.();
    }
  });
  
  return {
    Provider,
    props: {
      //ref,
      'data-bk-coll-id': collectionIdStored,
    },
  };
};

type UseCollectionItemParams = { itemKey: ItemKey };
type UseCollectionItemResult<E extends Element> = {
  store: null | CollectionContext['store'],
  itemProps: {
    ref: React.RefCallback<E>,
    'data-bk-coll-parent': string,
    'data-bk-coll-item': string,
  },
};
export const useCollectionItem = <E extends Element>(params: UseCollectionItemParams): UseCollectionItemResult<E> => {
  const { itemKey } = params;
  
  const store = React.use(CollectionContext)?.store;
  if (!store) { throw new Error(`[CollectionItem] Missing 'CollectionContext' provider`); }
  
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
