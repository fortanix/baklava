/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { type RequireOnly } from '../../util/types.ts';
import { removeCombiningCharacters } from '../../util/formatting.ts';

import * as React from 'react';
import { mergeCallbacks, useMemoOnce } from '../../util/reactUtil.ts';
import { type StoreApi, createStore, useStore } from 'zustand';

import { useTypeAhead } from '../../util/hooks/useTypeAhead.ts';


/*
Store for a composable list with support for multiple selected items.
*/

/**
 * The minimal subtype of `Array` that we need to be able to render a virtualized list. We keep it minimal
 * so that the consumer may compute this information dynamically rather than storing it all in memory. For best
 * performance, each of the defined operations should be computable in (or close to) O(1), this may require some
 * caching (e.g. maintaining a reverse lookup table for `indexOf`).
 */
export type MinimalArray<T> = Pick<ReadonlyArray<T>, 'length' | 'at' | 'indexOf'>;
export const MinimalArrayUtil = {
  /** Find the index of the given `key`, or `null` if not found in the array. */
  indexForKey: <T,>(minimalArray: MinimalArray<T>, key: T): null | number => {
    const index = minimalArray.indexOf(key);
    return index >= 0 ? index : null;
  },
};

/** Unique key of an item. */
export type ItemKey = string;
/** Definition of a registered item. */
export type ItemDef = {
  itemRef: React.RefObject<null | HTMLElement>,
  isContentItem: boolean, // Whether this counts as "content" (so not: headers, sticky actions)
};
export type ItemMap = Map<ItemKey, ItemDef>;
export type ItemWithKey = ItemDef & { itemKey: ItemKey };

export type ItemDetails = { label: string };

const internalKey = Symbol('baklava.CompositeStore.internal');
type CompositeInternal = {
  /**
   * Used to track the items that have been rendered. Note: this property is internal only, it should not be accessed
   * by consumers. The `Map` is mutated in place for performance, since there may be a lot of items. On initial render,
   * we get N registrations, an immutable update taking O(N) would result in O(N^2) updates which is not acceptable.
   */
  itemsRegistry: ItemMap,
  
  /**
   * Keep track of the items count. Cannot be derived from `itemsRegistry`, because it is mutable and so does
   * not trigger updates.
   */
  itemsCount: number,
};

export type CompositeState = {
  /** Internal bookkeeping. */
  [internalKey]: CompositeInternal,
  
  /** Globally unique ID for the composite component (e.g. for ARIA attributes). */
  id: string,
  
  /** Whether the composite component is currently disabled or not. */
  disabled: boolean,
  
  /** The currently focused item (if any). */
  focusedItem: null | ItemKey,
  
  /** The currently selected items. */
  selectedItems: Set<ItemKey>,
  
  /**
   * If the list is virtually rendered, `virtualItemKeys` should be provided with the full list of item keys. This list
   * should be ordered in the same way as the items are rendered on screen.
   */
  virtualItemKeys: null | MinimalArray<ItemKey>,
};
export type CompositeStateApi = CompositeState & {
  /** Whether the composite component is empty (no content items). */
  isEmpty: () => boolean,
  
  /** Update `virtualItemKeys`. */
  setVirtualItemKeys: (virtualItemKeys: null | MinimalArray<ItemKey>) => void,
  
  /** Get the position (integer between 0 and n-1) of the given item in the list, or `null` if not found. */
  getItemPosition: (itemKey: ItemKey) => null | number,
  
  /** Request the given `itemKey` to be focused. If `null`, unset focus. */
  focusItem: (item: null | ItemKey) => void,
  
  /** Request the item at the given position in the list to be focused. If no items, this is ignored. */
  focusItemAt: (position: 'first' | 'last') => void,
  
  /** Update the selected items state to the given set. */
  setSelectedItems: (itemKeys: Set<ItemKey>) => void,
  
  /** Toggle the selected state of the given item. Returns the new selected state of the item. */
  toggleItemSelection: (itemKey: ItemKey) => boolean,
};

// Ref: https://zustand.docs.pmnd.rs/guides/initialize-state-with-props#wrapping-the-context-provider

