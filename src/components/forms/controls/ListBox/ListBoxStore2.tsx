/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import { type StoreApi, createStore, useStore } from 'zustand';


/*
Store for a list box, with support for composition (each item being an element that is registered dynamically).
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



const internalKey = Symbol('baklava.ListBox.internal');
type ListBoxInternal = {
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

export type ListBoxState = {
  /** Internal bookkeeping. */
  [internalKey]: ListBoxInternal,
  
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


export const createListBoxStore = (options: ListBoxOptions) => {
  const internal: ListBoxInternal = {
    itemsRegistry: new Map(),
    itemsCount: 0,
  };
  const propsWithDefaults: ListBoxState = {
    [internalKey]: internal,
    disabled: false,
    focusedItem: null,
    selectedItem: null,
    virtualItemKeys: null,
    ...props,
  };
  return createStore<ListBoxStateApi>()((set, get) => ({
    ...propsWithDefaults,
    isEmpty: () => get()[internalKey].itemsCount === 0,
    setVirtualItemKeys: virtualItemKeys => set({ virtualItemKeys }),
    getItemPosition: (itemKey: ItemKey): null | number => {
      const state = get();
      
      const virtualItemKeys = state.virtualItemKeys;
      if (virtualItemKeys) {
        return VirtualItemKeysUtil.indexForItemKey(virtualItemKeys, itemKey);
      } else {
        // FIXME 1: cache the reverse mapping (track the index)
        // FIXME 2: there's no guarantee that the registry is ordered by DOM position
        return VirtualItemKeysUtil.indexForItemKey([...state[internalKey].itemsRegistry.keys()], itemKey);
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
