/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import * as ReactTable from 'react-table';


export type DataTableStatus = {
  ready: boolean, // Whether the data is ready to be used/shown in the UI
  loading: boolean, // Whether we're (re)loading the data
  error: null | Error, // Whether the last loading attempt resulted in an error
};

export type TableContextState<D extends object> = {
  status: DataTableStatus,
  setStatus: (status: DataTableStatus) => void,
  reload: () => void,
  table: ReactTable.TableInstance<D>,
};

const TableContext = React.createContext<null | TableContextState<object>>(null); // Memoized
export const createTableContext = <D extends object>() => TableContext as React.Context<null | TableContextState<D>>;


export const useTable = <D extends object>(): TableContextState<D> => {
  const context = React.useContext(TableContext as React.Context<null | TableContextState<D>>);
  
  if (context === null) {
    throw new TypeError('TableContext not yet initialized');
  }
  
  return context;
};
