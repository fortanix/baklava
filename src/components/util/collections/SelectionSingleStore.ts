/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import type { ControllableStateProps } from '../../../util/hooks/useControllableState.ts';
import { type StateCreator, type StoreApi } from 'zustand';

import type { ItemKey } from './CollectionStore.ts';


const noop = () => {};

export type SelectedState<K extends ItemKey> = null | K;


//
// Store slice
//

export type SelectionSingleState<K extends ItemKey> = {
  selectedItemKey: SelectedState<K>,
};
export type SelectionSingleSlice<K extends ItemKey> = SelectionSingleState<K> & {
  selectItem: (itemKey: SelectedState<K>) => void,
};

export type CreateSelectionSingleSliceParams<K extends ItemKey> = Pick<SelectionSingleState<K>, 'selectedItemKey'>;
export const createSelectionSingleSlice = <K extends ItemKey>(
  { selectedItemKey }: CreateSelectionSingleSliceParams<K>,
): StateCreator<SelectionSingleSlice<K>, [], [], SelectionSingleSlice<K>> => set => ({
  selectedItemKey,
  selectItem: itemKey => { set({ selectedItemKey: itemKey }); },
});

type SelectedStateDef<K extends ItemKey> = ControllableStateProps<SelectedState<K>>;
export const useSelectionWith = <K extends ItemKey>(
  store: StoreApi<SelectionSingleSlice<K>>,
  stateDef: SelectedStateDef<K>,
) => {
  const isControlled = typeof stateDef.state !== 'undefined';
  const onStateChange = React.useEffectEvent(stateDef.onStateChange ?? noop);
  
  // Uncontrolled case: call `onStateChange` when state changes
  React.useEffect(() => {
    return store.subscribe((state, prevState) => {
      if (!isControlled && state.selectedItemKey !== prevState.selectedItemKey) {
        onStateChange(state.selectedItemKey);
      }
    });
  }, [store, isControlled]);
  
  // Controlled case: update store when controlled state changes
  React.useEffect(() => {
    if (isControlled) {
      store.setState({ selectedItemKey: stateDef.state ?? null });
    }
  }, [store, isControlled, stateDef.state]);
  
  return {
    props: {},
  };
};
