
import { removeCombiningCharacters } from '../../../../util/formatting.ts';

import * as React from 'react';
import { mergeCallbacks } from '../../../../util/reactUtil.ts';
import { type StoreApi, createStore, useStore } from 'zustand';

import { isItemProgrammaticallyFocusable } from '../../../util/composition/compositionUtil.ts';
import { useTypeAhead } from '../../../../util/hooks/useTypeAhead.ts';


/*
Store for a composable list box with (up to) a single selected item state.
*/

// Unique key of an item
export type ItemKey = string;

// Definition of a (registered) item
export type ItemDef = {
  itemKey: ItemKey,
  itemRef: React.RefObject<null | HTMLElement>,
};

export const ItemListUtil = {
  sortItems: (items: Map<ItemKey, ItemDef>): Map<ItemKey, ItemDef> => {
    // XXX once iterator helpers are supported we could skip the intermediate array
    return new Map([...items.entries()].sort(([, item1], [, item2]) => {
      const itemRef1 = item1.itemRef.current;
      const itemRef2 = item2.itemRef.current;
      if (!itemRef1 || !itemRef2) { return 0; }
      
      const pos = itemRef1.compareDocumentPosition(itemRef2);
      return (pos & Node.DOCUMENT_POSITION_PRECEDING) ? 1 : -1;
    }));
  },
  
  withItemAdded: (items: Map<ItemKey, ItemDef>, itemNew: ItemDef): Map<ItemKey, ItemDef> => {
    // Check for duplicate keys to prevent thrashing the store
    if (items.has(itemNew.itemKey)) {
      console.warn(`Duplicate item key: ${itemNew.itemKey}`);
      return items;
    }
    
    const itemsUpdated = new Map(items);
    itemsUpdated.set(itemNew.itemKey, itemNew);
    
    // FIXME: sort?
    //itemsRef.current = ItemListUtil.sortItems(itemsRef.current);
    
    return itemsUpdated;
  },
  
  withItemRemoved: (items: Map<ItemKey, ItemDef>, itemKey: ItemKey): Map<ItemKey, ItemDef> => {
    const itemsUpdated = new Map<ItemKey, ItemDef>(items)
    itemsUpdated.delete(itemKey);
    return itemsUpdated;
  },
};


export type ListBoxProps = {
  /** Unique ID for the list box component (e.g. for ARIA attributes). */
  id: string,
  
  /** Whether the list box component is currently disabled or not. */
  disabled: boolean,
  
  /** The items displayed in the list. */
  items: Map<ItemKey, ItemDef>,
  
  /** If the list is virtualized, this should be set with the ordered list of all the item keys. */
  virtualItemKeys?: undefined | Array<ItemKey>,
  
  /** The currently selected item (up to one at a time). */
  focusedItem: null | ItemKey,
  
  /** The currently selected item (up to one at a time). */
  selectedItem: null | ItemKey,
};
export type ListBoxState = ListBoxProps & {
  /** Request the given `itemKey` to be focused. If `null`, unset focus. */
  focusItem: (item: ItemKey) => void,
  
  /** Request the given `itemKey` to be selected. If `null`, unset selection. */
  selectItem: (itemKey: null | ItemKey) => void,
  
  /** Get the total number of items in the list. */
  getTotalItems: () => number,
};

// Ref: https://zustand.docs.pmnd.rs/guides/initialize-state-with-props#wrapping-the-context-provider
export const createListBoxStore = (initProps: Partial<ListBoxProps>) => {
  const defaultProps: ListBoxProps = {
    id: '', // FIXME: should be required
    disabled: false,
    items: new Map(),
    focusedItem: null,
    selectedItem: null,
  };
  return createStore<ListBoxState>()((set, get) => ({
    ...defaultProps,
    ...initProps,
    focusItem: item => set(() => ({ focusedItem: item })),
    selectItem: item => set(() => ({ selectedItem: item })),
    getTotalItems: () => get().virtualItemKeys?.length ?? get().items.size,
  }));
};

