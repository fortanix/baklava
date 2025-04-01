
import { removeCombiningCharacters } from '../../../../util/formatting.ts';

import * as React from 'react';
import { mergeCallbacks } from '../../../../util/reactUtil.ts';
import { type StoreApi, createStore, useStore } from 'zustand';

import { isItemProgrammaticallyFocusable } from '../../../util/composition/compositionUtil.ts';
import { useTypeAhead } from '../../../../util/hooks/useTypeAhead.ts';


/*
Store for a composable list box with (up to) a single selected item state.
*/

export type ItemKey = string; // Unique key of an item
export type ItemDef = { // Definition of a registered item
  itemRef: React.RefObject<null | HTMLElement>,
};
export type ItemMap = Map<ItemKey, ItemDef>;
export type ItemWithKey = ItemDef & { itemKey: ItemKey };

export const ItemListUtil = {
  /**
   * Sort the given `items` map in order of their position in the DOM tree.
   */
  sortItemsByDomOrder: (items: ItemMap): ItemMap => {
    return new Map([...items.entries()].sort(([, item1], [, item2]) => {
      const itemRef1 = item1.itemRef.current;
      const itemRef2 = item2.itemRef.current;
      if (!itemRef1 || !itemRef2) { return 0; }
      
      const pos = itemRef1.compareDocumentPosition(itemRef2);
      return (pos & Node.DOCUMENT_POSITION_PRECEDING) ? 1 : -1;
    }));
  },
  
  withItemAdded: (items: ItemMap, itemNew: ItemWithKey): ItemMap => {
    // There should not be any duplicate keys. For the same item, it should unregister before it reregisters.
    if (items.has(itemNew.itemKey)) { console.warn(`Duplicate item key: ${itemNew.itemKey}`); }
    
    const itemsUpdated = new Map(items);
    itemsUpdated.set(itemNew.itemKey, itemNew);
    
    // FIXME: sort?
    //const itemsSorted = ItemListUtil.sortItemsByDomOrder(itemsUpdated);
    
    return itemsUpdated;
  },
  
  withItemRemoved: (items: ItemMap, itemKey: ItemKey): ItemMap => {
    const itemsUpdated = new Map(items);
    itemsUpdated.delete(itemKey);
    return itemsUpdated;
  },
};


export type ListBoxState = {
  /** Globally unique ID for the list box control (e.g. for ARIA attributes). */
  id: string,
  
  /** Whether the list box control is currently disabled or not. */
  disabled: boolean,
  
  /** The items to be displayed in the list. */
  items: ItemMap,
  
  /** The currently selected item (up to one at a time). */
  focusedItem: null | ItemKey,
  
  /** The currently selected item (up to one at a time). */
  selectedItem: null | ItemKey,
  
  /** (For virtual lists only.) Defines the ordered list of all the item keys (rendered or not). */
  itemKeys: null | Array<ItemKey>,
  
  /** (For virtual lists only.) Used to determine if the given item is focusable. */
  isVirtualItemKeyFocusable: null | ((itemKey: ItemKey) => boolean),
};
export type ListBoxStateApi = ListBoxState & {
  /** Whether the list is virtual (only subset of items actually rendered/registered) or not. */
  isVirtual: () => boolean,
  
  /** Get the position of the given item in the list. */
  getItemPosition: (itemKey: ItemKey) => null | number,
  
  /** Request the given `itemKey` to be focused. If `null`, unset focus. */
  focusItem: (item: null | ItemKey) => void,
  
  /** Request the given `itemKey` to be selected. If `null`, unset selection. */
  selectItem: (itemKey: null | ItemKey) => void,
};

// Ref: https://zustand.docs.pmnd.rs/guides/initialize-state-with-props#wrapping-the-context-provider

