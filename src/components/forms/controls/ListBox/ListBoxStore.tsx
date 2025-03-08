
import * as React from 'react';
import { createStore, useStore } from 'zustand';


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


export type ListBoxProps = {
  /** Unique ID for the list box component (e.g. for ARIA attributes). */
  id: string,
  
  /** Whether the list box component is currently disabled or not. */
  disabled: boolean,
  
  /** Total number of items in the list. */
  totalItems: number,
  
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
};

// Ref: https://zustand.docs.pmnd.rs/guides/initialize-state-with-props#wrapping-the-context-provider
export const createListBoxStore = (initProps: Partial<ListBoxProps>) => {
  const defaultProps: ListBoxProps = {
    id: '', // FIXME: should be required
    disabled: false,
    totalItems: 0, // FIXME: should be required
    focusedItem: null,
    selectedItem: null,
  };
  return createStore<ListBoxState>()((set) => ({
    ...defaultProps,
    ...initProps,
    focusItem: item => set(state => ({ focusedItem: item })),
    selectItem: item => set(state => ({ selectedItem: item })),
  }));
};

export type ListBoxStore = ReturnType<typeof createListBoxStore>;

export const ListBoxContext = React.createContext<null | ListBoxStore>(null);


type ListBoxProviderProps = React.PropsWithChildren<Partial<ListBoxProps>>;
export const ListBoxProvider = ({ children, ...props }: ListBoxProviderProps) => {
  const storeRef = React.useRef<ListBoxStore>(null);
  if (!storeRef.current) {
    storeRef.current = createListBoxStore(props);
  }
  return (
    <ListBoxContext value={storeRef.current}>
      {children}
    </ListBoxContext>
  );
};

export const useListBoxContext = <T,>(selector: (state: ListBoxState) => T): T => {
  const store = React.use(ListBoxContext);
  if (!store) { throw new Error('Missing ListBoxContext'); }
  return useStore(store, selector);
};
