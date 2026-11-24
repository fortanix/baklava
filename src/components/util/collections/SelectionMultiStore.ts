/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import type { ControllableStateProps } from '../../../util/hooks/useControllableState.ts';
import { type StateCreator, type StoreApi } from 'zustand';

import type { ItemKey } from './CollectionStore.ts';


const noop = () => {};

export type SelectedState<K extends ItemKey> = Set<K>;


//
// Store slice
//

export type SelectionMultiState<K extends ItemKey> = {
  selectedItemKeys: SelectedState<K>,
};
export type SelectionMultiSlice<K extends ItemKey> = SelectionMultiState<K> & {
  selectItems: (itemKeys: SelectedState<K>) => void,
};

export type CreateSelectionMultiSliceParams<K extends ItemKey> = Pick<SelectionMultiState<K>, 'selectedItemKeys'>;
export const createSelectionMultiSlice = <K extends ItemKey>(
  { selectedItemKeys }: CreateSelectionMultiSliceParams<K>,
): StateCreator<SelectionMultiSlice<K>, [], [], SelectionMultiSlice<K>> => set => ({
  selectedItemKeys,
  selectItems: itemKeys => { set({ selectedItemKeys: itemKeys }); },
});

type SelectedStateDef<K extends ItemKey> = ControllableStateProps<SelectedState<K>>;
export const useSelectionWith = <K extends ItemKey>(
  store: StoreApi<SelectionMultiSlice<K>>,
  stateDef: SelectedStateDef<K>,
) => {
  const isControlled = typeof stateDef.state !== 'undefined';
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
