/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type * as ReactTable from 'react-table';

import { Checkbox } from '../../../forms/controls/Checkbox/Checkbox.tsx';
import cl from './useRowSelectColumn.module.scss';

// `react-table` plugin for row selection column. Note: depends on `react-table`'s `useRowSelect` plugin.
export const useRowSelectColumn = <D extends object>(hooks: ReactTable.Hooks<D>): void => {
  // Merge first column with row selection checkboxes
  hooks.visibleColumns.push(columns =>
    columns.map((col: ReactTable.ColumnInstance<D>, index: number) => {
      if (index === 0) {
        return {
          ...col,
          Header: (headerProps: ReactTable.HeaderProps<D>) => {
            const { getToggleAllPageRowsSelectedProps } = headerProps;
            const toggleAllProps = getToggleAllPageRowsSelectedProps?.() ?? {};
            const { checked, onChange } = toggleAllProps;

            const headerContent =
              typeof col.Header === 'function'
                ? (col.Header as (props: ReactTable.HeaderProps<D>) => React.ReactNode)(headerProps)
                : col.Header;

            return (
              <>
                {toggleAllProps && (
                  <Checkbox
                    aria-label="Select all rows"
                    checked={checked}
                    onChange={onChange}
                    className={cl['bk-data-table-row-select__checkbox']}
                  />
                )}
                {headerContent}
              </>
            );
          },
          Cell: (cellProps: ReactTable.CellProps<D>) => {
            const { checked, onChange } = cellProps.row.getToggleRowSelectedProps();

            const cellContent = col.Cell
              ? (col.Cell as (props: ReactTable.CellProps<D>) => React.ReactNode)(cellProps)
              : cellProps.value;

            return (
              <>
                <Checkbox
                  aria-label="Select row"
                  checked={checked}
                  onChange={onChange}
                  className={cl['bk-data-table-row-select__checkbox']}
                />
                {cellContent}
              </>
            );
          },
        };
      }

      return col;
    })
  );
};
