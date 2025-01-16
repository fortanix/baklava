/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx } from '../../../util/componentUtil.ts';

import * as ReactTable from 'react-table';
import { Spinner } from '../../graphics/Spinner/Spinner.tsx';
import { PlaceholderEmptyAction } from '../../graphics/PlaceholderEmpty/PlaceholderEmpty.tsx';
import { Button } from '../../actions/Button/Button.tsx';
import { type DataTableStatus, type TableContextState, createTableContext, useTable } from './DataTableContext.tsx';
import { PaginationStream } from './pagination/PaginationStream.tsx';
import { DataTablePlaceholderError } from './table/DataTablePlaceholder.tsx';

import { DataTableAsync } from './table/DataTable.tsx';

import type { FilterQuery } from '../MultiSearch/filterQuery.ts';

// Table plugins
import { useCustomFilters } from './plugins/useCustomFilters.tsx';

// Styles
import './DataTableStream.scss';


export * from './DataTableContext.tsx';
export { PaginationStream };
export { Search, MultiSearch } from './DataTableEager.tsx'; // FIXME: move to a common module
export {
  DataTablePlaceholderEmpty,
  DataTablePlaceholderError,
  PlaceholderEmptyAction,
} from './table/DataTablePlaceholder.tsx';


export interface ReactTableOptions<D extends object> extends ReactTable.TableOptions<D> {
  // Add custom properties here
  //onClick?: (row: ReactTable.Row<D>) => void,
}

const usePageHistory = <D extends object, PageHistoryItem extends object>() => {
  type PageIndex = number;
  
  // Note: conceptually the page history should be a stack. However, in order to prevent timing issues, we maintain
  // a map keyed with the page index, rather than an array. This allows us to handle situations where our local state
  // is out of sync with the actual table state.
  const [pageHistory, setPageHistory] = React.useState<Map<PageIndex, PageHistoryItem>>(() => new Map());
  
  const truncateToPage = React.useCallback(
    (pageHistory: Map<PageIndex, PageHistoryItem>, pageIndex: PageIndex) => {
      const keys = [...pageHistory.keys()];
      if (keys.length === 0 || keys[keys.length - 1] === pageIndex) {
        return pageHistory; // Don't update if we don't need to (optimization)
      }
        return new Map([...pageHistory.entries()].filter(([pageIndexCurrent]) => pageIndexCurrent <= pageIndex));
    },
    [],
  );
  
  // Present an interface conceptually similar to a stack, but also take explicit page indices for consistency checking
  const pageHistoryApi = (pageHistory: Map<PageIndex, PageHistoryItem>) => ({
    clear: () => {
      const history = new Map();

      return pageHistoryApi(history);
    },
    pop: (pageIndex: PageIndex) => {
      const history = truncateToPage(pageHistory, pageIndex);

      return pageHistoryApi(history);
    },
    push: (pageIndex: PageIndex, pageHistoryItem: PageHistoryItem) => {
      const indices = [...pageHistory.keys()];
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      const lastIndex: PageIndex = indices[indices.length - 1]!;
      // Make sure the page indices are contiguous
      if (pageIndex > lastIndex + 1) {
        throw new Error('Non-contiguous page indices'); // Should never happen
      }

      const history = new Map(pageHistory).set(pageIndex, pageHistoryItem);

      return pageHistoryApi(history);
    },
    peak(pageIndex: PageIndex): null | PageHistoryItem {
      return pageHistory.get(pageIndex) ?? null;
    },
    get: () => pageHistoryApi(pageHistory),
    write: () => {
      setPageHistory(pageHistory);
    },
  });
  
  return pageHistoryApi(pageHistory);
};

export type DataTableQueryResult<D extends object, P = undefined> = {
  itemsPage: ReactTableOptions<D>['data'],
  // Custom page state to be stored in page history
  pageState?: P,
  // This flag is used to manually indicate the end of the stream when all data has been loaded
  isEndOfStream?: boolean,
};