export type CompositeProps = RequireOnly<CompositeState, 'id'>;
export type CompositeStore = StoreApi<CompositeStateApi>;
export const createCompositeStore = <E extends HTMLElement>(
  _ref: React.RefObject<null | E>,
  props: CompositeProps,
): CompositeStore => {
  // FIXME: do we need `ref`?
  
  const propsWithDefaults: CompositeState = {
    [internalKey]: {
      itemsRegistry: new Map(),
      itemsCount: 0,
    },
    disabled: false,
    focusedItem: null,
    selectedItems: new Set(),
    virtualItemKeys: null,
    ...props,
  };
  return createStore<CompositeStateApi>()((set, get) => ({
    ...propsWithDefaults,
    isEmpty: () => get()[internalKey].itemsCount === 0,
    setVirtualItemKeys: virtualItemKeys => set({ virtualItemKeys }),
    getItemPosition: (itemKey: ItemKey): null | number => {
      const state = get();
      
      const virtualItemKeys = state.virtualItemKeys;
      if (virtualItemKeys) {
        return MinimalArrayUtil.indexForKey(virtualItemKeys, itemKey);
      } else {
        // FIXME 1: cache the reverse mapping (track the index)
        // FIXME 2: there's no guarantee that the registry is ordered by DOM position
        return MinimalArrayUtil.indexForKey([...state[internalKey].itemsRegistry.keys()], itemKey);
      }
    },
    focusItem: itemKey => {
      const state = get();
      if (state.focusedItem === itemKey) {
        // Already focused; avoid redundant focus that might re-enter
        return;
      }
      set({ focusedItem: itemKey });
      
      if (itemKey !== null) {
        const itemTargetRef = get()[internalKey].itemsRegistry.get(itemKey)?.itemRef;
        
        // Note: this only works if the item is already rendered, for virtual lists the component will need to handle
        // the scroll.
        const element = itemTargetRef?.current as undefined | HTMLElement;
        if (element && document.activeElement !== element) {
          element.focus({ focusVisible: false });
        }
      }
    },
    focusItemAt: position => {
      const state = get();
      const virtualItemKeys = state.virtualItemKeys;
      const registeredItems = state[internalKey].itemsRegistry;
      const registeredItemKeys = [...registeredItems.keys()]; // FIXME: sort registered items?
      
      // Get the complete list of item keys (possibly lazily computed in case of virtualization)
      const itemKeys: MinimalArray<ItemKey> = virtualItemKeys ?? registeredItemKeys;
      
      const itemKey = itemKeys.at(position === 'first' ? 0 : -1) ?? null;
      if (itemKey !== null) {
        state.focusItem(itemKey);
      }
    },
    setSelectedItems: itemKeys => {
      set({ selectedItems: itemKeys });
    },
    toggleItemSelection: itemKey => {
      const selectedItems = get().selectedItems;
      
      const isSelected = selectedItems.has(itemKey);
      
      const selectedItemsUpdated = new Set(selectedItems);
      if (isSelected) {
        selectedItemsUpdated.delete(itemKey);
      } else {
        selectedItemsUpdated.add(itemKey);
      }
      
      set({ selectedItems: selectedItemsUpdated });
      return !isSelected;
    },
  }));
};


//
// Event handlers
//

/**
 * Keyboard event handler for the composite component to handle keyboard interactions (e.g. arrow key navigation).
 * 
 * @see {@link https://www.w3.org/WAI/ARIA/apg/patterns/listbox}
 */
