/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type * as React from 'react';
import { Children, isValidElement, cloneElement, useRef, useState, useEffect } from 'react';
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

import cl from './DataTable.module.scss';

type ColElement = React.ReactElement<{ style?: React.CSSProperties }>;
type IdentifierColumnConfig = { columnId: string, sticky?: boolean };
type ActionColumnConfig = { columnId: string, sticky?: boolean };

const getFlexValueFromColumn = <D extends object>(col: ReactTable.ColumnInstance<D>) => {
  return (col?.bkColumnWidth?.flex ?? 1); // defaults to 1
};

const getFlexColumnWidth = <D extends object>(col: ReactTable.ColumnInstance<D>) => {
  return (col?.bkColumnWidth?.width ?? 0);
};

const isFlexColumn = <D extends object>(col: ReactTable.ColumnInstance<D>) => {
  return (col && Object.hasOwn(col, 'bkColumnWidth'));
};

const calculateFlexPercentage = <D extends object>(
  allColumns: ReactTable.ColumnInstance<D>[],
  targetColumn: ReactTable.ColumnInstance<D>
) => {
  if (!isFlexColumn(targetColumn)) {
    return 0;    
  }

  const targetColumnFlex = getFlexValueFromColumn(targetColumn);
  const totalFlex = allColumns.reduce((total, column) => total + getFlexValueFromColumn(column), 0);
  
  if (targetColumnFlex === 0) {
    return 0;
  }
  
  return totalFlex > 0 ? Math.round((targetColumnFlex / totalFlex) * 100) : 0;
};

export function useCustomColGroup<D extends object>(
  allColumns: ReactTable.ColumnInstance<D>[],
  columnGroups?: React.ReactNode,
): React.ReactNode | null {
  const hasFlexColumn = allColumns.some((col) => isFlexColumn(col));

  if (columnGroups && isValidElement(columnGroups) && columnGroups.type === 'colgroup') {
    const colGroup = columnGroups as React.ReactElement<{ children?: React.ReactNode }, 'colgroup'>;

    if (!hasFlexColumn) {
      return colGroup;
    }
    
    // Condition to handle colgroup passes as a prop from consumer

    // For each original <col>, render original + new <col> with flex width as specified
    const newCols: React.ReactNode[] = [];

    Children.forEach(colGroup.props.children, (child, i) => {
      // Add original col
      const col = allColumns[i];
      
      if (isValidElement(child) && col) {
        const element = child as ColElement;
        const baseStyle = element.props.style ?? {};
        
        const style = isFlexColumn(col)
          ? {
              ...baseStyle,
              width: getFlexColumnWidth(col),
            }
          : {
              ...baseStyle,
              width: '10ch',
            };
          
        newCols.push(
          cloneElement(element, {
            ...element.props,
            key: `${col.id}-base`,
            style,
          })
        );
      
        // Add new col with flex width if present
        if (col && isFlexColumn(col)) {
          newCols.push(
            <col
              key={`${col.id}-stretch`}
              style={{ width: `${calculateFlexPercentage(allColumns, col)}%` }}
            />
          );
        }
      }
    });

    return cloneElement(colGroup, {}, newCols);
  } else {
    // Generate a new <colgroup>
    const cols: React.ReactNode[] = [];

    allColumns.forEach((col) => {
      cols.push(
        <col
          key={`${col.id}-base`}
          style={{ width: isFlexColumn(col) ? getFlexColumnWidth(col) : '10ch' }}
        />
      );
      if (isFlexColumn(col)) {
        //Add extra dummy cols for using colspan
        cols.push(
          <col
            key={`${col.id}-stretch`}
            style={{ width: `${calculateFlexPercentage(allColumns, col)}%` }}
          />
        );
      }
    });

    return <colgroup>{cols}</colgroup>;
  }
};

const getTotalColSpan = <D extends object>(columns: ReactTable.ColumnInstance<D>[]) => {
  return columns.reduce((total, col) => total + (isFlexColumn(col) ? 2 : 1), 0);
};

const isActionColumn = <D extends object>(column: ReactTable.ColumnInstance<D>, config?: ActionColumnConfig) => {
  return !!(column && Object.hasOwn(column, 'id') && config?.columnId && column.id && config.columnId === column.id);
};

const isActionColumnSticky = <D extends object>(
  column: ReactTable.ColumnInstance<D>,
  config?: ActionColumnConfig
) => {
  return isActionColumn(column, config) && !!config?.sticky;
};

const isIdentifierColumn = <D extends object>(
  column: ReactTable.ColumnInstance<D>,
  config?: IdentifierColumnConfig
) => {
  return !!(column && Object.hasOwn(column, 'id') && config?.columnId && column.id && config.columnId === column.id);
};

const isIdentifierColumnSticky = <D extends object>(
  column: ReactTable.ColumnInstance<D>,
  config?: ActionColumnConfig
) => {
  return isIdentifierColumn(column, config) && !!config?.sticky;
};

