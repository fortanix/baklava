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

type ExpandableRowBaseProps<D extends object> = {
  render: (row: ReactTable.Row<D>) => React.ReactNode,
  allowMultiple?: boolean,
};

type ExpandableRowUncontrolledProps<D extends object> = ExpandableRowBaseProps<D> & {
  expandedRowIds?: never,
  onExpandedRowIdsChange?: never,
};

type ExpandableRowControlledProps<D extends object> = ExpandableRowBaseProps<D> & {
  expandedRowIds: Array<string>,
  onExpandedRowIdsChange: (expandedRowIds: Array<string>) => void,
};

type ExpandableRowProps<D extends object> =
  | ExpandableRowUncontrolledProps<D>
  | ExpandableRowControlledProps<D>;

export type DataTableProps<D extends object> = Omit<ComponentProps<'table'>, 'placeholder'> & {
  table: ReactTable.TableInstance<D>,
  columnGroups?: React.ReactNode,
  footer?: React.ReactNode,
  // Note: `placeholder` is included in `table` props as part of "Standard HTML Attributes", but it's not actually a
  // valid `<table>` attribute, so we can safely override it.
  placeholder?: React.ReactNode,
  endOfTablePlaceholder?: React.ReactNode,
  expandableRow?: ExpandableRowProps<D>,
  highlightedRowId?: string | undefined,
  children?: React.ReactNode,
};

type DataTableRowProps<D extends object> = {
  row: ReactTable.Row<D>,
  table: ReactTable.TableInstance<D>,
  expandableRowContent?: React.ReactNode,
  isExpanded: boolean,
  highlightedRowId: string | undefined,
  onToggleExpandedRow?: () => void,
};

const BLOCK_SIZE_COLLAPSED = '0';
const BLOCK_SIZE_AUTO = 'auto';

const getMeasuredBlockSize = (element: HTMLDivElement) => `${element.scrollHeight}px`;

