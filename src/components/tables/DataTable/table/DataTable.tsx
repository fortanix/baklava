/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ClassNameArgument, type ComponentProps } from '../../../../util/componentUtil.ts';
import type * as ReactTable from 'react-table';

import { useScroller } from '../../../../layouts/util/Scroller.tsx';
import { IconButton } from '../../../actions/IconButton/IconButton.tsx';
import { TextLine } from '../../../text/TextLine/TextLine.tsx';

import {
  DataTablePlaceholderSkeleton,
  DataTablePlaceholderEmpty,
  DataTablePlaceholderError,
} from './DataTablePlaceholder.tsx';
import type { DataTableStatus } from '../DataTableContext.tsx';

import cl from './DataTable.module.scss';

const getFlexValueFromColumn = <D extends object>(col: ReactTable.ColumnInstance<D>) => {
  return (col?.bkColumnWidth?.flex ?? 1); // defaults to 1
};

const getFlexColumnWidth = <D extends object>(col: ReactTable.ColumnInstance<D>) => {
  return (col?.bkColumnWidth?.width ?? 0);
};

const isFlexColumn = <D extends object>(col: ReactTable.ColumnInstance<D>) => {
  return (col && Object.hasOwn(col, 'bkColumnWidth'));
};

const requireNewCol = <D extends object>(col: ReactTable.ColumnInstance<D>) => {
  return (isFlexColumn(col) && (col.bkColumnWidth?.flex ?? 0) > 0);
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

export const generateCustomColGroup = <D extends object>(
  allColumns: ReactTable.ColumnInstance<D>[],
  columnGroups?: React.ReactNode): React.ReactNode | null => {
  if (columnGroups) {
    return columnGroups;
  } else {
    // Generate a new <colgroup>
    const cols: React.ReactNode[] = [];

    allColumns.forEach((col) => {
      cols.push(
        <col
          key={`${col.id}-base`}
          style={{
            ...col.style,
            inlineSize: isFlexColumn(col) ? getFlexColumnWidth(col) : col?.style?.width ?? '10ch'
          }}
        />
      );
      if (requireNewCol(col)) {
        //Add extra dummy cols for using colspan
        cols.push(
          <col
            key={`${col.id}-stretch`}
            style={{
              inlineSize: `${calculateFlexPercentage(allColumns, col)}%`
            }}
          />
        );
      }
    });

    return <colgroup>{cols}</colgroup>;
  }
};

const getTotalColSpan = <D extends object>(columns: ReactTable.ColumnInstance<D>[]) => {
  return columns.reduce((total, col) => total + (requireNewCol(col) ? 2 : 1), 0);
};

type ColumnPosition = 'first' | 'last';

export const isColumnAtPosition = <D extends object>(
  column: ReactTable.ColumnInstance<D>,
  visibleColumns: ReactTable.ColumnInstance<D>[],
  position: ColumnPosition
): boolean => {
  if (position === 'first') {
    return column.id === visibleColumns[0]?.id;
  } else if (position === 'last') {
    return column.id === visibleColumns[visibleColumns.length - 1]?.id;
  }

  return false;
};

const isColumnSticky = <D extends object>(
  position: ColumnPosition,
  column: ReactTable.ColumnInstance<D>,
  table: ReactTable.TableInstance<D>,
) => {
  return isColumnAtPosition(column, table.visibleColumns, position)
    && !!table?.bkStickyColumns
    && (table?.bkStickyColumns === position || table?.bkStickyColumns === 'both')
};

const getCommonClassNamesForColumn = <D extends object>(
  column: ReactTable.ColumnInstance<D>,
  table: ReactTable.TableInstance<D>,
) => {
  return ({
    [cl['column-sticky']]: (isColumnSticky('last', column, table)
      || isColumnSticky('first', column, table)),
    [cl['column-sticky--right']]: isColumnSticky('last', column, table),
    [cl['column-sticky--left']]: isColumnSticky('first', column, table),
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

  const scrollWrapperRef = React.useRef<HTMLDivElement>(null);
  const [overflowPosition, setOverflowPosition] = React.useState<'left' | 'right' | 'center' | null>(null);
  const scrollProps = useScroller({ scrollDirection: 'horizontal' });
  
  // biome-ignore lint/correctness/useExhaustiveDependencies: Required for column manager
  React.useEffect(() => {
    const el = scrollWrapperRef.current;

    if (!el) return;

    const updateOverflowPosition = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;

      // If no horizontal overflow, reset position
      if (scrollWidth <= clientWidth) {
        setOverflowPosition(null);
        return;
      }

      const atStart = scrollLeft === 0;
      const atEnd = Math.ceil(scrollLeft + clientWidth) >= scrollWidth;

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
  }, [table.visibleColumns]);
  
  const customColGroup = React.useMemo(() => generateCustomColGroup(table.visibleColumns, columnGroups),
    [table.visibleColumns, columnGroups]);
  
  // Currently we only support one header group
  const headerGroup: undefined | ReactTable.HeaderGroup<D> = table.headerGroups[0];
  if (!headerGroup) { return null; }
  
  const { key, ...HeaderGroupPropsRest } = headerGroup.getHeaderGroupProps();
  
  return (
    <>
      <div
        {...scrollProps}
        ref={scrollWrapperRef}
        className={cx(cl['bk-data-table-container'], {
            [cl['bk-data-table-container--scrolled-left']]: overflowPosition === 'left'
              || overflowPosition === 'center',
            [cl['bk-data-table-container--scrolled-right']]: overflowPosition === 'right'
              || overflowPosition === 'center',
          },
          scrollProps.className
        )}
      >
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
                
                const useExtraColSpan = requireNewCol(column);
                                                    
                const getSortIconLabel = () => {
                  if (!column.isSorted) {
                    return 'Change sort order';
                  };
                  return `Change to ${column.isSortedDesc ? 'ascending' : 'descending'} sort`;
                };

                return (
                  <th
                    {...headerProps}
                    key={headerKey}
                    title={undefined} // Unset the default `title` from `getHeaderProps()`
                    {...useExtraColSpan ? { colSpan: 2 } : {}}
                    className={cx(headerProps.className, getCommonClassNamesForColumn(column, table))}
                  >
                    <div className={cx(cl['column-header'])}> {/* Wrapper element needed to serve as flex container */}
                      {typeof column.render('Header') === 'string'
                        ? <TextLine>{column.render('Header')}</TextLine>
                        : column.render('Header')
                      }
                      {column.canSort &&
                        <IconButton 
                          icon="caret-down"
                          label={getSortIconLabel()}
                          className={cx(
                            cl['sort-indicator'],
                            { [cl['sort-indicator--inactive']]: !column.isSorted },
                            { [cl['asc']]: (column.isSorted && !column.isSortedDesc) },
                            { [cl['desc']]: (column.isSorted && column.isSortedDesc) },
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
                    const useExtraColSpan = requireNewCol(cell.column);
                  
                    return (
                      <td {...cellProps} key={cellKey} {...useExtraColSpan ? { colSpan: 2 } : {}} 
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
    </>
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
      className={cx(cl['bk-data-table'], cl['bk-data-table--sync'], className )}
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
      className={cx(cl['bk-data-table'], cl['bk-data-table--async'], props.className )}
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
