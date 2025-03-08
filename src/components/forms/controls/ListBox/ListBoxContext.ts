
import * as React from 'react';


/*
Context for a composable list box with a single selected item state.
*/

export type ItemKey = string;

export type ItemDef = {
  itemKey: ItemKey,
  itemRef: React.RefObject<null | HTMLElement>,
  /** Explicit position of this item in the list. Useful for virtual lists. If undefined, uses the DOM order. */
  itemPos?: undefined | number,
};

// A specifier for a given item in the list. Either an explicit target by its item key, or a number representing the
// index in the list. Negative numbers index from the end.
export type ItemTarget = number | ItemKey;


export type ListBoxContext = {
  /** Unique ID for the list box component (e.g. for ARIA attributes). */
  id: string,

  /** Whether the list box component is currently disabled or not. */
  disabled: boolean,
  
  /** Register a new item. Returns a callback to unregister. */
  registerItem: (itemDef: ItemDef) => () => void,
  
  /** Total number of items in the list. */
  totalItems: number,
  
  /** The currently selected item (up to one at a time). */
  focusedItem: null | ItemTarget,
  
  /** Request the given `itemTarget` to be focused. If `null`, unset focus. */
  focusItem: (itemTarget: null | ItemTarget) => void,
  
  /** The currently selected item (up to one at a time). */
  selectedItem: null | ItemTarget,
  
  /** Request the given `itemTarget` to be selected. If `null`, unset selection. */
  selectItem: (itemTarget: null | ItemTarget) => void,
};
export const ListBoxContext = React.createContext<null | ListBoxContext>(null);

export const useListBoxItem = (itemDef: ItemDef) => {
  const context = React.use(ListBoxContext);
  if (context === null) { throw new Error(`Missing ListBoxContext provider`); }
  
  React.useEffect(() => {
    return context.registerItem(itemDef); // Register the current item (returning the unregister callback)
  }, [context.registerItem, itemDef]);
  
  return context;
};

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
