/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ClassNameArgument } from '../../../util/componentUtil.ts';
import * as ReactTable from 'react-table';

import { InputSearch } from '../../forms/controls/Input/InputSearch.tsx';
import { type TableContextState, createTableContext, useTable } from './DataTableContext.tsx';
import { Pagination } from './pagination/Pagination.tsx';
import { MultiSearch as MultiSearchInput } from '../MultiSearch/MultiSearch.tsx';
import { DataTableSync } from './table/DataTable.tsx';

import cl from './DataTableEager.module.scss';

export * from './DataTableContext.tsx';
export { Pagination };
export { DataTablePlaceholderEmpty, DataTablePlaceholderError } from './table/DataTablePlaceholder.tsx';


interface ReactTableOptions<D extends object> extends ReactTable.TableOptions<D> {
  // Add custom properties here
  //onClick?: (row: ReactTable.Row<D>) => void,
}

export type TableProviderEagerProps<D extends object> = {
  children: React.ReactNode,
  columns: ReactTableOptions<D>['columns'],
  items: ReactTableOptions<D>['data'],
  getRowId: ReactTableOptions<D>['getRowId'],
  plugins?: Array<ReactTable.PluginHook<D>>,
  initialState?: Partial<ReactTable.TableState<D>>,
  isReady?: boolean,
};
export const TableProviderEager = <D extends object>(props: TableProviderEagerProps<D>) => {
  const {
    children,
    columns,
    items,
    getRowId,
    plugins = [],
    initialState = {},
    isReady = true,
  } = props;
  
  const tableOptions: ReactTable.TableOptions<D> = {
    columns,
    data: items,
    ...(getRowId && { getRowId }),
  };
  const table = ReactTable.useTable(
    {
      ...tableOptions,
      defaultColumn: {
        disableGlobalFilter: true,
        disableSortBy: true,
      },
      
      initialState: {
        // useSortBy
        sortBy: [{ id: 'name', desc: false }],
        
        // useGlobalFilter
        globalFilter: '',
        
        // useFilters
        filters: [],
        
        // usePagination
        pageSize: 10,
        pageIndex: 0,
        
        ...initialState,
      },
      
      // useGlobalFilter
      manualGlobalFilter: false,
      
      // useSortBy
      disableSortRemove: true,
      
      // usePagination
      manualPagination: false,
      autoResetPage: false, // Do not automatically reset to first page if the data changes
    },
    ReactTable.useGlobalFilter,
    ReactTable.useFilters,
    ReactTable.useSortBy,
    ReactTable.usePagination,
    ReactTable.useRowSelect,
    ...plugins,
  );
  
  // Note: the `table` reference is mutated, so cannot use it as dependency for `useMemo` directly
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    const context = React.useMemo<TableContextState<D>>(() => ({
    status: { ready: isReady, loading: false, error: null },
    setStatus() {},
    reload() {},
    table,
  }), [table.state, ...Object.values(tableOptions)]);
  
  const TableContext = React.useMemo(() => createTableContext<D>(), []);
  
  return (
    <TableContext.Provider value={context}>
      {children}
    </TableContext.Provider>
  );
};
TableProviderEager.displayName = 'TableProviderEager';


export const Search = (props: React.ComponentProps<typeof InputSearch>) => {
  const { table } = useTable();
  
  return (
    <InputSearch
      value={table.state.globalFilter ?? ''}
      onChange={evt => { table.setGlobalFilter(evt.target.value); }}
      {...props}
    />
  );
};

export const MultiSearch = (props: React.ComponentPropsWithoutRef<typeof MultiSearchInput>) => {
  const { table } = useTable();
  
  return (
    <MultiSearchInput
      value={table.state.globalFilter ?? ''}
      filters={table.state.customFilters}
      query={filters => { table.setCustomFilters(filters); }}
      {...props}
    />
  );
};
MultiSearch.displayName = 'MultiSearch';

export type DataTableEagerProps = Omit<React.ComponentProps<typeof DataTableSync>, 'table' | 'status'> & {
  children?: React.ReactNode,
  className?: ClassNameArgument,
  footer?: React.ReactNode,
};
export const DataTableEager = ({ children, className, footer, ...propsRest }: DataTableEagerProps) => {
  const { table, status } = useTable();
  
  React.useEffect(() => {
    if (table.page.length === 0 && table.state.pageIndex > 0 && table.canPreviousPage) {
      // Edge case: no items and yet we are not on the first page. Navigate back to the previous page.
      table.previousPage();
    }
  }, [table.page.length, table.state.pageIndex, table.canPreviousPage, table.previousPage]);
  
  // Use `<Pagination/>` by default, unless the table is empty (in which case there are "zero" pages)
  const footerDefault = status.ready && table.rows.length > 0 ? <Pagination/> : null;
  const footerWithFallback = typeof footer === 'undefined' ? footerDefault : footer;
  
  return (
    <DataTableSync
      footer={footerWithFallback}
      {...propsRest}
      className={cx(
        cl['bk-data-table-eager'],
        { [cl['bk-data-table-eager--loading']]: !status.ready },
        className,
      )}
      table={table}
      status={status}
    >
      {children}
    </DataTableSync>
  );
};
DataTableEager.displayName = 'DataTableEager';
