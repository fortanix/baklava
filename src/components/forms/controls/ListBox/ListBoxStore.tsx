/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { type RequireOnly } from '../../../../util/types.ts';
import { removeCombiningCharacters } from '../../../../util/formatting.ts';

import * as React from 'react';
import { mergeCallbacks } from '../../../../util/reactUtil.ts';
import { type StoreApi, createStore, useStore } from 'zustand';

import { useTypeAhead } from '../../../../util/hooks/useTypeAhead.ts';


/*
Store for a composable list box with (up to) a single selected item state.
*/

/** Unique key of an item. */
export type ItemKey = string;
/** Definition of a registered item. */
export type ItemDef = {
  itemRef: React.RefObject<null | HTMLElement>,
  isContentItem: boolean, // Whether this counts as "content" (so not: headers, sticky actions)
};
export type ItemMap = Map<ItemKey, ItemDef>;
export type ItemWithKey = ItemDef & { itemKey: ItemKey };

export type ItemDetails = { itemKey: ItemKey, label: string };

/**
 * The minimal subtype of `Array<ItemKey>` that we need to be able to render a virtualized list. We keep it minimal
 * so that the consumer may compute this information dynamically rather than storing it all in memory. For best
 * performance, each of the defined operations should be computable in (or close to) O(1), this may require some
 * caching (e.g. maintaining a reverse lookup table for `indexOf`).
 */
export type VirtualItemKeys = Pick<ReadonlyArray<ItemKey>, 'length' | 'at' | 'indexOf'>;
export const VirtualItemKeysUtil = {
  /** Find the index of the given `itemKey`, or `null` if not found in the list. */
  indexForItemKey: (virtualItemKeys: VirtualItemKeys, itemKey: ItemKey): null | number => {
    const index = virtualItemKeys.indexOf(itemKey);
    return index >= 0 ? index : null;
  },
};


export type ListBoxState = {
  /**
   * Used to track the items that have been rendered. Note: this property is internal only, it should not be accessed
   * by consumers. The `Map` is mutated in place for performance, since there may be a lot of items. On initial render,
   * we get N registrations, an immutable update taking O(N) would result in O(N^2) updates which is not acceptable.
   */
  _internalItemsRegistry: ItemMap,
  
  /**
   * Keep track of the items count. Cannot be derived from `_internalItemsRegistry`, because it is mutable and so does
   * not trigger updates.
   */
  _internalItemsCount: number,
  
  /** Globally unique ID for the list box control (e.g. for ARIA attributes). */
  id: string,
  
  /** Whether the list box control is currently disabled or not. */
  disabled: boolean,
  
  /** The currently focused item (if any). */
  focusedItem: null | ItemKey,
  
  /** The currently selected item (if any). */
  selectedItem: null | ItemKey,
  
  /**
   * If the list is virtually rendered, `virtualItemKeys` should be provided with the full list of item keys. This list
   * should be ordered in the same way as the items are rendered on screen.
   */
  virtualItemKeys: null | VirtualItemKeys,
};
export type ListBoxStateApi = ListBoxState & {
  /** Whether the list box is empty (no content items). */
  isEmpty: () => boolean,
  
  /** Update `virtualItemKeys`. */
  setVirtualItemKeys: (virtualItemKeys: null | VirtualItemKeys) => void,
  
  /** Get the position (integer between 0 and n-1) of the given item in the list, or `null` if not found. */
  getItemPosition: (itemKey: ItemKey) => null | number,
  
  /** Request the given `itemKey` to be focused. If `null`, unset focus. */
  focusItem: (item: null | ItemKey) => void,
  
  /** Request the item at the given position in the list to be focused. If no items, this is ignored. */
  focusItemAt: (position: 'first' | 'last') => void,
  
  /** Request the given `itemKey` to be selected. If `null`, unset selection. */
  selectItem: (itemKey: null | ItemKey) => void,
};

// Ref: https://zustand.docs.pmnd.rs/guides/initialize-state-with-props#wrapping-the-context-provider