export type ListBoxProps = Partial<ListBoxState> & Pick<Required<ListBoxState>, 'id'>;
export const createListBoxStore = <E extends HTMLElement>(ref: React.RefObject<null | E>, props: ListBoxProps) => {
  const propsWithDefaults: ListBoxState = {
    disabled: false,
    items: new Map(),
    focusedItem: null,
    selectedItem: null,
    itemKeys: null,
    isVirtualItemKeyFocusable: null,
    ...props,
  };
  return createStore<ListBoxStateApi>()((set, get) => ({
    ...propsWithDefaults,
    isVirtual: () => get().itemKeys !== null,
    getItemPosition: (itemKey: ItemKey) => {
      const state = get();
      const itemKeys = state.itemKeys ?? [...state.items.keys()];
      const index = itemKeys.indexOf(itemKey);
      return index >= 0 ? index : null;
    },
    selectItem: itemKey => { set({ selectedItem: itemKey }); },
    focusItem: itemKey => { set({ focusedItem: itemKey }); },
  }));
};
export type ListBoxStore = ReturnType<typeof createListBoxStore>;


/**
 * Keyboard event handler for the list box to handle keyboard interactions (e.g. arrow key navigation).
 * 
 * @see {@link https://www.w3.org/WAI/ARIA/apg/patterns/listbox}
 */
export const handleKeyboardInteractions = (store: ListBoxStore) => (event: React.KeyboardEvent) => {
  try {
    const state = store.getState();
    const isVirtual = state.isVirtual();
    const registeredItems = state.items;
    const selectedItemKey = state.selectedItem;
    const itemKeys = state.itemKeys ?? [...registeredItems.keys()]; // FIXME: sort items?
    
    // Filter out any items that are not (programmatically) focusable.
    // Note: this will only work if the item is rendered (has a ref), virtual unrendered items will be ignored
    const itemKeysFocusable: Array<ItemKey> = itemKeys
      .filter(itemKey => {
        // Note: may not exist (if the list is virtual and the item is not rendered, or the ref is not yet resolved)
        const itemElement: null | HTMLElement = registeredItems.get(itemKey)?.itemRef?.current ?? null;
        
        let isFocusable = false;
        if (isVirtual && state.isVirtualItemKeyFocusable) {
          isFocusable = state.isVirtualItemKeyFocusable(itemKey);
        } else if (itemElement) {
          isFocusable = isItemProgrammaticallyFocusable(itemElement);
        }
        
        return isFocusable;
      });
    
    const firstFocusableItem = itemKeys.at(0);
    if (typeof firstFocusableItem === 'undefined') { return; } // If no focusable items, no interactions needed
    
    const focusedItemKey: ItemKey = state.focusedItem ?? selectedItemKey ?? firstFocusableItem;
    const focusedItemIndex: number = itemKeysFocusable.indexOf(focusedItemKey);
    if (focusedItemIndex < 0) { throw new Error(`Should not happen`); }
    
    // Determine the index of the item to focus based on the keyboard event. If `null`, do not navigate.
    const pageSize = 10; // FIXME: make this a bit smarter?
    const itemTargetIndex = ((): null | number => {
      // Note: list boxes should not "cycle" (e.g. going beyond the last item should not go to the first)
      switch (event.key) {
        case ' ': return focusedItemIndex;
        case 'ArrowUp': return Math.max(0, focusedItemIndex - 1);
        case 'ArrowDown': return Math.min(itemKeysFocusable.length - 1, focusedItemIndex + 1);
        case 'Home': return 0; // On Mac: Fn + ArrowLeft
        case 'End': return -1; // On Mac: Fn + ArrowRight
        case 'PageUp':
          return Math.max(0, focusedItemIndex - pageSize); // On Mac: Fn + ArrowUp
        case 'PageDown':
          return Math.min(itemKeysFocusable.length - 1, focusedItemIndex + pageSize); // On Mac: Fn + ArrowDown
        default: return null;
      }
    })();
    
    // 'Enter' key should still cause default behavior, like form submit. If the list box is part of a combo box or
    // other kind of drop down, then Enter should cause a selection + close, but this should be handled at the parent.
    if (event.key === 'Enter') { return; }
    
    if (itemTargetIndex !== null) {
      const itemTargetKey = itemKeysFocusable.at(itemTargetIndex);
      if (typeof itemTargetKey === 'undefined') { throw new Error(`Cannot resolve target index`); }
      
      const itemTargetRef = registeredItems.get(itemTargetKey)?.itemRef ?? null;
      
      event.preventDefault(); // Prevent default behavior, like scrolling
      event.stopPropagation(); // Prevent the key event from triggering other behavior at higher levels
      
      if (event.key === ' ') {
        state.selectItem(itemTargetKey);
      } else {
        state.focusItem(itemTargetKey);
        
        // Note: this only works if the item is already rendered, for virtual lists the component will need to handle
        // the scroll.
        itemTargetRef?.current?.scrollIntoView({ behavior: 'auto', block: 'nearest' });
      }
    }
  } catch (error) {
    // If an assumption fails, log the error but don't crash
    console.error(error);
  }
};

