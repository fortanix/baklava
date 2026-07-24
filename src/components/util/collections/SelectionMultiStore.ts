/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { type StateCreator, type StoreApi } from 'zustand';

import type { ItemKey } from './CollectionStore.ts';
import { parseControllableState, type ControllableStateDef } from './ControllableState.ts';


const noop = () => {};

export type SelectedState = Set<ItemKey>;


//
// Store slice
//

export type SelectionMultiState = {
  selectedItemKeys: SelectedState,
};
export type SelectionMultiSlice = SelectionMultiState & {
  selectItems: (itemKeys: SelectedState) => void,
};

export type CreateSelectionMultiSliceParams = Pick<SelectionMultiState, 'selectedItemKeys'>;
export const createSelectionMultiSlice = (
  { selectedItemKeys }: CreateSelectionMultiSliceParams,
): StateCreator<SelectionMultiSlice, [], [], SelectionMultiSlice> => set => ({
  selectedItemKeys,
  selectItems: itemKeys => { set({ selectedItemKeys: itemKeys }); },
});

type SelectedStateDef = ControllableStateDef<SelectedState>;
export const useSelectionWith = (store: StoreApi<SelectionMultiSlice>, stateDef: SelectedStateDef) => {
  const { isControlled } = parseControllableState(stateDef);
  
  const onStateChange = React.useEffectEvent(stateDef.onStateChange ?? noop);
  
  // Uncontrolled case: call `onStateChange` when state changes
  React.useEffect(() => {
    return store.subscribe((state, prevState) => {
      if (!isControlled && state.selectedItemKeys !== prevState.selectedItemKeys) {
        onStateChange(state.selectedItemKeys);
      }
    });
  }, [store, isControlled]);
  
  // Controlled case: update store when controlled state changes
  React.useEffect(() => {
    if (isControlled) {
      store.setState({ selectedItemKeys: stateDef.state ?? new Set() });
    }
  }, [store, isControlled, stateDef.state]);
  
  return {
    props: {},
  };
};