export type DataTableQuery<D extends object, P = undefined> =
  (params: {
    previousItem: null | D,
    previousPageState?: undefined | P,
    offset: number,
    pageSize: number,
    limit: number, // Note: the `limit` may be different from the `pageSize` (`limit` may include a +1 overflow)
    sortBy: Array<ReactTable.SortingRule<D>>,
    orderings: Array<{ column: string, direction: 'ASC' | 'DESC' }>,
    globalFilter: ReactTable.UseGlobalFiltersState<D>['globalFilter'],
    filters: ReactTable.Filters<D>,
    customFilters: FilterQuery,
  }) => Promise<DataTableQueryResult<D, P>>;

export type TableProviderStreamProps<D extends object, P = undefined> = {
  children: React.ReactNode,
  columns: ReactTableOptions<D>['columns'],
  getRowId: ReactTableOptions<D>['getRowId'],
  plugins?: Array<ReactTable.PluginHook<D>>,
  initialState: Partial<ReactTable.TableState<D>>,
  
  // Callback to query a new set of items
  query: DataTableQuery<D, P>,
  
  // Controlled state
  items: ReactTableOptions<D>['data'],
  // Callback to request the consumer to update controlled state with the given data
  updateItems: (items: Array<D>) => void,
};
export const TableProviderStream = <D extends object, P = undefined>(
  props: TableProviderStreamProps<D, P>,
) => {
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
  
  // Page History
  type PageHistoryItem = {
    itemLast: null | D, // Possibly `null` if there are no items yet (or loading)
    pageState?: P,
  };
  const pageHistory = usePageHistory<D, PageHistoryItem>();
  
  // Controlled table state
  const initialPageSize = initialState?.pageSize ?? 10;
  const [pageSize, setPageSize] = React.useState(initialPageSize);
  const [pageCount, setPageCount] = React.useState(1);
  const [endOfStream, setEndOfStream] = React.useState(false);
  const [partialStream, setPartialStream] = React.useState(false);
  
  const tableOptions = {
    columns,
    data: items,
    ...(getRowId && { getRowId }), // Add `getRowId` only if it is defined
  };
  const table = ReactTable.useTable<D>(
    {
      ...tableOptions,
      
      defaultColumn: {
        configurable: true,
        disableGlobalFilter: true,
        disableSortBy: true,
        primary: false,
      },
      
      initialState: {
        // useSortBy
        sortBy: [{ id: 'name', desc: false }],
        
        // useGlobalFilter
        globalFilter: '',
        
        // useFilters
        filters: [],
        
        // useCustomFilters
        customFilters: [],
        
        // usePagination
        pageSize: initialPageSize,
        pageIndex: 0,
        
        ...initialState,
      },
      stateReducer: (state, action, prevState, instance) => {
        // Get the previous page state (if any)
        let updatedPageHistory = pageHistory.get();
        // New page size
        let pageSize = state.pageSize;

        switch (action.type) {
          case 'setPageSize':
            state.pageIndex = 0;
            updatedPageHistory = updatedPageHistory.clear();
            pageSize = action.pageSize;
            setPageSize(action.pageSize);
            break;

          case 'reload':
          case 'setCustomFilters':
          case 'setFilter':
          case 'toggleSortBy':
          case 'setGlobalFilter':
            state.pageIndex = 0;
            updatedPageHistory = updatedPageHistory.clear();
            break;


          default:
            break;
        }

        if ([
          'tableLoad',
          'reload',
          'gotoPage',
          'setPageSize',
          'setPageIndex',
          'setCustomFilters',
          'setFilter',
          'setGlobalFilter',
          'toggleSortBy',
          'loadMore',
          'reloadCurrentPage',
        ].includes(action.type)) {
          setStatus(status => ({ ...status, loading: true, error: null }));

          // Initialize previous page history item and partial page history item.
          const previousPageHistoryItem = updatedPageHistory.peak(state.pageIndex - 1);
          // Get the partial page history of current page
          const partialPageHistoryItem = updatedPageHistory.peak(state.pageIndex);

          let queryParams = {
            previousItem: previousPageHistoryItem?.itemLast ?? null,
            previousPageState: previousPageHistoryItem?.pageState ?? undefined,
            offset: state.pageIndex * pageSize,
            pageSize,
            // Add +1 overflow for end-of-stream checking
            // Client can remove 1, if it wants to explicitly set 'isEndOfStream' flag
            limit: (pageSize + 1),
            sortBy: state.sortBy,
            orderings: state.sortBy.map(({ id, desc }) =>
              ({ column: id, direction: desc ? 'DESC' as const : 'ASC' as const }),
            ),
            globalFilter: state.globalFilter,
            filters: state.filters,
            customFilters: state.customFilters,
          };

          if (action.type === 'loadMore') {
            queryParams = {
              ...queryParams,
              previousItem: partialPageHistoryItem?.itemLast ?? null,
              previousPageState: partialPageHistoryItem?.pageState ?? undefined,
              // Remaining items limit to reach the full 'pageSize'
              // Add +1 overflow for end-of-stream checking
              // Client can remove 1, if it wants to explicitly set 'isEndOfStream' flag
              limit: (pageSize + 1) - (instance?.data ?? []).length,
            };
          }

          const queryPromise = query(queryParams);

          queryPromise.then(({
            itemsPage: _itemsPage,
            pageState,
            isEndOfStream: _isEndOfStream,
          }) => {
            const itemsPage = _itemsPage.slice(0, pageSize);

            // When load more action is dispatched, combine items from API response with the
            // existing items in the table, Otherwise replace the items
            const items = action.type === 'loadMore'
              ? [...(instance?.data ?? []), ...itemsPage]
              : itemsPage; // Slice it down to at most one page length

            // If the API response doesn't explicitly flag the end of the stream, and the
            // number of items returned is less than the limit, it indicates a partial stream.
            const isPartialStream = typeof _isEndOfStream === 'boolean'
                && !_isEndOfStream
                && items.length < pageSize;

            let isEndOfStream = true;

            if (typeof _isEndOfStream === 'boolean') {
              // If the current page contains partial stream data, we need to wait until more
              // data is loaded and the full 'pageSize' is reached. In the meantime, disable the
              // next button by setting 'isEndOfStream' to true. Otherwise, set the EOS explicitly
              // based on API response.
              // i.e, If current page has partial stream then 'isEndOfStream' is set to 'true'
              isEndOfStream = isPartialStream ? true : _isEndOfStream;
            } else {
              // Otherwise if items is not more than a page size, must be EOS
              isEndOfStream = _itemsPage.length <= pageSize;
            }

            // Set success status
            const status = { ready: true, loading: false, error: null };
            setStatus(status);


            if (status.ready) {
              // Set end of stream and partial stream states
              if (items.length === 0 && state.pageIndex > 0 && instance?.canPreviousPage) {
                // Edge case: no items and yet we are not on the first page.
                // This should not happen, unless something changed
                // between the end-of-stream check and the subsequent query.
                // If it happens, navigate back to the previous page.
                // Note: no need to perform a `setPageCount` here, because navigating 
                // to previous will trigger a new query,
                // which will perform a new end-of-stream check.
                instance?.previousPage();
                setEndOfStream(true);
                setPartialStream(false);
              } else if (isEndOfStream) {
                // Set page count to be exactly up until the current page (disallow "next")
                setPageCount(state.pageIndex + 1);
                setEndOfStream(true);

                if (isPartialStream) {
                  setPartialStream(true);
                } else {
                  setPartialStream(false);
                }
              } else {
                // Add one more page beyond the current page for the user to navigate to
                setPageCount(state.pageIndex + 2);
                setEndOfStream(false);
                setPartialStream(false);
              }
            }

            // Update table data
            updateItems(items);

            // Note: If current page has partial stream then 'isEndOfStream' is set to 'true'
            if (!isEndOfStream || isPartialStream) {
              // If the current page contains a partial stream or the end of the stream
              // hasn't been reached, then:
              //    1. If the current page has a partial stream in the page history, then replace it
              //       to ensure the latest partial page state is stored.
              //    2. If end of stream hasn't been reached, then add the current page state to the
              //       page history
              const itemLast = items.slice(-1)[0] || null;

              if (partialPageHistoryItem) {
                updatedPageHistory = updatedPageHistory.pop(state.pageIndex);
              }

              const pageHistoryItem = pageState !== undefined
                ? { itemLast, pageState }
                : { itemLast };

              updatedPageHistory = updatedPageHistory.push(state.pageIndex, pageHistoryItem);
            }

            // Update page history state
            updatedPageHistory.write();
          }).catch(reason => {
            console.error(reason);
            const error = reason instanceof Error ? reason : new Error('Unknown error');
            const status = { ready: false, loading: false, error };
            setStatus(status);
          });
        }

        return state;
      },
      useControlledState: state => {
        return ({
          ...state,
          pageSize,
          pageCount,
          endOfStream,
          partialStream,
        })
      },
      
      // https://react-table.tanstack.com/docs/faq
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
      pageCount,
    },
    ReactTable.useGlobalFilter,
    ReactTable.useFilters,
    ReactTable.useSortBy,
    ReactTable.usePagination,
    ReactTable.useRowSelect,
    useCustomFilters,
    
    ...plugins,
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  React.useEffect(() => {
    table.dispatch({ type: 'tableLoad' });
  }, []);

  const reload = () => {
    table.dispatch({ type: 'reload' });
  };
  
  // Note: the `table` reference is mutated, so cannot use it as dependency for `useMemo` directly
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    const context = React.useMemo<TableContextState<D>>(() => ({
    status,
    setStatus,
    reload,
    table,
  }), [
    JSON.stringify(status),
    table.state,
    ...Object.values(tableOptions),
  ]);
  
  const TableContext = React.useMemo(() => createTableContext<D>(), []);
  
  // If `pageSize` changes, we need to reset to the first page. Otherwise, our `previousItems` cache is no longer valid.
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
      React.useEffect(() => {
    if (table.state.pageIndex !== 0) {
      table.gotoPage(0);
    }
  }, [pageSize]);
  
  return (
    <TableContext.Provider value={context}>
      {children}
    </TableContext.Provider>
  );
};
TableProviderStream.displayName = 'TableProviderStream';

type DataTableStreamProps = Omit<React.ComponentPropsWithRef<typeof DataTableAsync>, 'table' | 'status'>;
export const DataTableStream = ({
  className,
  footer,
  placeholderEndOfTable,
  ...propsRest
}: DataTableStreamProps) => {
  const { status, table, reload } = useTable();
  
  const isLoading = status.loading;
  const isEmpty = status.ready && table.rows.length === 0;
  
  // Note: if `status.ready` is `false`, then we're already showing the skeleton loader
  const showLoadingIndicator = isLoading && status.ready;
  
  const isEndOfStreamReached = !isLoading
    && table?.state?.endOfStream;
  const isPartialStream = !isLoading
    && table?.state?.partialStream;

  const loadMore = () => {
    table.dispatch({ type: 'loadMore' });
  };

  const renderLoadMoreResults = () => {
    return <Button trimmed onPress={loadMore}>Load more results</Button>;
  };

  // Use `<Pagination/>` by default, unless the table is empty (in which case there are "zero" pages)
  const footerDefault = isEmpty
    ? null
    : (
      <PaginationStream
        renderLoadMoreResults={isEndOfStreamReached && isPartialStream ? renderLoadMoreResults :() => <></>}
      />
    );
  const footerWithFallback = typeof footer === 'undefined' ? footerDefault : footer;

  return (
    <DataTableAsync
      className={cx(
        { 'bk-data-table-stream': true },
        { 'bk-data-table-stream--loading': isLoading },
        className,
      )}
      status={status}
      table={table}
      footer={footerWithFallback}
      placeholderError={
        <DataTablePlaceholderError
          actions={
            <PlaceholderEmptyAction>
              <Button variant="primary" className="bk-button--with-icon" onPress={() => { reload(); }}>
                Retry
              </Button>
            </PlaceholderEmptyAction>
          }
        />
      }
      placeholderEndOfTable={
        isEndOfStreamReached && !isPartialStream
          ? placeholderEndOfTable
          : undefined
      }
      {...propsRest}
    >
      {showLoadingIndicator && <Spinner size="medium" className="table-spinner" />}
    </DataTableAsync>
  );
};
DataTableStream.displayName = 'DataTableStream';
