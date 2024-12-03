/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import * as ReactTable from 'react-table';
import type { FilterQuery } from '../../MultiSearch/filterQuery.ts';


// Actions
ReactTable.actions.setCustomFilters = 'setCustomFilters';

const reducer = <D extends object>(
  state: ReactTable.TableState<D>,
  action: ReactTable.ActionType,
): ReactTable.ReducerTableState<D> | undefined => {
  if (action.type === ReactTable.actions.setCustomFilters) {
    return {
      ...state,
      customFilters: typeof action.customFilters === 'function'
        ? action.customFilters(state.customFilters)
        : action.customFilters,
    };
  }
  
  return state;
};

const useInstance = <D extends object>(instance: ReactTable.TableInstance<D>) => {
  const { dispatch, } = instance;
  //const customFilters = instance.state.customFilters;
  
  const setCustomFilters = React.useCallback(
    (customFilters: FilterQuery) => {
      return dispatch({ type: ReactTable.actions.setCustomFilters, customFilters });
    },
    [dispatch],
  );
  
  Object.assign(instance, {
    setCustomFilters,
  });
};

export const useCustomFilters = <D extends object>(hooks: ReactTable.Hooks<D>): void => {
  hooks.stateReducers.push(reducer);
  hooks.useInstance.push(useInstance);
};