export type ListBoxProps = RequireOnly<ListBoxState, 'id'>;
export const createListBoxStore = <E extends HTMLElement>(_ref: React.RefObject<null | E>, props: ListBoxProps) => {
  // FIXME: do we need `ref`?
  
  const propsWithDefaults: ListBoxState = {
    _internalItemsRegistry: new Map(),
    _internalItemsCount: 0,
    disabled: false,
    focusedItem: null,
    selectedItem: null,
    virtualItemKeys: null,
    ...props,
  };
  return createStore<ListBoxStateApi>()((set, get) => ({
    ...propsWithDefaults,
    isEmpty: () => get()._internalItemsCount === 0,
    setVirtualItemKeys: virtualItemKeys => set({ virtualItemKeys }),
    getItemPosition: (itemKey: ItemKey): null | number => {
      const state = get();
      
      const virtualItemKeys = state.virtualItemKeys;
      if (virtualItemKeys) {
        return VirtualItemKeysUtil.indexForItemKey(virtualItemKeys, itemKey);
      } else {
        // FIXME 1: cache the reverse mapping (track the index)
        // FIXME 2: there's no guarantee that the registry is ordered by DOM position
        return VirtualItemKeysUtil.indexForItemKey([...state._internalItemsRegistry.keys()], itemKey);
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
        const itemTargetRef = get()._internalItemsRegistry.get(itemKey)?.itemRef;
        
        // Note: this only works if the item is already rendered, for virtual lists the component will need to handle
        // the scroll.
        const element = itemTargetRef?.current as undefined | HTMLElement;
        if (element && document.activeElement !== element) {
          element.focus({
            // @ts-ignore Supported in some browsers (e.g. Firefox).
            focusVisible: false,
          });
        }
      }
    },
    focusItemAt: position => {
      const state = get();
      const virtualItemKeys = state.virtualItemKeys;
      const registeredItems = state._internalItemsRegistry;
      const registeredItemKeys = [...registeredItems.keys()]; // FIXME: sort registered items?
      
      // Get the complete list of item keys (possibly lazily computed in case of virtualization)
      const itemKeys: VirtualItemKeys = virtualItemKeys ?? registeredItemKeys;
      
      const itemKey = itemKeys.at(position === 'first' ? 0 : -1) ?? null;
      if (itemKey !== null) {
        state.focusItem(itemKey);
      }
    },
    selectItem: itemKey => { set({ selectedItem: itemKey }); },
  }));
};
export type ListBoxStore = ReturnType<typeof createListBoxStore>;


//
// Event handlers
//

/**
 * Keyboard event handler for the list box to handle keyboard interactions (e.g. arrow key navigation).
 * 
 * @see {@link https://www.w3.org/WAI/ARIA/apg/patterns/listbox}
 */
