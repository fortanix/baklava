/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type * as React from 'react';
import { classNames as cx, type ClassNameArgument, type ComponentProps } from '../../../../util/componentUtil.ts';
import type * as ReactTable from 'react-table';

import { useScroller } from '../../../../layouts/util/Scroller.tsx';
import { Icon } from '../../../graphics/Icon/Icon.tsx';

import {
  DataTablePlaceholderSkeleton,
  DataTablePlaceholderEmpty,
  DataTablePlaceholderError,
} from './DataTablePlaceholder.tsx';
import type { DataTableStatus } from '../DataTableContext.tsx';

import './DataTable.scss';


// Note: `placeholder` is included in `table` props as part of "Standard HTML Attributes", but it's not actually a
// valid `<table>` attribute, so we can safely override it.
type DataTableProps<D extends object> = Omit<ComponentProps<'table'>, 'placeholder'> & {
  table: ReactTable.TableInstance<D>,
  columnGroups?: React.ReactNode,
  footer?: React.ReactNode,
  placeholder?: React.ReactNode,
  endOfTablePlaceholder?: React.ReactNode,
  children?: React.ReactNode,
};
export const DataTable = <D extends object>(props: DataTableProps<D>) => {
  const {
    table,
    columnGroups,
    footer,
    placeholder,
    endOfTablePlaceholder,
    children,
    ...propsRest
  } = props;
  
  // Currently we only support one header group
  const headerGroup: undefined | ReactTable.HeaderGroup<D> = table.headerGroups[0];
  if (!headerGroup) { return null; }
  
  return (
    <table
      {...table.getTableProps()}
      className={cx('bk-data-table__table', props.className)}
    >
      {columnGroups}
      
      <thead>
        <tr {...headerGroup.getHeaderGroupProps()}>
          {/*<th/> {/ * Empty header for the selection checkbox column */}
          
          {headerGroup.headers.map((column: ReactTable.HeaderGroup<D>) => {
            const { key: headerKey, ...headerProps } = column.getHeaderProps([
              // Note: the following are supported through custom interface merging in `src/types/react-table.d.ts`
              {
                className: column.className,
                style: column.style,
              },
              column.getSortByToggleProps(),
            ]);
            
            return (
              <th
                {...headerProps}
                key={headerKey}
                title={undefined} // Unset the default `title` from `getHeaderProps()`
              >
                <div className="column-header"> {/* Wrapper element needed to serve as flex container */}
                  <span className="column-name">
                    {column.render('Header')}
                  </span>
                  {column.canSort &&
                    <Icon icon="caret-down"
                      className={cx('sort-indicator',
                        { 'sort-indicator--inactive': !column.isSorted },
                        { 'asc': !column.isSorted || (column.isSorted && !column.isSortedDesc) },
                        { 'desc': column.isSortedDesc },
                      )}
                    />
                  }
                </div>
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody {...table.getTableBodyProps()}>
        {typeof placeholder !== 'undefined' &&
          <tr className="bk-data-table__placeholder">
            <td colSpan={table.visibleColumns.length}>
              {placeholder}
            </td>
          </tr>
        }
        {typeof placeholder === 'undefined' && table.page.map(row => {
          table.prepareRow(row);
          const { key: rowKey, ...rowProps } = row.getRowProps();
          return (
            <tr {...rowProps} key={rowKey} className={cx(rowProps.className, {'selected' : row.isSelected})}>
              {/*<td className="bk-table__row__select">
                <input type="checkbox"
                  checked={row.isSelected}
                  onClick={() => { row.toggleRowSelected(); }}
                />
              </td>*/}
              {row.cells.map(cell => {
                const { key: cellKey, ...cellProps } = cell.getCellProps();
                return (
                  <td {...cellProps} key={cellKey}>
                    {cell.render('Cell')}
                  </td>
                );
              })}
            </tr>
          );
        })}
        {typeof endOfTablePlaceholder !== 'undefined' &&
          <tr className="bk-data-table__placeholder bk-data-table__placeholder--row">
            <td colSpan={table.visibleColumns.length}>
              {endOfTablePlaceholder}
            </td>
          </tr>
        }
      </tbody>
      
      {footer &&
        <tfoot>
          <tr>
            <td colSpan={table.visibleColumns.length}>
              {footer}
            </td>
          </tr>
        </tfoot>
      }
    </table>
  );
};


type DataTableSyncProps<D extends object> = DataTableProps<D> & {
  classNameTable?: ClassNameArgument,
  placeholderEmpty?: React.ReactNode,
  placeholderSkeleton?: React.ReactNode,
  status: DataTableStatus,
};
export const DataTableSync = <D extends object>(props: DataTableSyncProps<D>) => {
  const {
    className,
    classNameTable,
    placeholderEmpty = <DataTablePlaceholderEmpty/>,
    placeholderSkeleton = <DataTablePlaceholderSkeleton/>,
    status,
    ...propsRest
  } = props;
  
  const isEmpty = status.ready && props.table.page.length === 0;
  const scrollProps = useScroller({ scrollDirection: 'horizontal' });
  const renderPlaceholder = (): React.ReactNode => {
    if (!status.ready) {
      return placeholderSkeleton;
    }
    if (isEmpty) {
      return placeholderEmpty;
    }
    return undefined;
  };
  
  // Note: the wrapper div isn't really necessary, but we include it for structural consistency with `DataTableAsync`
  return (
    <div
      {...scrollProps}
      className={cx('bk-data-table bk-data-table--sync', className, scrollProps.className)}
    >
      <DataTable
        {...propsRest}
        className={classNameTable}
        placeholder={renderPlaceholder()}
      />
    </div>
  );
};
DataTableSync.displayName = 'DataTableSync';


type DataTableAsyncProps<D extends object> = DataTableProps<D> & {
  classNameTable?: ClassNameArgument,
  status: DataTableStatus,
  placeholderSkeleton?: React.ReactNode,
  placeholderEmpty?: React.ReactNode,
  placeholderError?: React.ReactNode,
  placeholderEndOfTable?: React.ReactNode,
  children?: React.ReactNode,
};
export const DataTableAsync = <D extends object>(props: DataTableAsyncProps<D>) => {
  const {
    className,
    classNameTable,
    status,
    placeholderSkeleton = <DataTablePlaceholderSkeleton/>,
    placeholderEmpty = <DataTablePlaceholderEmpty/>,
    placeholderError = <DataTablePlaceholderError/>,
    placeholderEndOfTable,
    children,
    ...propsRest
  } = props;
  const table = props.table;
  
  const isFailed = status.error !== null;
  const isLoading = status.loading;
  const isEmpty = status.ready && table.page.length === 0;
  const scrollProps = useScroller({ scrollDirection: 'horizontal' });
  
  const renderPlaceholder = (): React.ReactNode => {
    if (isFailed) {
      return placeholderError;
    }
    if (isLoading) {
      // If there is still valid cached data, show it, otherwise show a skeleton placeholder
      return status.ready ? undefined : placeholderSkeleton;
    }
    if (isEmpty) {
      return placeholderEmpty;
    }
    return undefined;
  };
  
  return (
    <div
      {...scrollProps}
      className={cx('bk-data-table bk-data-table--async', props.className, scrollProps.className)}
    >
      {children}
      
      <DataTable
        {...propsRest}
        className={props.classNameTable}
        placeholder={renderPlaceholder()}
        endOfTablePlaceholder={placeholderEndOfTable}
      />
    </div>
  );
};