const DataTableRow = <D extends object>(props: DataTableRowProps<D>) => {
  const {
    row,
    table,
    expandableRowContent,
    isExpanded,
    highlightedRowId,
    onToggleExpandedRow,
  } = props;
  const { key: rowKey, ...rowProps } = row.getRowProps();
  const hasExpandableRowContent =
    typeof expandableRowContent !== 'undefined' && expandableRowContent !== null;
  const canToggleExpandedRow = hasExpandableRowContent && typeof onToggleExpandedRow === 'function';
  const [isExpandedContentMounted, setIsExpandedContentMounted] = React.useState(
    isExpanded && hasExpandableRowContent,
  );
  const [expandedContentBlockSize, setExpandedContentBlockSize] = React.useState<string>(
    isExpanded && hasExpandableRowContent ? BLOCK_SIZE_AUTO : BLOCK_SIZE_COLLAPSED,
  );
  const expandedRowContentRef = React.useRef<HTMLDivElement>(null);
  const expandedContentBlockSizeRef = React.useRef(expandedContentBlockSize);

  expandedContentBlockSizeRef.current = expandedContentBlockSize;

  React.useEffect(() => {
    if (isExpanded && hasExpandableRowContent) {
      setIsExpandedContentMounted(true);
    }
  }, [hasExpandableRowContent, isExpanded]);

  React.useLayoutEffect(() => {
    if (!isExpandedContentMounted || !hasExpandableRowContent) {
      return;
    }

    const contentElement = expandedRowContentRef.current;
    if (!contentElement) {
      return;
    }

    const measuredBlockSize = getMeasuredBlockSize(contentElement);
    let frameId = 0;

    if (isExpanded) {
      // Start collapsed, then expand on the next frame so the browser has a real size transition to animate.
      if (expandedContentBlockSizeRef.current !== BLOCK_SIZE_COLLAPSED) {
        setExpandedContentBlockSize(BLOCK_SIZE_COLLAPSED);
      }

      frameId = requestAnimationFrame(() => {
        setExpandedContentBlockSize(measuredBlockSize);
      });
    } else if (expandedContentBlockSizeRef.current === BLOCK_SIZE_AUTO) {
      // When closing from `auto`, freeze the current height first, then collapse on the next frame.
      setExpandedContentBlockSize(measuredBlockSize);
      frameId = requestAnimationFrame(() => {
        setExpandedContentBlockSize(BLOCK_SIZE_COLLAPSED);
      });
    } else {
      setExpandedContentBlockSize(BLOCK_SIZE_COLLAPSED);
    }

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [hasExpandableRowContent, isExpanded, isExpandedContentMounted]);

  const handleExpandedRowTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (event.propertyName !== 'height' && event.propertyName !== 'block-size') {
      return;
    }

    if (isExpanded) {
      // Once open, switch back to `auto` so the content can resize naturally without fighting the animation.
      setExpandedContentBlockSize(BLOCK_SIZE_AUTO);
      return;
    }

    // Keep the detail row mounted until the closing transition finishes.
    setIsExpandedContentMounted(false);
  };

  const handleCaretPress = () => {
    if (!canToggleExpandedRow || !onToggleExpandedRow) {
      return;
    }

    onToggleExpandedRow();
  };

  return (
    <React.Fragment key={rowKey}>
      <tr
        {...rowProps}
        className={cx(
          rowProps.className,
          { [cl['selected']]: row.isSelected },
          { [cl['bk-data-table__row--expandable-open']]: isExpandedContentMounted },
          { [cl['bk-data-table__row--highlighted']]: row.id === highlightedRowId },
        )}
      >
        {row.cells.map(cell => {
          const { key: cellKey, ...cellProps } = cell.getCellProps();
          const useExtraColSpan = requireNewCol(cell.column);
          const isFirstCell = row.cells[0]?.column.id === cell.column.id;

          return (
            <td {...cellProps} key={cellKey} {...useExtraColSpan ? { colSpan: 2 } : {}}
              className={cx(cellProps.className, getCommonClassNamesForColumn(cell.column, table))}
            >
              <div className={cx(
                cl['bk-data-table__text-cell'],
                { [cl['bk-data-table__text-cell--expandable-toggle']]: hasExpandableRowContent && isFirstCell },
              )}>
                {hasExpandableRowContent && isFirstCell &&
                  <IconButton
                    unstyled
                    trimmed
                    label={isExpanded ? 'Collapse row' : 'Expand row'}
                    icon={isExpanded ? 'caret-up' : 'caret-down'}
                    className={cx(cl['bk-data-table__expandable-row-toggle'])}
                    iconClassName={cx(cl['bk-data-table__expandable-row-toggle-icon'])}
                    onPress={handleCaretPress}
                  />
                }
                {cell.render('Cell')}
              </div>
            </td>
          );
        })}
      </tr>
      {isExpandedContentMounted && hasExpandableRowContent &&
        <tr className={cx(cl['bk-data-table__expandable-row'])}>
          <td colSpan={getTotalColSpan(table.visibleColumns)}>
            <div
              ref={expandedRowContentRef}
              className={cx(
                cl['bk-data-table__expandable-row-content'],
                { [cl['bk-data-table__expandable-row-content--open']]: isExpanded },
              )}
              style={{ blockSize: expandedContentBlockSize }}
              onTransitionEnd={handleExpandedRowTransitionEnd}
            >
              <div className={cx(cl['bk-data-table__expandable-row-content-inner'])}>
                {expandableRowContent}
              </div>
            </div>
          </td>
        </tr>
      }
    </React.Fragment>
  );
};
export const DataTable = <D extends object>(props: DataTableProps<D>) => {
  const {
    table,
    columnGroups,
    footer,
    placeholder,
    endOfTablePlaceholder,
    expandableRow,
    children,
    highlightedRowId,
    ...propsRest
  } = props;
  const [expandedRowIdsInternal, setExpandedRowIdsInternal] = React.useState<Array<string>>([]);
  const expandedRowIds = expandableRow?.expandedRowIds ?? expandedRowIdsInternal;
  const allowMultipleExpandedRows = expandableRow?.allowMultiple ?? false;

  const setExpandedRowIds = React.useCallback((nextExpandedRowIds: Array<string>) => {
    expandableRow?.onExpandedRowIdsChange?.(nextExpandedRowIds);

    if (typeof expandableRow?.expandedRowIds === 'undefined') {
      setExpandedRowIdsInternal(nextExpandedRowIds);
    }
  }, [expandableRow]);

  const toggleExpandedRow = React.useCallback((rowId: string) => {
    const isExpanded = expandedRowIds.includes(rowId);

    if (allowMultipleExpandedRows) {
      setExpandedRowIds(isExpanded
        ? expandedRowIds.filter(expandedRowId => expandedRowId !== rowId)
        : [...expandedRowIds, rowId]);
      return;
    }

    setExpandedRowIds(isExpanded ? [] : [rowId]);
  }, [allowMultipleExpandedRows, expandedRowIds, setExpandedRowIds]);

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
                
                const getAriaSort = () => {
                  if (!column.canSort || !column.isSorted) { return undefined };
                  return column.isSortedDesc ? 'descending' : 'ascending';
                };
                
                const getSortIconLabel = () => {
                  if (!column.isSorted) {
                    return 'Change sort order';
                  };
                  return `Change to ${column.isSortedDesc ? 'ascending' : 'descending'} sort`;
                };
                
                return (
                  <th
                    aria-sort={getAriaSort()}
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
              const expandableRowContent = expandableRow?.render(row);
              const hasExpandableRowContent =
                typeof expandableRowContent !== 'undefined' && expandableRowContent !== null;

              return (
                <DataTableRow
                  key={row.id}
                  row={row}
                  table={table}
                  expandableRowContent={expandableRowContent}
                  isExpanded={hasExpandableRowContent && expandedRowIds.includes(row.id)}
                  highlightedRowId={highlightedRowId}
                  {...(hasExpandableRowContent
                    ? {
                      onToggleExpandedRow: () => {
                        toggleExpandedRow(row.id);
                      },
                    }
                    : {})}
                />
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


export type DataTableSyncProps<D extends object> = DataTableProps<D> & {
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
      className={cx(cl['bk-data-table'], cl['bk-data-table--sync'], className)}
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
      className={cx(cl['bk-data-table'], cl['bk-data-table--async'], props.className)}
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
