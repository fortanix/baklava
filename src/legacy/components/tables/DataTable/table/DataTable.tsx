/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ClassNameArgument, type ComponentProps } from '../../../../util/component_util.tsx';
import * as ReactTable from 'react-table';

import { useScroller } from '../../../util/Scroller.tsx';
import { BaklavaIcon } from '../../../icons/icon-pack-baklava/BaklavaIcon.tsx';
import { Button } from '../../../buttons/Button.tsx';

import {
  DataTablePlaceholderSkeleton,
  DataTablePlaceholderEmpty,
  DataTablePlaceholderError,
} from './DataTablePlaceholder.tsx';
import type { DataTableStatus } from '../DataTableContext.tsx';

import './DataTable.scss';


// Note: `placeholder` is included in `table` props as part of "Standard HTML Attributes", but it's not actually a
// valid `<table>` attribute, so we can override it.
type DataTableProps<D extends object> = Omit<ComponentProps<'table'>, 'placeholder'> & {
  table: ReactTable.TableInstance<D>,
  columnGroups?: undefined | React.ReactNode,
  footer?: undefined | React.ReactNode,
  placeholder?: undefined | React.ReactNode,
  endOfTablePlaceholder?: undefined | React.ReactNode,
  children?: undefined | React.ReactNode,
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
  const headerGroup = table.headerGroups[0];
  if (typeof headerGroup === 'undefined') { return null; }
  
  return (
    <table
      {...table.getTableProps()}
      {...propsRest}
      className={cx('bkl-data-table__table', props.className)}
    >
      {columnGroups}
      
      <thead>
        <tr {...headerGroup.getHeaderGroupProps()}>
          {/*<th/> {/ * Empty header for the selection checkbox column */}
          
          {headerGroup.headers.map((column: ReactTable.HeaderGroup<D>) => {
            const { key: headerKey, onClick: sortClick, ...headerProps } = column.getHeaderProps([
              // Note: the following are supported through custom interface merging in `react-table.d.ts`
              {
                className: column.className,
                style: column.style,
              },
              // Note: need the cast here as a workaround for an issue with `exactOptionalPropertyTypes`
              column.getSortByToggleProps() as ReactTable.TableHeaderProps,
            ]);
            
            return (
              <th
                key={headerKey}
                {...headerProps}
                title={undefined} // Unset the default `title` from `getHeaderProps()`
              >
                <div className="column-header"> {/* Wrapper element needed to serve as flex container */}
                  <span className="column-name">
                    {column.render('Header')}
                  </span>
                  {column.canSort &&
                    <Button plain onClick={sortClick} className="sort-button" aria-label="Sort column">
                      <BaklavaIcon
                        icon="arrow-drop-down"
                        className={cx('sort-indicator',
                          { 'sort-indicator--inactive': !column.isSorted },
                          { 'asc': !column.isSorted || (column.isSorted && !column.isSortedDesc) },
                          { 'desc': column.isSortedDesc },
                        )}
                      />
                    </Button>
                  }
                </div>
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody {...table.getTableBodyProps()}>
        {typeof placeholder !== 'undefined' &&
          <tr className="bkl-data-table__placeholder">
            <td colSpan={table.visibleColumns.length}>
              {placeholder}
            </td>
          </tr>
        }
        {typeof placeholder === 'undefined' && table.page.map(row => {
          table.prepareRow(row);
          const { key: rowKey, ...rowProps } = row.getRowProps();
          return (
            <tr key={rowKey} {...rowProps}>
              {/*<td className="bkl-table__row__select">
                <input type="checkbox"
                  checked={row.isSelected}
                  onClick={() => { row.toggleRowSelected(); }}
                />
              </td>*/}
              {row.cells.map(cell => {
                const { key: cellKey, ...cellProps } = cell.getCellProps();
                return (
                  <td key={cellKey} {...cellProps}>
                    {cell.render('Cell')}
                  </td>
                );
              })}
            </tr>
          );
        })}
        {typeof endOfTablePlaceholder !== 'undefined' &&
          <tr className="bkl-data-table__placeholder bkl-data-table__placeholder--row">
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
  classNameTable?: undefined | ClassNameArgument,
  placeholderEmpty?: undefined | React.ReactNode,
  placeholderSkeleton?: undefined | React.ReactNode,
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
  const scrollerProps = useScroller({ scrollDirection: 'horizontal' });

  const renderPlaceholder = (): React.ReactNode => {
    if (!status.ready) {
      return placeholderSkeleton;
    } else if (isEmpty) {
      return placeholderEmpty;
    } else {
      return undefined;
    }
  };
  
  // Note: the wrapper div isn't really necessary, but we include it for structural consistency with `DataTableAsync`
  return (
    <div
      className={cx('bkl bkl-data-table bkl-data-table--sync', className, scrollerProps.className)}
    >
      <DataTable
        {...propsRest}
        className={classNameTable}
        placeholder={renderPlaceholder()}
      />
    </div>
  );
};


type DataTableAsyncProps<D extends object> = DataTableProps<D> & {
  classNameTable?: undefined | ClassNameArgument,
  status: DataTableStatus,
  placeholderSkeleton?: undefined | React.ReactNode,
  placeholderEmpty?: undefined | React.ReactNode,
  placeholderError?: undefined | React.ReactNode,
  placeholderEndOfTable?: undefined | React.ReactNode,
  children?: undefined | React.ReactNode,
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
  const scrollerProps = useScroller({ scrollDirection: 'horizontal' });

  const renderPlaceholder = (): React.ReactNode => {
    if (isFailed) {
      return placeholderError;
    } else if (isLoading) {
      // If there is still valid cached data, show it, otherwise show a skeleton placeholder
      return status.ready ? undefined : placeholderSkeleton;
    } else if (isEmpty) {
      return placeholderEmpty;
    } else {
      return undefined;
    }
  };

  return (
    <div
      className={cx('bkl bkl-data-table bkl-data-table--async', props.className, scrollerProps.className)}
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
