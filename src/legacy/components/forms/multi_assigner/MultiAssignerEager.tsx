/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import {
  createMultiAssignerContext,
  Item,
  MultiAssignerContextState,
 } from './MultiAssignerContext';

import { MultiAssigner, MultiAssignerProps } from './assigner/MultiAssigner';




export type MultiAssignerEagerProps<T extends Item> = MultiAssignerProps<T>;

export const MultiAssignerEager = <T extends Item>(props: MultiAssignerEagerProps<T>) => {
  const {
    deriveKey,
    assignItem,
    unassignItem,
  } = props;

  const context = React.useMemo<MultiAssignerContextState<T>>(() => ({
    // status: { ready: true, loading: false, error: null },
    // setStatus() {},
    // reload() {},
    assignItem,
    unassignItem,
    deriveKey,
  }), [assignItem, unassignItem, deriveKey]);
    
  const multiAssignerContext = React.useMemo(() => createMultiAssignerContext<T>(), []);
  return (
    <multiAssignerContext.Provider value={context}>
      <MultiAssigner {...props} />
    </multiAssignerContext.Provider>
  );
};
