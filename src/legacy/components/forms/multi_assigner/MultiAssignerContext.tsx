/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';


export type MultiAssignerStatus = {
  ready: boolean,
  loading: boolean,
  error: null | Error,
};

export type Item = unknown;
export type ItemKey = string;

export type MultiAssignerContextState<D extends Item> = {
  // status: MultiAssignerStatus,
  // setStatus: (status: MultiAssignerStatus) => void,
  // reload: () => void,
  assignItem: (itemKey: ItemKey) => void,
  unassignItem: (itemKey: ItemKey) => void,
  deriveKey: (item: D) => ItemKey,
};

const MultiAssignerContext = React.createContext<null | MultiAssignerContextState<Item>>(null); // Memoized
export const createMultiAssignerContext =
  <D extends Item>() => MultiAssignerContext as React.Context<null | MultiAssignerContextState<D>>;

export const useMultiAssigner = <D extends Item>(): MultiAssignerContextState<D> => {
  const context = React.useContext(MultiAssignerContext as React.Context<null | MultiAssignerContextState<D>>);
  
  if (context === null) {
    throw new TypeError('MultiAssignerContext not yet initialized');
  }
  
  return context;
};