export type ListBoxStore = ReturnType<typeof createListBoxStore>;


export const handleKeyboardInteractions = (store: ListBoxStore) => (event: React.KeyboardEvent) => {
  try {
    const state = store.getState();
    const selectedItemKey = state.selectedItem;
    
    const itemKeys = state.virtualItemKeys ?? [...ItemListUtil.sortItems(state.items).keys()];
    
    // Filter out any items that are not (programmatically) focusable.
    const itemKeysFocusable: Array<ItemKey> = itemKeys
      .filter(itemKey => {
        const itemDef: undefined | ItemDef = state.items.get(itemKey);
        if (typeof itemDef === 'undefined') { throw new Error(`Should not happen`); }
        
        const itemRef: null | HTMLElement = itemDef.itemRef.current;
        if (itemRef === null) {
          if (typeof state.virtualItemKeys !== 'undefined') {
            // TODO: maybe `virtualItemKeys` should only include those items that are focusable?
            return true; // The item may not be rendered yet, so we don't know if it is focusable or not
          } else {
            throw new Error(`Should not happen`);
          }
        }
        
        return isItemProgrammaticallyFocusable(itemRef);
      });
    
    const firstFocusableItem = itemKeysFocusable.at(0);
    if (typeof firstFocusableItem === 'undefined') { return; } // If no focusable items, no interactions needed
    
    const focusedItemKey = state.focusedItem ?? selectedItemKey ?? firstFocusableItem;
    const focusedItemIndex = itemKeysFocusable.indexOf(focusedItemKey);
    if (focusedItemIndex < 0) { throw new Error(`Should not happen`); }
    
    switch (event.key) {
      case 'ArrowUp': {
        const target = itemKeys.at(itemKeys.indexOf(focusedItemKey) - 1);
        if (typeof target === 'undefined') { throw new Error(`Should not happen`); }
        state.focusItem(target);
        break;
      }
      case 'ArrowDown': {
        const target = itemKeys.at(itemKeys.indexOf(focusedItemKey) + 1);
        if (typeof target === 'undefined') { throw new Error(`Should not happen`); }
        state.focusItem(target);
        break;
      }
    }
    
    // Determine the index of the item to focus based on the keyboard event. If `null`, do not navigate.
    const itemTargetIndex = ((): null | number => {
      // Note: list boxes should not "cycle" (e.g. going beyond the last item should not go to the first)
      switch (event.key) {
        case 'ArrowUp': return Math.max(0, focusedItemIndex - 1);
        case 'ArrowDown': return Math.min(itemKeysFocusable.length - 1, focusedItemIndex + 1);
        case 'PageUp': return Math.max(0, focusedItemIndex - 10); // On Mac: Fn + ArrowUp
        case 'PageDown': return Math.min(itemKeysFocusable.length - 1, focusedItemIndex + 10); // On Mac: Fn + ArrowDown
        case 'Home': return 0; // On Mac: Fn + ArrowLeft
        case 'End': return -1; // On Mac: Fn + ArrowRight
        default: return null;
      }
    })();
    
    // 'Enter' key should still cause default behavior, like form submit. If the list box is part of a combo box or
    // other kind of drop down, then Enter should cause a selection + close, but this should be handled at the parent.
    if (event.key === 'Enter') { return; }
    
    if (itemTargetIndex !== null) {
      const itemTargetKey = itemKeysFocusable.at(itemTargetIndex);
      if (typeof itemTargetKey === 'undefined') { throw new Error(`Cannot resolve target index`); }
      
      event.preventDefault(); // Prevent default behavior, like scrolling
      event.stopPropagation(); // Prevent the key event from triggering other behavior at higher levels
      
      if (event.key === ' ' && typeof itemTargetIndex === 'string') {
        state.selectItem(itemTargetKey);
      } else {
        state.focusItem(itemTargetKey);
      }
    }
  } catch (error) {
    // If an assumption fails, log the error but don't crash
    console.error(error);
  }
};