const handleKeyboardInteractions = (store: CompositeStore) => (event: React.KeyboardEvent) => {
  try {
    const state = store.getState();
    const virtualItemKeys = state.virtualItemKeys;
    const registeredItems = state[internalKey].itemsRegistry;
    const registeredItemKeys = [...registeredItems.keys()]; // FIXME: sort registered items?
    
    // Get the complete list of item keys (possibly lazily computed in case of virtualization)
    const itemKeys: MinimalArray<ItemKey> = virtualItemKeys ?? registeredItemKeys;
    
    // NOTE: we assume that all items are focusable, even disabled ones (this is also recommended by the WCAG standard)
    const firstFocusableItem = itemKeys.at(0);
    if (typeof firstFocusableItem === 'undefined') { return; } // If no focusable items, no interactions needed
    
    const focusedItemKey: ItemKey = state.focusedItem ?? firstFocusableItem;
    const focusedItemIndex: null | number = MinimalArrayUtil.indexForKey(itemKeys, focusedItemKey);
    if (focusedItemIndex === null) { throw new Error(`Unable to resolve focused item '${focusedItemKey}'`); }
    
    // Determine the index of the item to focus based on the keyboard event. If `null`, do not navigate.
    const pageSize = 10; // TODO: could we make this dynamic based on scrollport height?
    const itemTargetIndex = ((): null | number => {
      // Note: list boxes should not "cycle" (e.g. going beyond the last item should not go to the first)
      // FIXME: make this configurable so we can use it for things other than list box controls
      switch (event.key) {
        case ' ': return focusedItemIndex;
        case 'ArrowUp': return Math.max(0, focusedItemIndex - 1);
        case 'ArrowDown': return Math.min(itemKeys.length - 1, focusedItemIndex + 1);
        case 'Home': return 0; // On Mac: Fn + ArrowLeft
        case 'End': return -1; // On Mac: Fn + ArrowRight
        case 'PageUp': return Math.max(0, focusedItemIndex - pageSize); // On Mac: Fn + ArrowUp
        case 'PageDown': return Math.min(itemKeys.length - 1, focusedItemIndex + pageSize); // On Mac: Fn + ArrowDown
        default: return null;
      }
    })();
    
    // 'Enter' key should still cause default behavior, like form submit. If the list box is part of a combo box or
    // other kind of drop down, then Enter should cause a selection + close, but this should be handled at the parent.
    if (event.key === 'Enter') { return; }
    
    // 'Space' key should trigger the item's own event handler (e.g. click event for <button> elements), so that it
    // can handle things like disabled state.
    if (event.key === ' ') { return; }
    
    if (itemTargetIndex !== null) {
      const itemTargetKey = itemKeys.at(itemTargetIndex);
      if (typeof itemTargetKey === 'undefined') { throw new Error(`Cannot resolve target index '${itemTargetKey}'`); }
      
      event.preventDefault(); // Prevent default behavior, like scrolling
      event.stopPropagation(); // Prevent the key event from triggering other behavior at higher levels
      
      state.focusItem(itemTargetKey);
    }
  } catch (error) {
    // If an assumption fails, log the error but don't crash
    console.error(error);
  }
};

const useCompositeTypeAhead = (store: StoreApi<CompositeStateApi>) => {
  const typeAhead = useTypeAhead();
  
  React.useEffect(() => {
    const state = store.getState();
    if (!state) { return; }
    
    const query: string = removeCombiningCharacters(typeAhead.sequence.join(''));
    
    if (query.trim() === '') { return; }
    
    for (const [itemKey, item] of state[internalKey].itemsRegistry) {
      const elementRef = item.itemRef.current;
      const elementText = elementRef?.innerText ?? null;
      const elementTextStripped = removeCombiningCharacters(elementText ?? '').replaceAll(/\s+/g, '');
      
      if (elementText !== null && elementTextStripped.startsWith(query)) {
        state.focusItem(itemKey);
        break;
      }
    }
  }, [store, typeAhead.sequence]);
  
  return typeAhead;
};


//
// Context + hooks
//

export const CompositeContext = React.createContext<null | CompositeStore>(null);

export const useCompositeSelector = <T,>(selector: (state: CompositeStateApi) => T, storeParam?: CompositeStore): T => {
  const storeFromContext = React.use(CompositeContext);
  const store = storeParam ?? storeFromContext;
  
  if (!store) { throw new Error('Missing CompositeContext provider'); }
  
  return useStore(store, selector);
};