export const handleKeyboardInteractions = (store: ListBoxStore) => (event: React.KeyboardEvent) => {
  try {
    const state = store.getState();
    const virtualItemKeys = state.virtualItemKeys;
    const registeredItems = state._internalItemsRegistry;
    const registeredItemKeys = [...registeredItems.keys()]; // FIXME: sort registered items?
    
    // Get the complete list of item keys (possibly lazily computed in case of virtualization)
    const itemKeys: VirtualItemKeys = virtualItemKeys ?? registeredItemKeys;
    
    const selectedItemKey = state.selectedItem;
    
    // NOTE: we assume that all items are focusable, even disabled ones (this is also recommended by the WCAG standard)
    const firstFocusableItem = itemKeys.at(0);
    if (typeof firstFocusableItem === 'undefined') { return; } // If no focusable items, no interactions needed
    
    const focusedItemKey: ItemKey = state.focusedItem ?? selectedItemKey ?? firstFocusableItem;
    const focusedItemIndex: null | number = VirtualItemKeysUtil.indexForItemKey(itemKeys, focusedItemKey);
    if (focusedItemIndex === null) { throw new Error(`Unable to resolve focused item '${focusedItemKey}'`); }
    
    // Determine the index of the item to focus based on the keyboard event. If `null`, do not navigate.
    const pageSize = 10; // TODO: could we make this dynamic based on scrollport height?
    const itemTargetIndex = ((): null | number => {
      // Note: list boxes should not "cycle" (e.g. going beyond the last item should not go to the first)
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

export const useListBoxTypeAhead = (storeRef: React.RefObject<null | StoreApi<ListBoxStateApi>>) => {
  const typeAhead = useTypeAhead();
  
  React.useEffect(() => {
    const state = storeRef.current?.getState();
    if (!state) { return; }
    
    const query: string = removeCombiningCharacters(typeAhead.sequence.join(''));
    
    if (query.trim() === '') { return; }
    
    for (const [itemKey, item] of state._internalItemsRegistry) {
      const elementRef = item.itemRef.current;
      const elementText = elementRef?.innerText ?? null;
      const elementTextStripped = removeCombiningCharacters(elementText ?? '').replaceAll(/\s+/g, '');
      
      if (elementText !== null && elementTextStripped.startsWith(query)) {
        state.focusItem(itemKey);
        break;
      }
    }
  }, [storeRef, typeAhead.sequence]);
  
  return typeAhead;
};


//
// Context
//

export const ListBoxContext = React.createContext<null | ListBoxStore>(null);

export const useListBoxSelector = <T,>(selector: (state: ListBoxStateApi) => T, storeParam?: ListBoxStore): T => {
  const storeFromContext = React.use(ListBoxContext);
  const store = storeParam ?? storeFromContext;
  if (!store) { throw new Error('Missing ListBoxContext provider'); }
  return useStore(store, selector);
};

export type UseListBoxResult<E extends HTMLElement> = {
  /** The list box store. */
  store: ListBoxStore,
  /** The context provider element for the list box context. */
  Provider: (props: React.PropsWithChildren) => React.ReactNode,
  /** Some props that should be applied to the list box element. */
  // Note: using `div` here as a proxy for `E` (since there is no easy way to get the `ComponentProps` for a generic
  // `HTMLElement in the React types).
  props: Pick<React.ComponentProps<'div'>, 'className' | 'onKeyDown' | 'onToggle'> & {
    ref: React.RefObject<null | E>,
  },
};
export const useListBox = <E extends HTMLElement>(
  ref: React.RefObject<null | E>,
  props: ListBoxProps,
): UseListBoxResult<E> => {
  const storeRef = React.useRef<ListBoxStore>(null);
  if (!storeRef.current) {
    storeRef.current = createListBoxStore(ref, props);
  }
  
  const Provider = React.useCallback(
    ({ children }: React.PropsWithChildren) =>
      <ListBoxContext value={storeRef.current}>{children}</ListBoxContext>,
    [],
  );
  
  const typeAhead = useListBoxTypeAhead(storeRef);
  
  const handleKeyDown = React.useMemo(() => {
    if (storeRef.current) {
      return mergeCallbacks([
        handleKeyboardInteractions(storeRef.current),
        typeAhead.handleKeyDown,
      ]);
    }
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

export type UseListBoxItemResult = {
  id: string,
  disabled: boolean,
  itemPosition: null | number, // Position of this item in the total collection, or `null` if unknown
  isFocused: boolean,
  requestFocus: () => void,
  isSelected: boolean,
  requestSelection: () => void,
};
export const useListBoxItem = (item: ItemWithKey): UseListBoxItemResult => {
  const store = React.use(ListBoxContext);
  if (store === null) { throw new Error(`Missing ListBoxContext provider`); }
  
  const id = useStore(store, s => s.id);
  const disabled = useStore(store, s => s.disabled);
  
  const itemPosition = useStore(store, s => s.getItemPosition(item.itemKey));
  
  // Register the item
  React.useEffect(() => {
    store.setState(state => {
      state._internalItemsRegistry.set(item.itemKey, item); // Mutate to prevent frequent rerendering
      
      const stateUpdated = { ...state };
      
      if (item.isContentItem) {
        stateUpdated._internalItemsCount += 1;
      }
      
      if (state.focusedItem === null) {
        stateUpdated.focusedItem = item.itemKey; // Immutable update
      }
      
      return stateUpdated;
    });
    return () => {
      store.setState(state => {
        state._internalItemsRegistry.delete(item.itemKey); // Mutate to prevent frequent rerendering
        
        const stateUpdated = { ...state };
        
        if (item.isContentItem) {
          // Immutable update, since we do want to trigger updates in case this hits 0
          stateUpdated._internalItemsCount -= 1;
        }
        
        if (state.focusedItem === item.itemKey) {
          const firstKey = state._internalItemsRegistry.keys().next();
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
  
  const isSelected = useStore(store, s => s.selectedItem === item.itemKey);
  const selectItem = useStore(store, s => s.selectItem);
  const requestSelection = React.useCallback(() => {
    selectItem(item.itemKey)
    focusItem(item.itemKey);
  }, [item.itemKey, selectItem, focusItem]);
  
  return {
    id: `${id}_${item.itemKey}`,
    disabled,
    
    itemPosition,
    
    isFocused,
    requestFocus,
    
    isSelected,
    requestSelection,
  };
};