const getCommonClassNamesForColumn = <D extends object>(
  column: ReactTable.ColumnInstance<D>,
  table: ReactTable.TableInstance<D>,
) => {
  return ({
    [cl['column-action']]: isActionColumn(column, table.actionColumnConfig),
    [cl['column-sticky']]: (isActionColumnSticky(column, table.actionColumnConfig)
      || isIdentifierColumnSticky(column, table.identifierColumnConfig)),
    [cl['column-sticky--right']]: isActionColumnSticky(column, table.actionColumnConfig),
    [cl['column-sticky--left']]: isIdentifierColumnSticky(column, table.identifierColumnConfig),
  });
};

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

  const scrollWrapperRef = useRef<HTMLDivElement>(null);
  const [overflowPosition, setOverflowPosition] = useState<'left' | 'right' | 'center' | null>(null);
  
  useEffect(() => {
    const el = scrollWrapperRef.current;
    if (!el) return;
  
    const updateOverflowPosition = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      const atStart = scrollLeft === 0;
      const atEnd = scrollLeft + clientWidth >= scrollWidth;
    
      let position: 'left' | 'right' | 'center';
    
      if (atStart) {
        position = 'left';
      } else if (atEnd) {
        position = 'right';
      } else {
        position = 'center';
      }
    
      setOverflowPosition(position);
    };
  
    updateOverflowPosition();
  
    el.addEventListener('scroll', updateOverflowPosition);
    window.addEventListener('resize', updateOverflowPosition);
  
    return () => {
      el.removeEventListener('scroll', updateOverflowPosition);
      window.removeEventListener('resize', updateOverflowPosition);
    };
  }, []);
    
  // Currently we only support one header group
  const headerGroup: undefined | ReactTable.HeaderGroup<D> = table.headerGroups[0];
  if (!headerGroup) { return null; }
  
  const { key, ...HeaderGroupPropsRest } = headerGroup.getHeaderGroupProps();
  
  const customColGroup = useCustomColGroup(table.visibleColumns, columnGroups);
  
  return (
    <div className={cl['bk-data-table__wrapper']}>
      <div
        ref={scrollWrapperRef}
        className={cx(cl['bk-data-table__scroll-wrapper'], {
          [cl['bk-data-table__scrolled-left']]: overflowPosition === 'left' || overflowPosition === 'center',
          [cl['bk-data-table__scrolled-right']]: overflowPosition === 'right' || overflowPosition === 'center',
        }
      )}>
        <table
          {...table.getTableProps()}
          className={cx(cl['bk-data-table__table'], props.className)}
        >
          {customColGroup}
          
          <thead>
            <tr key={key} {...HeaderGroupPropsRest}>
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
                
                const hasFlexColumnProps = isFlexColumn(column);
                
                return (
                  <th
                    {...headerProps}
                    key={headerKey}
                    title={undefined} // Unset the default `title` from `getHeaderProps()`
                    {...hasFlexColumnProps ? { colSpan: 2 } : {}}
                    className={cx(headerProps.className, getCommonClassNamesForColumn(column, table))}
                  >
                    <div className={cx(cl['column-header'])}> {/* Wrapper element needed to serve as flex container */}
                      {column.render('Header')}
                      {column.canSort &&
                        <Icon icon="caret-down"
                          className={cx(
                            cl['sort-indicator'],
                            { [cl['sort-indicator--inactive']]: !column.isSorted },
                            { [cl['asc']]: !column.isSorted || (column.isSorted && !column.isSortedDesc) },
                            { [cl['desc']]: column.isSortedDesc },
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
              <tr className={cx(cl['bk-data-table__placeholder'])}>
                <td colSpan={getTotalColSpan(table.visibleColumns)}>
                  {placeholder}
                </td>
              </tr>
            }
            {typeof placeholder === 'undefined' && table.page.map(row => {
              table.prepareRow(row);
              const { key: rowKey, ...rowProps } = row.getRowProps();
              return (
                <tr {...rowProps} key={rowKey} className={cx(rowProps.className, { [cl['selected']]: row.isSelected })}>
                  {/*<td className="bk-table__row__select">
                    <input type="checkbox"
                      checked={row.isSelected}
                      onChange={() => { row.toggleRowSelected(); }}
                    />
                  </td>*/}
                  {row.cells.map(cell => {
                    const { key: cellKey, ...cellProps } = cell.getCellProps();
                    const hasFlexColumnProps = isFlexColumn(cell.column);
                  
                    return (
                      <td {...cellProps} key={cellKey} {...hasFlexColumnProps ? { colSpan: 2 } : {}} 
                        className={cx(cellProps.className, getCommonClassNamesForColumn(cell.column, table))}
                      >
                        <div className={cx(cl['bk-data-table__text-cell'])}>
                          {cell.render('Cell')}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {typeof endOfTablePlaceholder !== 'undefined' &&
              <tr className={cx(cl['bk-data-table__placeholder'], cl['bk-data-table__placeholder--row'])}>
                <td colSpan={getTotalColSpan(table.visibleColumns)}>
                  {endOfTablePlaceholder}
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
        
      {footer &&
        <div className={cx(cl['bk-data-table__footer'])}>
          {footer}
        </div>
      }
    </div>
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
    placeholderEmpty = <DataTablePlaceholderEmpty />,
    placeholderSkeleton = <DataTablePlaceholderSkeleton />,
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
      className={cx(cl['bk-data-table'], cl['bk-data-table--sync'], className, scrollProps.className)}
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


export type DataTableAsyncProps<D extends object> = DataTableProps<D> & {
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
    placeholderSkeleton = <DataTablePlaceholderSkeleton />,
    placeholderEmpty = <DataTablePlaceholderEmpty />,
    placeholderError = <DataTablePlaceholderError />,
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
      className={cx(cl['bk-data-table'], cl['bk-data-table--async'], props.className, scrollProps.className)}
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
