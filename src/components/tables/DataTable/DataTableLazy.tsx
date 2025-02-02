/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx } from '../../../util/componentUtil.ts';
import { useEffectAsync } from '../../../util/reactUtil.ts';

import { Spinner } from '../../graphics/Spinner/Spinner.tsx';
import { PlaceholderEmptyAction } from '../../graphics/PlaceholderEmpty/PlaceholderEmpty.tsx';
import { Button } from '../../actions/Button/Button.tsx';

import * as ReactTable from 'react-table';
import { type DataTableStatus, type TableContextState, createTableContext, useTable } from './DataTableContext.tsx';
import { Pagination } from './pagination/Pagination';
import { DataTablePlaceholderError } from './table/DataTablePlaceholder';
import { DataTableAsync } from './table/DataTable';

import cl from './DataTableLazy.module.scss';


export * from './DataTableContext.tsx';
export { Pagination };
export { DataTablePlaceholderEmpty, DataTablePlaceholderError } from './table/DataTablePlaceholder';
export { PlaceholderEmptyAction } from '../../graphics/PlaceholderEmpty/PlaceholderEmpty.tsx';

export { Search, MultiSearch } from './DataTableEager'; // FIXME: move to a common module

export interface ReactTableOptions<D extends object> extends ReactTable.TableOptions<D> {
  // Add custom properties here
  //onClick?: (row: ReactTable.Row<D>) => void,
}

export type DataTableQueryResult<D extends object> = { total: number, itemsPage: ReactTableOptions<D>['data'] };
export type DataTableQuery<D extends object> =
  (params: {
    pageIndex: number,
    pageSize: number,
    offset: number,
    limit: number,
    sortBy: Array<ReactTable.SortingRule<D>>,
    orderings: Array<{ column: string, direction: 'ASC' | 'DESC' }>,
    globalFilter: ReactTable.UseGlobalFiltersState<D>['globalFilter'],
    filters: ReactTable.Filters<D>,
  }) => Promise<DataTableQueryResult<D>>;


type UseQueryParams<D extends object> = {
  table: ReactTable.TableInstance<D>,
  query: DataTableQuery<D>,
  status: DataTableStatus,
  setStatus: React.Dispatch<React.SetStateAction<DataTableStatus>>,
  handleResult: (result: DataTableQueryResult<D>) => void,
};
const useQuery = <D extends object>(
  { table, query, status, setStatus, handleResult }: UseQueryParams<D>,
  deps: Array<unknown> = [],
) => {
  // Keep track of the latest query being performed
  const latestQuery = React.useRef<null | Promise<DataTableQueryResult<D>>>(null);
  
  useEffectAsync(async () => {
    try {
      setStatus(status => ({ ...status, loading: true, error: null }));
      
      const queryPromise = query({
        pageIndex: table.state.pageIndex,
        pageSize: table.state.pageSize,
        offset: table.state.pageIndex * table.state.pageSize,
        limit: table.state.pageSize,
        sortBy: table.state.sortBy,
        orderings: table.state.sortBy.map(({ id, desc }) =>
          ({ column: id, direction: desc ? 'DESC' : 'ASC' }),
        ),
        globalFilter: table.state.globalFilter,
        filters: table.state.filters,
      });
      latestQuery.current = queryPromise;
      const queryResult = await queryPromise;
      
      // Note: only update if we haven't been "superseded" by a more recent update
      if (latestQuery.current !== null && latestQuery.current === queryPromise) {
        setStatus({ ready: true, loading: false, error: null });
        handleResult(queryResult);
      }
    } catch (reason: unknown) {
      console.error(reason);
      const error = reason instanceof Error ? reason : new Error('Unknown error');
      setStatus({ ready: false, loading: false, error });
      //handleResult({ total: 0, itemsPage: [] });
    }
  }, [
    setStatus,
    query,
    table.state.pageIndex,
    table.state.pageSize,
    table.state.sortBy,
    table.state.globalFilter,
    table.state.filters,
    ...deps,
  ]);
};

