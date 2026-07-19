/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import scrollIntoView from 'scroll-into-view-if-needed';
import * as React from 'react';
import { type StateCreator, type StoreApi, createStore, useStore } from 'zustand';

import { mergeProps, useMemoOnce } from '../../../util/reactUtil.ts';
import { removeCombiningCharacters } from '../../../util/formatting.ts';
import { useTypeAhead } from '../../../util/hooks/useTypeAhead.ts';


export type ItemKey = string;
export type RegistryItem = HTMLElement;


//
// Utilities
//

/**
 * Programmatically focus the given item element. Optionally, specify the `containerEl` in order to scroll only within
 * the container, preventing scroll of the rest of the page.
 */
export const focusItem = (itemEl: HTMLElement, containerEl?: undefined | null | HTMLElement) => {
  // Note: we don't rely on `focus()` to scroll, because:
  // - It doesn't work if the element is already focused
  // - It will scroll even when not needed (i.e. when the element is already visible)
  // - It will scroll the viewport as well, not just the local scrollport.
  itemEl.focus({ preventScroll: true });
  scrollIntoView(itemEl, {
    scrollMode: 'if-needed',
    boundary: containerEl ?? null,
  });
};

//
// Store slice
//

export const consumeRegistryChange = Symbol('baklava.CollectionStore.consumeRegistryChange');

export type CollectionState = {
  collectionId: string,
};
export interface CollectionSlice extends CollectionState {
  /** Register an item, with the given item key, and element reference. If the key exists, it is updated. @private */
  registerItem: (itemKey: ItemKey, item: RegistryItem) => void,
  /** Unregister the item with the given item key, if it exists. @private */
  unregisterItem: (itemKey: ItemKey) => void,
  /**
   * Internal: returns whether the registry has changed since last `consumeRegistryChange` call, and clears the flag.
   * Should not be called by consumers, only intended for the internal module.
   * @private
   */
  [consumeRegistryChange]: () => boolean,

  /** Return the item for the given key. Returns `null` if the item does not exist. */
  collectionItemByKey: (itemKey: ItemKey) => null | RegistryItem,
  /** Return the set of all item keys in the registry. */
  collectionItemKeys: () => Set<ItemKey>,
  /** Returns whether the registry is currently empty. */
  collectionIsEmpty: () => boolean,
  /** Returns whether the registry is currently empty. */
  collectionItemElements: () => Array<HTMLElement>,
  collectionItemKeysOrdered: () => Array<ItemKey>,
  /** Focus the given item key. */
  collectionFocusItem: (itemKey: ItemKey) => void,
  /** Focus the item at the given position in the DOM. */
  collectionFocusItemAt: (position: 'first' | 'last') => void,
};

export type CollectionProps = Pick<CollectionState, 'collectionId'>;
export const createCollectionSlice = <E extends HTMLElement = HTMLElement>(
  ref: React.RefObject<null | E>,
  { collectionId }: CollectionProps,
): StateCreator<CollectionSlice, [], [], CollectionSlice> => (_set, _get, _store) => {
  // Private, mutable registry for bookkeeping purposes
  const registry = new Map<ItemKey, RegistryItem>();
  let registryHasChanged = true; // Dirty flag to track whether the registry has changed since it was last processed

  const queryItemElements = () => {
    const el = ref.current;
    if (!(el instanceof HTMLElement)) { return []; }

    const elements = el.querySelectorAll(`[data-bk-coll-parent=${JSON.stringify(collectionId)}]`);
    return Array.from(elements) as Array<HTMLElement>;
  };

  const queryItemKeysOrdered = () => {
    return queryItemElements().map(el => el.dataset.bkCollItem).filter((key): key is ItemKey => key !== undefined);
  };

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
    
    collectionItemByKey: itemKey => registry.get(itemKey) ?? null,
    collectionItemKeys: () => new Set(registry.keys()),
    collectionIsEmpty: () => registry.size === 0,
    collectionItemElements: queryItemElements,
    collectionItemKeysOrdered: queryItemKeysOrdered,
    collectionFocusItem: itemKey => {
      const item = registry.get(itemKey) ?? null;
      if (item) {
        focusItem(item, ref.current);
      }
    },
    collectionFocusItemAt: pos => {
      const itemElements = queryItemElements();

      switch (pos) {
        case 'first': {
          const itemFirst = itemElements.at(0);
          if (itemFirst) {
            focusItem(itemFirst, ref.current);
          }
          break;
        }
        case 'last': {
          const itemLast = itemElements.at(itemElements.length - 1);
          if (itemLast) {
            focusItem(itemLast, ref.current);
          }
          break;
        }
        default: throw new Error(`Unexpected position '${pos satisfies never}'`);
      }
    },
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
  const collectionItemKeys = useStore(store, state => state.collectionItemKeys);
  
  // `useLayoutEffect` on the collection parent is guaranteed to run after all the component children have rerendered.
  // If any items were added/removed in this rerender batch, then `consumeRegistryChange` will return `true`. Caveat:
  // merely reordering the elements (e.g. two items swap) does not trigger a layout effect in React, hence the registry
  // must be considered unordered.
  React.useLayoutEffect(() => {
    if (consumeChange()) {
      onItemsChange?.(collectionItemKeys());
    }
  });
  
  return {
    props: {
      'data-bk-coll-id': collectionId,
    },
  };
};