export type UseCompositeResult<E extends HTMLElement> = {
  /** The composite store. */
  store: CompositeStore,
  /** The context provider element for the composite context. */
  Provider: (props: React.PropsWithChildren) => React.ReactNode,
  /** Some props that should be applied to the composite element. */
  // Note: using `div` here as a proxy for `E` (since there is no easy way to get the `ComponentProps` for a generic
  // `HTMLElement in the React types).
  props: Pick<React.ComponentProps<'div'>, 'className' | 'onKeyDown' | 'onToggle'> & {
    ref: React.RefObject<null | E>,
  },
};
/** Set up a composite component store. */
export const useComposite = <E extends HTMLElement>(
  /** Props to configure the composite store. */
  props: CompositeProps,
): UseCompositeResult<E> => {
  const ref = React.useRef<E>(null);
  
  const store = useMemoOnce<CompositeStore>(() => createCompositeStore(ref, props));
  
  const Provider = React.useCallback(({ children }: React.PropsWithChildren) =>
    <CompositeContext value={store}>{children}</CompositeContext>,
    [],
  );
  
  const typeAhead = useCompositeTypeAhead(store);
  
  const handleKeyDown = React.useMemo(() => {
    const store = storeRef.current;
    if (!store) { return undefined; }
    
    // FIXME: just pass the `storeRef` to `handleKeyboardInteractions` and let it handle the `current` null check?
    return mergeCallbacks([
      handleKeyboardInteractions(store),
      typeAhead.handleKeyDown,
    ]);
  }, [typeAhead.handleKeyDown]);
  
  return {
    store: storeRef.current,
    Provider,
    props: {
      ref,
      onKeyDown: handleKeyDown,
    },
  };
};


export type UseCompositeItemResult = {
  id: string,
  disabled: boolean,
  itemPosition: null | number, // Position of this item in the total collection, or `null` if unknown
  isFocused: boolean,
  requestFocus: () => void,
  isSelected: boolean,
  toggleSelection: () => boolean,
};
/** Register an element as an item within the nearest composite context. */
export const useCompositeItem = (item: ItemWithKey): UseCompositeItemResult => {
  const store = React.use(CompositeContext);
  if (store === null) { throw new Error(`Missing CompositeContext provider`); }
  
  const id = useStore(store, s => s.id);
  const disabled = useStore(store, s => s.disabled);
  
  const itemPosition = useStore(store, s => s.getItemPosition(item.itemKey));
  
  // Register the item
  React.useEffect(() => {
    store.setState(state => {
      state[internalKey].itemsRegistry.set(item.itemKey, item); // Mutate to prevent frequent rerendering
      
      const stateUpdated = { ...state };
      
      if (item.isContentItem) {
        stateUpdated[internalKey].itemsCount += 1;
      }
      
      if (state.focusedItem === null) {
        stateUpdated.focusedItem = item.itemKey; // Immutable update
      }
      
      return stateUpdated;
    });
    return () => {
      store.setState(state => {
        state[internalKey].itemsRegistry.delete(item.itemKey); // Mutate to prevent frequent rerendering
        
        const stateUpdated = { ...state };
        
        if (item.isContentItem) {
          // Immutable update, since we do want to trigger updates in case this hits 0
          stateUpdated[internalKey].itemsCount -= 1;
        }
        
        if (state.focusedItem === item.itemKey) {
          const firstKey = state[internalKey].itemsRegistry.keys().next();
          const focusedItem = firstKey.done ? null : firstKey.value;
          
          stateUpdated.focusedItem = focusedItem; // Immutable update
        }
        
        return stateUpdated;
      });
    };
  }, [store, item]);
  
  // Make sure the following selectors return primitives or existing references, not new object references
  const isFocused = useStore(store, s => s.focusedItem === item.itemKey);
  const focusItem = useStore(store, s => s.focusItem);
  const requestFocus = React.useCallback(() => {
    focusItem(item.itemKey);
  }, [item.itemKey, focusItem]);
  
  const isSelected = useStore(store, s => s.selectedItems.has(item.itemKey));
  const toggleItemSelection = useStore(store, s => s.toggleItemSelection);
  const toggleSelection = React.useCallback(() => {
    focusItem(item.itemKey);
    return toggleItemSelection(item.itemKey);
  }, [item.itemKey, toggleItemSelection, focusItem]);
  
  return {
    id: `${id}_${item.itemKey}`,
    disabled,
    
    itemPosition,
    
    isFocused,
    requestFocus,
    
    isSelected,
    toggleSelection,
  };
};
