/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import * as ReactTable from 'react-table';
import { Checkbox } from '../../../forms/checkbox/Checkbox';

import './useRowSelectColumn.scss';


// `react-table` plugin for row selection column. Note: depends on `react-table`'s `useRowSelect` plugin.
export const useRowSelectColumn = <D extends object>(hooks: ReactTable.Hooks<D>): void => {
  // Prepend a column with row selection checkboxes
  hooks.visibleColumns.push(columns => [
    {
      id: 'selection',
      className: 'bkl-data-table-row-select',
      Header: ({ getToggleAllPageRowsSelectedProps }) => {
        const { checked, onChange } = getToggleAllPageRowsSelectedProps();
        return (
          <div className="bkl-data-table-row-select__header">
            <Checkbox.Item primary checked={checked} onChange={onChange}/>
          </div>
        );
      },
      Cell: ({ row }: ReactTable.CellProps<D, null>) => {
        const { checked, onChange } = row.getToggleRowSelectedProps();
        return (
          <div className="bkl-data-table-row-select__cell">
            <Checkbox.Item primary checked={checked} onChange={onChange}/>
          </div>
        );
      },
    },
    ...columns,
  ]);
};