type UseCollectionItemWithParams = { itemKey: ItemKey };
type UseCollectionItemWithResult<E extends HTMLElement> = {
  props: { ref: React.RefCallback<E>, 'data-bk-coll-parent': string, 'data-bk-coll-item': string },
};
export const useCollectionItemWith = <E extends HTMLElement>(
  store: StoreApi<CollectionSlice>,
  { itemKey }: UseCollectionItemWithParams,
): UseCollectionItemWithResult<E> => {
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

export const useCollection = <E extends HTMLElement = HTMLElement>(
  params: UseCollectionParams = {},
) => {
  const collectionId = React.useId();
  
  const ref = React.useRef<E>(null);
  const store = useMemoOnce(() => createStore(createCollectionSlice(ref, { collectionId })));
  
  const context = useMemoOnce(() => ({ store }));
  
  const { props: collProps } = useCollectionWith(store, params);
  return {
    store,
    context,
    Provider: CollectionContext,
    props: mergeProps({ ref }, collProps),
  };
};

type UseCollectionItemResult<E extends HTMLElement> = {
  store: CollectionContext['store'],
  props: {
    ref: React.RefCallback<E>,
    'data-bk-coll-parent': string,
    'data-bk-coll-item': string,
  },
};
export const useCollectionItem = <E extends HTMLElement>(
  params: UseCollectionItemWithParams,
): UseCollectionItemResult<E> => {
  const { itemKey } = params;
  
  const { store } = useCollectionContext();
  const { props } = useCollectionItemWith(store, { itemKey });
  
  return { store, props };
};
  
export const useCollectionTypeAhead = (
  containerRef: React.RefObject<null | HTMLElement>,
  store: StoreApi<CollectionSlice>,
) => {
  const { sequence, handleKeyDown: typeAheadHandleKeyDown } = useTypeAhead();

  const collectionId = useStore(store, state => state.collectionId);
  const getItemElements = React.useEffectEvent(useStore(store, state => state.collectionItemElements));

  // biome-ignore lint/correctness/useExhaustiveDependencies(containerRef.current): It's a ref, don't use as dep.
  React.useEffect(() => {
    const query: string = removeCombiningCharacters(sequence.join(''));
    if (query.trim() === '') { return; }

    let itemEls = getItemElements();
    const focusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    // Cycle the elements such that the focused item (if any) comes first. This is so that the type-ahead search will
    // always continue from the current focused element.
    const focusedNodeIndex = focusedElement ? itemEls.indexOf(focusedElement) : -1;
    if (focusedNodeIndex) {
      itemEls = [...itemEls.slice(focusedNodeIndex), ...itemEls.slice(0, focusedNodeIndex)];
    }

    for (const itemEl of itemEls) {
      if (!(itemEl instanceof HTMLElement)) { continue; }
      if (itemEl === document.activeElement) { continue; }

      const elementText = itemEl.innerText ?? '';
      const elementTextNormalized = removeCombiningCharacters(elementText).replaceAll(/\s+/g, '');

      if (elementText.trim() !== '' && elementTextNormalized.startsWith(query)) {
        focusItem(itemEl, containerRef.current);
        break;
      }
    }
  }, [sequence]);

  const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
    // Ignore key events coming from things other than items
    if (!(event.target instanceof HTMLElement)) { return; }
    if (event.target.dataset.bkCollParent !== collectionId) { return; }

    typeAheadHandleKeyDown(event);
  }, [collectionId, typeAheadHandleKeyDown]);

  return {
    props: {
      onKeyDown: handleKeyDown,
    },
  };
};


export const _internalKeyForTestingOnly: typeof consumeRegistryChange = consumeRegistryChange;