export const useListBoxTypeAhead = (storeRef: React.RefObject<null | StoreApi<ListBoxStateApi>>) => {
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


//
// Context
//

export const ListBoxContext = React.createContext<null | ListBoxStore>(null);

export const useListBoxSelector = <T,>(selector: (state: ListBoxState) => T): T => {
  const store = React.use(ListBoxContext);
  if (!store) { throw new Error('Missing ListBoxContext provider'); }
  return useStore(store, selector);
};

export type ListBoxService<E extends HTMLElement> = {
  store: ListBoxStore,
  Provider: (props: React.PropsWithChildren) => React.ReactNode,
  // Note: using `div` here since there is easy no way to get props for a generic `HTMLElement`
  props: Pick<React.ComponentProps<'div'>, 'className' | 'onKeyDown'> & {
    ref: React.RefObject<null | E>,
  },
};
export const useListBox = <E extends HTMLElement>(
  ref: React.RefObject<null | E>,
  props: ListBoxProps,
): ListBoxService<E> => {
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

type UseListBoxItemResult = {
  id: string,
  itemPosition: null | number, // Position of this item in the total collection, or `null` if not known
  isFocused: boolean,
  requestFocus: () => void,
  isSelected: boolean,
  requestSelection: () => void,
};
export const useListBoxItem = (item: ItemWithKey): UseListBoxItemResult => {
  const store = React.use(ListBoxContext);
  if (store === null) { throw new Error(`Missing ListBoxContext provider`); }
  
  const id = useStore(store, s => s.id);
  
  const itemPosition = useStore(store, s => s.getItemPosition(item.itemKey));
  
  React.useEffect(() => {
    store.setState(state => ({
      items: ItemListUtil.withItemAdded(state.items, item),
    }));
    return () => {
      store.setState(state => ({
        //items: produce(state.items, draft => { draft.delete(item.itemKey); }), // XXX this causes an error:
        // https://stackoverflow.com/questions/74200399/react-cannot-assign-to-read-only-property-status-of-object
        items: ItemListUtil.withItemRemoved(state.items, item.itemKey),
      }));
    };
  }, [store, item]);
  
  // Make sure the following selectors return primitives or existing references, not new object references
  const isFocused = useStore(store, s => {
    // FIXME: better way to determine that the item is "first" (e.g. does it need sorting? what about ItemKey?)
    if (s.focusedItem === null) { return Array.from(s.items.keys())[0] === item.itemKey; } // If no focus, use the first
    return s.focusedItem === item.itemKey;
  });
  const focusItem = useStore(store, s => s.focusItem);
  const requestFocus = React.useCallback(() => {
    focusItem(item.itemKey);
  }, [item.itemKey, focusItem]);
  
  // React.useEffect(() => {
  //   const itemElement = item.itemRef.current;
  //   if (isFocused && itemElement && itemElement.closest('[role="listbox"]')?.matches(`:focus-within`)) {
  //     const hasHover: boolean = itemElement.matches(':hover') ?? false;
  //     // Note: do not scroll if the focus was triggered by a mouse event
  //     itemElement.focus({ preventScroll: hasHover });
  //   }
  // }, [isFocused, item.itemRef.current]);
  
  const isSelected = useStore(store, s => s.selectedItem === item.itemKey);
  const selectItem = useStore(store, s => s.selectItem);
  
  return {
    id: `${id}_${item.itemKey}`,
    
    itemPosition,
    
    isFocused,
    requestFocus,
    
    isSelected,
    requestSelection: () => selectItem(item.itemKey),
  };
};

/*
export const useListBoxItemFocus = (itemKey: ItemKey) => {
  const store = React.use(ListBoxContext);
  if (store === null) { throw new Error(`Missing ListBoxContext provider`); }
  
  // Make sure the following selectors return primitive values or existing references, not new object references
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
*/