const useListBoxTypeAhead = (storeRef: React.RefObject<null | StoreApi<ListBoxState>>) => {
  const typeAhead = useTypeAhead();
  
  React.useEffect(() => {
    const store = storeRef.current;
    if (!store) { return; }
    const state = store.getState();
    
    const query: string = removeCombiningCharacters(typeAhead.sequence.join(''));
    
    if (query.trim() === '') { return; }
    
    for (const [itemKey, item] of state.items) {
      const elementRef = item.itemRef.current;
      const elementText = elementRef?.innerText ?? null;
      
      if (elementText !== null && removeCombiningCharacters(elementText).startsWith(query)) {
        state.focusItem(itemKey);
        break;
      }
    }
  }, [storeRef, typeAhead.sequence]);
  
  return typeAhead;
};

export const ListBoxContext = React.createContext<null | ListBoxStore>(null);
export type ListBoxService<E extends HTMLElement> = {
  store: ListBoxStore,
  Provider: (props: React.PropsWithChildren) => React.ReactNode,
  props: Pick<React.ComponentProps<'div'>, 'className' | 'onKeyDown'> & {
    ref: React.RefObject<null | E>,
  },
};
export const useListBox = <E extends HTMLElement>(
  ref: React.RefObject<null | E>,
  propsInitial: Partial<ListBoxProps>,
): ListBoxService<E> => {
  const storeRef = React.useRef<ListBoxStore>(null);
  if (!storeRef.current) {
    storeRef.current = createListBoxStore(propsInitial);
  }
  
  const Provider = React.useCallback(({ children }: React.PropsWithChildren) => (
    <ListBoxContext value={storeRef.current}>{children}</ListBoxContext>
  ), []);
  
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

export const useListBoxContext = <T,>(selector: (state: ListBoxState) => T): T => {
  const store = React.use(ListBoxContext);
  if (!store) { throw new Error('Missing ListBoxContext provider'); }
  return useStore(store, selector);
};

export const useListBoxItem = (itemDef: ItemDef) => {
  const store = React.use(ListBoxContext);
  if (store === null) { throw new Error(`Missing ListBoxContext provider`); }
  
  React.useEffect(() => {
    store.setState(state => ({ items: ItemListUtil.withItemAdded(state.items, itemDef) }));
    return () => {
      store.setState(state => ({ items: ItemListUtil.withItemRemoved(state.items, itemDef.itemKey) }));
    };
  }, [store, itemDef]);
};

export const useListBoxItemFocus = (itemKey: ItemKey) => {
  const store = React.use(ListBoxContext);
  if (store === null) { throw new Error(`Missing ListBoxContext provider`); }
  
  // FIXME: implement ItemKey resolving
  // Make sure the following selectors return existing references or primitives, not new object references
  const isFocused = useStore(store, s => {
    // FIXME: better way to determine that the item is "first" (e.g. does it need sorting? what about ItemKey?)
    if (s.focusedItem === null) { return Array.from(s.items.keys())[0] === itemKey; } // If no focus, use the first
    return s.focusedItem === itemKey;
  });
  const focusItem = useStore(store, s => s.focusItem);
  
  return {
    isFocused,
    requestFocus: () => focusItem(itemKey),
  };
};

export const useListBoxItemSelection = (itemKey: ItemKey) => {
  const store = React.use(ListBoxContext);
  if (store === null) { throw new Error(`Missing ListBoxContext provider`); }
  
  // FIXME: implement ItemKey resolving
  // Make sure the following selectors return existing references or primitives, not new object references
  const isSelected = useStore(store, s => s.selectedItem === itemKey);
  const selectItem = useStore(store, s => s.selectItem);
  
  return {
    isSelected,
    requestSelection: () => selectItem(itemKey),
  };
};
