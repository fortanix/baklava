
import { removeCombiningCharacters } from '../../../../util/formatting.ts';

import * as React from 'react';
import { mergeCallbacks } from '../../../../util/reactUtil.ts';
import { type StoreApi, createStore, useStore } from 'zustand';

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
  /** Explicit position of this item in the list. Useful for virtual lists. If undefined, uses registration order. */
  itemPos?: undefined | number,
};

// A specifier for a given item in the list. Either an explicit target by its item key, or a number representing the
// index in the list. Negative numbers index from the end.
export type ItemTarget = number | ItemKey;


export const ItemUtil = {
  /** Check whether the given item matches the given target specification. */
  matchesTarget: (
    itemTarget: null | ItemTarget,
    item: {
      itemKey: ItemKey,
      itemPos: undefined | number,
    },
    totalItems: undefined | number,
  ): boolean => {
    if (typeof itemTarget === 'string') {
      return item.itemKey === itemTarget;
    } else if (typeof itemTarget === 'number' && typeof item.itemPos !== 'undefined') {
      if (itemTarget >= 0) {
        return item.itemPos === itemTarget;
      } else if (typeof totalItems !== 'undefined') {
        return item.itemPos === itemTarget + totalItems;
      }
    }
    return false;
  },
};

export const ItemListUtil = {
  /*
  sortItems: (items: Map<ItemKey, ItemDef>): Map<ItemKey, ItemDef> => {
    // Once iterator helpers are supported we could skip the intermediate array
    const itemsEntries = Array.from(items.entries(), );
    return new Map(itemsEntries.sort(([_keyA, a], [_keyB, b]) => {
      if (a.itemPos === undefined && b.itemPos === undefined) return 0;
      if (a.itemPos === undefined) return 1;
      if (b.itemPos === undefined) return -1;
      return a.itemPos - b.itemPos;
    }));
  },
  */
  
  withItemAdded: (items: Map<ItemKey, ItemDef>, itemNew: ItemDef): Map<ItemKey, ItemDef> => {
    // Check for duplicate keys to prevent thrashing the store
    if (items.has(itemNew.itemKey)) {
      console.warn(`Duplicate item key: ${itemNew.itemKey}`);
      return items;
    }
    
    const itemsUpdated = new Map(items);
    itemsUpdated.set(itemNew.itemKey, itemNew);
    
    return itemsUpdated;
    
    // FIXME: sort?
    //itemsRef.current = sortItems(itemsRef.current);
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
  
  /** Total number of items in the list. If set, implies that `items` may be partial (virtual list). */
  totalItems?: undefined | number,
  
  /** The currently selected item (up to one at a time). */
  focusedItem: null | ItemTarget,
  
  /** The currently selected item (up to one at a time). */
  selectedItem: null | ItemTarget,
};
export type ListBoxState = ListBoxProps & {
  /** Request the given `itemTarget` to be focused. If `null`, unset focus. */
  focusItem: (item: ItemTarget) => void,
  
  /** Request the given `itemTarget` to be selected. If `null`, unset selection. */
  selectItem: (itemTarget: null | ItemTarget) => void,
  
  /** Get the total number of items in the list. */
  getTotalItems: () => number,
};

// Ref: https://zustand.docs.pmnd.rs/guides/initialize-state-with-props#wrapping-the-context-provider
export const createListBoxStore = (initProps: Partial<ListBoxProps>) => {
  const defaultProps: ListBoxProps = {
    id: '', // FIXME: should be required
    disabled: false,
    items: new Map(),
    totalItems: undefined,
    focusedItem: null,
    selectedItem: null,
  };
  return createStore<ListBoxState>()((set, get) => ({
    ...defaultProps,
    ...initProps,
    focusItem: item => set(() => ({ focusedItem: item })),
    selectItem: item => set(() => ({ selectedItem: item })),
    // If no `totalItems`, assume we're not virtualized
    getTotalItems: () => get().totalItems ?? get().items.size,
  }));
};

export type ListBoxStore = ReturnType<typeof createListBoxStore>;


export const handleKeyboardInteractions = (store: ListBoxStore) => (event: React.KeyboardEvent) => {
  event.preventDefault();
  event.stopPropagation();
  
  const state = store.getState();
  
  // Sort by DOM order
  const itemsSorted = new Map([...state.items.entries()].sort(([, item1], [, item2]) => {
    const itemRef1 = item1.itemRef.current;
    const itemRef2 = item2.itemRef.current;
    if (!itemRef1 || !itemRef2) { return 0; }
    
    const pos = itemRef1.compareDocumentPosition(itemRef2);
    return (pos & Node.DOCUMENT_POSITION_PRECEDING) ? 1 : -1;
  }));
  
  const itemKeys = [...itemsSorted.keys()];
  
  const focusedItemKey = state.focusedItem ?? itemKeys.at(0);
  if (typeof focusedItemKey === 'undefined') { throw new Error(`Should not happen`); }
  if (typeof focusedItemKey === 'number') { throw new Error(`TODO`); }
  
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
  
  // FIXME: implement ItemTarget resolving
  // Make sure the following selectors return existing references or primitives, not new object references
  const isFocused = useStore(store, s => {
    // FIXME: better way to determine that the item is "first" (e.g. does it need sorting? what about ItemTarget?)
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
  
  // FIXME: implement ItemTarget resolving
  // Make sure the following selectors return existing references or primitives, not new object references
  const isSelected = useStore(store, s => s.selectedItem === itemKey);
  const selectItem = useStore(store, s => s.selectItem);
  
  return {
    isSelected,
    requestSelection: () => selectItem(itemKey),
  };
};
