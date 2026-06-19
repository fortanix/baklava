/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { RequireOnly } from '../../../util/types.ts';
import * as React from 'react';
import { useMemoOnce } from '../../../util/reactUtil.ts';
import { type StateCreator, type StoreApi, createStore, useStore } from 'zustand';
import { type CollectionSlice, createCollectionSlice } from './CollectionStore.tsx';


export type ItemKey = string;

type RadioGroupState = {
  selectedItemKey: null | ItemKey,
};
type RadioGroupSlice = RadioGroupState & {
  selectItem: (itemKey: null | ItemKey) => void,
};

export type RadioGroupProps = RequireOnly<RadioGroupState, 'selectedItemKey'>;
export const createRadioGroupSlice = (
  { selectedItemKey }: RadioGroupProps,
): StateCreator<RadioGroupSlice, [], [], RadioGroupSlice> => set => {
  return {
    selectedItemKey,
    
    selectItem: itemKey => {
      set({ selectedItemKey: itemKey });
    },
  };
};







export type RadioGroupCollectionSlice = CollectionSlice & RadioGroupSlice;
export type RadioGroupContext = { store: StoreApi<RadioGroupCollectionSlice> };
export const RadioGroupContext = React.createContext<null | RadioGroupContext>(null);

export const useRadioGroup = (props: RadioGroupProps) => {
  const radioGroupId = React.useId();
  
  const store = useMemoOnce(() => createStore<RadioGroupCollectionSlice>()((...args) => ({
    ...createCollectionSlice({ collectionId: radioGroupId })(...args),
    ...createRadioGroupSlice(props)(...args),
  })));
  const context = useMemoOnce(() => ({ store }));
  
  const Provider = useMemoOnce(() => ({ children }: React.PropsWithChildren) =>
    <RadioGroupContext value={context}>{children}</RadioGroupContext>,
  );
  
  const radioGroupIdStored = useStore(store, state => state.collectionId);
  const consumeDirty = useStore(store, state => state.consumeDirty);
  const getItemKeys = useStore(store, state => state.getItemKeys);
  
  // TODO: move this inside the `Provider` instead?
  React.useLayoutEffect(() => {
    if (consumeDirty()) {
      console.log('CHANGED', getItemKeys());
    }
  });
  
  return {
    Provider,
    props: {
      //ref,
      'data-bk-radio-group-id': radioGroupIdStored,
    },
  };
};

type UseRadioGroupItemParams = { itemKey: ItemKey };
type UseRadioGroupItemResult<E extends Element> = {
  store: null | RadioGroupContext['store'],
  itemProps: {
    ref: React.RefCallback<E>,
    'data-bk-radio-group-parent': string,
    'data-bk-radio-group-item': string,
  },
};
export const useRadioGroupItem = <E extends Element>(params: UseRadioGroupItemParams): UseRadioGroupItemResult<E> => {
  const { itemKey } = params;
  
  const store = React.use(RadioGroupContext)?.store;
  if (!store) { throw new Error(`[RadioGroupItem] Missing 'RadioGroupContext' provider`); }
  
  const radioGroupId = useStore(store, state => state.collectionId);
  const registerItem = useStore(store, state => state.registerItem);
  const unregisterItem = useStore(store, state => state.unregisterItem);
  
  React.useLayoutEffect(() => {
    //console.log('child re-render', itemKey);
  });
  
  const ref = React.useCallback<React.RefCallback<E>>(el => {
    if (typeof itemKey === 'undefined') {
      console.warn(`[RadioGroup] Found item without an 'itemKey'`, el);
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
      'data-bk-radio-group-parent': radioGroupId,
      'data-bk-radio-group-item': itemKey,
    },
  };
};