export type TableProviderLazyProps<D extends object> = {
  children: React.ReactNode,
  columns: ReactTableOptions<D>['columns'],
  getRowId: ReactTableOptions<D>['getRowId'],
  plugins?: Array<ReactTable.PluginHook<D>>,
  initialState: Partial<ReactTable.TableState<D>>,
  
  // Callback to query a new set of items
  query: DataTableQuery<D>,
  
  // Controlled state
  items: DataTableQueryResult<D>,
  // Callback to request the consumer to update controlled state with the given data
  updateItems: (items: DataTableQueryResult<D>) => void,
};
export const TableProviderLazy = <D extends object>(props: TableProviderLazyProps<D>) => {
  const {
    children,
    columns,
    getRowId,
    plugins = [],
    initialState,
    query,
    items,
    updateItems,
  } = props;
  
  // Status
  const [status, setStatus] = React.useState<DataTableStatus>({ ready: false, loading: false, error: null });
  
  // Reload
  const [reloadTrigger, setReloadTrigger] = React.useState(0);
  const reload = React.useCallback(() => {
    setReloadTrigger(trigger => (trigger + 1) % 100);
  }, []);
  
  
  // Controlled table state
  const [pageSize, setPageSize] = React.useState(initialState?.pageSize ?? 10);
  
  const tableOptions: ReactTable.TableOptions<D> = {
    columns,
    data: items.itemsPage,
    ...(getRowId && { getRowId }), // Add `getRowId` only if it is defined
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
        pageSize,
        pageIndex: 0,
        
        ...initialState,
      },
      stateReducer: (state, action, prevState, instance) => {
        if (action.type === 'setPageSize') {
          setPageSize(action.pageSize);
        }
        
        return state;
      },
      useControlledState: state => {
        // https://react-table-v7-docs.netlify.app/docs/faq#how-can-i-manually-control-the-table-state
        // biome-ignore lint/correctness/useExhaustiveDependencies: Recommended by the library author, see docs above.
        return React.useMemo(() => ({ ...state, pageSize }), [state, pageSize]);
      },
      
      // https://react-table-v7-docs.netlify.app/docs/faq
      //   #how-do-i-stop-my-table-state-from-automatically-resetting-when-my-data-changes
      autoResetPage: false,
      autoResetExpanded: false,
      autoResetGroupBy: false,
      autoResetSelectedRows: false,
      autoResetSortBy: false,
      autoResetFilters: false,
      autoResetGlobalFilter: false,
      autoResetRowState: false,
      
      // useGlobalFilter
      manualGlobalFilter: true,
      
      // useFilters
      manualFilters: true,
      
      // useSortBy
      manualSortBy: true,
      disableSortRemove: true,
      
      // usePagination
      manualPagination: true,
      pageCount: Math.ceil(items.total / pageSize),
    },
    ReactTable.useGlobalFilter,
    ReactTable.useFilters,
    ReactTable.useSortBy,
    ReactTable.usePagination,
    ReactTable.useRowSelect,
    ...plugins,
  );
  
  // The `table` reference is mutated, so cannot use it as dependency for `useMemo` directly.
  // biome-ignore lint/correctness/useExhaustiveDependencies: (see comment above)
  const context = React.useMemo<TableContextState<D>>(() => ({
    status,
    setStatus,
    reload,
    table,
  }), [JSON.stringify(status), reload, table.state, ...Object.values(tableOptions)]);
  
  const TableContext = React.useMemo(() => createTableContext<D>(), []);
  
  useQuery({
    table,
    query,
    status,
    setStatus,
    handleResult: result => { updateItems(result); },
  }, [reloadTrigger]);
  
  return (
    <TableContext.Provider value={context}>
      {children}
    </TableContext.Provider>
  );
};
TableProviderLazy.displayName = 'TableProviderLazy';


export type DataTableLazyProps = Omit<React.ComponentPropsWithRef<typeof DataTableAsync>, 'table' | 'status'>;
export const DataTableLazy = ({ className, footer, ...propsRest }: DataTableLazyProps) => {
  const { status, table, reload } = useTable();
  
  const isEmpty = status.ready && table.rows.length === 0 && !table.canPreviousPage;
  const isLoading = status.loading;
  
  // Note: if `status.ready` is `false`, then we're already showing the skeleton loader
  const showLoadingIndicator = isLoading && status.ready;
  
  React.useEffect(() => {
    if (status.ready && table.rows.length === 0 && table.state.pageIndex > 0 && table.canPreviousPage) {
      // Edge case: no items and yet we are not on the first page. Navigate back to the previous page.
      table.previousPage();
    }
  }, [status.ready, table.rows.length, table.state.pageIndex, table.canPreviousPage, table.previousPage]);
  
  // Use `<Pagination/>` by default, unless the table is empty (in which case there are "zero" pages)
  const footerDefault = isEmpty ? null : <Pagination/>;
  const footerWithFallback = typeof footer === 'undefined' ? footerDefault : footer;
  
  return (
    <DataTableAsync
      className={cx(
        cl['bk-data-table-lazy'],
        { [cl['bk-data-table-lazy--loading']]: isLoading },
        className,
      )}
      status={status}
      table={table}
      footer={footerWithFallback}
      placeholderError={
        <DataTablePlaceholderError
          actions={
            <PlaceholderEmptyAction>
              <Button kind="primary" onPress={() => { reload(); }}>
                Retry
              </Button>
            </PlaceholderEmptyAction>
          }
        />
      }
      {...propsRest}
    >
      {showLoadingIndicator && <Spinner size="large" className={cx(cl['table-spinner'])}/>}
    </DataTableAsync>
  );
};
DataTableLazy.displayName = 'DataTableLazy';
