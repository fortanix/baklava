/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { type StateCreator, type StoreApi } from 'zustand';

import type { ItemKey } from './CollectionStore.tsx';
import { parseControllableState, type ControllableStateDef } from './ControllableState.ts';


const noop = () => {};

export type SelectedState = null | ItemKey;


//
// Store slice
//

export type SelectionSingleState = {
  selectedItemKey: SelectedState,
};
export type SelectionSingleSlice = SelectionSingleState & {
  selectItem: (itemKey: SelectedState) => void,
};

export type CreateSelectionSingleSliceParams = Pick<SelectionSingleState, 'selectedItemKey'>;
export const createSelectionSingleSlice = (
  { selectedItemKey }: CreateSelectionSingleSliceParams,
): StateCreator<SelectionSingleSlice, [], [], SelectionSingleSlice> => set => ({
  selectedItemKey,
  selectItem: itemKey => { set({ selectedItemKey: itemKey }); },
});

type SelectedStateDef = ControllableStateDef<SelectedState>;
export const useSelectionWith = (store: StoreApi<SelectionSingleSlice>, stateDef: SelectedStateDef) => {
  const { isControlled } = parseControllableState(stateDef);
  
  const onStateChange = React.useEffectEvent(stateDef.onStateChange ?? noop);
  
  // Uncontrolled case: call `onStateChange` when state changes
  // biome-ignore lint/correctness/useExhaustiveDependencies(store.subscribe): Store is a stable reference.
  React.useEffect(() => {
    return store.subscribe((state, prevState) => {
      if (!isControlled && state.selectedItemKey !== prevState.selectedItemKey) {
        onStateChange(state.selectedItemKey);
      }
    });
  }, [isControlled]);
  
  // Controlled case: update store when controlled state changes
  // biome-ignore lint/correctness/useExhaustiveDependencies(store.setState): Store is a stable reference.
  React.useEffect(() => {
    if (isControlled) {
      store.setState({ selectedItemKey: stateDef.state ?? null });
    }
  }, [isControlled, stateDef.state]);
  
  return {
    props: {},
  };
};
