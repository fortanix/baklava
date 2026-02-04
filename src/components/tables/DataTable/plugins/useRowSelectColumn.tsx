/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import * as React from 'react';
import type * as ReactTable from 'react-table';

import { Checkbox } from '../../../forms/controls/Checkbox/Checkbox.tsx';
import { Radio } from '../../../forms/controls/Radio/Radio.tsx';
import cl from './useRowSelectColumn.module.scss';

type ColumnWithSelector<D extends object> = ReactTable.ColumnInstance<D> & {
  __rowSelectorInjected?: boolean;
};

function renderElement<P>(
  renderer: ReactTable.Renderer<P> | undefined,
  props: P,
  fallback?: React.ReactNode,
): React.ReactNode {
  if (renderer == null) return fallback ?? null;

  if (React.isValidElement(renderer)) {
    return renderer;
  }

  if (typeof renderer === 'function') {
    return React.createElement(renderer as React.ElementType, props as unknown as Record<string, unknown>);
  }

  return renderer;
}

// `react-table` plugin for row selection column. Note: depends on `react-table`'s `useRowSelect` plugin.
export const useRowSelectColumn = <D extends object>(hooks: ReactTable.Hooks<D>): void => {
  hooks.visibleColumns.push(columns => {
    const first = columns[0] as ColumnWithSelector<D> | undefined;
    if (!first || first.__rowSelectorInjected) return columns;

    first.__rowSelectorInjected = true;

    const OriginalHeader = first.Header;
    const OriginalCell = first.Cell;

    /* ---------- HEADER ---------- */
    first.Header = (headerProps: ReactTable.HeaderProps<D>) => {
      const toggleAll = headerProps.getToggleAllPageRowsSelectedProps?.();

      return (
        <>
          {toggleAll && (
            <Checkbox
              aria-label="Select all rows"
              checked={toggleAll.checked}
              // Prevent the click event from triggering a click on the parent table header/cell
              onClick={event => {
                event.stopPropagation();
              }}
              onChange={toggleAll.onChange}
              className={cl['bk-data-table-row-select__checkbox']}
            />
          )}
          {renderElement(OriginalHeader, headerProps)}
        </>
      );
    };

    /* ---------- CELL ---------- */
    first.Cell = (props: ReactTable.CellProps<D>) => {
      const { row } = props;

      const { checked, onChange } = row.getToggleRowSelectedProps();

      return (
        <>
          <Checkbox
            aria-label="Select row"
            checked={checked}
            // Prevent the click event from triggering a click on the parent table header/cell
            onClick={event => {
              event.stopPropagation();
            }}
            onChange={onChange}
            className={cl['bk-data-table-row-select__checkbox']}
          />
          {renderElement(OriginalCell, props, props.value)}
        </>
      );
    };

    return columns;
  });
};

export const useRowSelectColumnRadio = <D extends object>(hooks: ReactTable.Hooks<D>): void => {
  hooks.useInstance.push(instance => {
    if (!instance.isRowSelectDisabled) return;

    instance.rows.forEach((row: ReactTable.Row<D>) => {
      row.rowSelectDisabled = instance.isRowSelectDisabled?.(row) ?? false;
    });
  });

  hooks.visibleColumns.push(columns => {
    const first = columns[0] as ColumnWithSelector<D> | undefined;

    if (!first || first.__rowSelectorInjected) return columns;
    console.log("columns updated");
    first.__rowSelectorInjected = true;

    const OriginalCell = first.Cell;
    
    /* ---------- CELL ---------- */
    first.Cell = (props: ReactTable.CellProps<D>) => {
      const { row, rows } = props;

      // selection helpers
      const { checked } = row.getToggleRowSelectedProps();

      const isDisabled = row.rowSelectDisabled ?? false;

      const handleRadioChange = () => {
        // Clear other selections (radio semantics)
        rows.forEach(r => {
          if (r.isSelected && r.id !== row.id) {
            r.toggleRowSelected(false);
          }
        });

        // Select this row
        row.toggleRowSelected(true);
      };

      return (
        <>
          <Radio
            aria-label="Select row"
            checked={checked}
            onChange={handleRadioChange}
            disabled={isDisabled}
            className={cl['bk-data-table-row-select__radio']}
          />
          {renderElement(OriginalCell, props, props.value)}
        </>
      );
    };

    return columns;
  });
};

export const useRowSelectColumnRadioColumnRefernce = <D extends object>(
  hooks: ReactTable.Hooks<D>
): void => {
  let lastInjectedFrom: ReactTable.ColumnInstance<D>[] | null = null;

  hooks.useInstance.push(instance => {
    if (!instance.isRowSelectDisabled) return;

    instance.rows.forEach(row => {
      row.rowSelectDisabled = instance.isRowSelectDisabled?.(row) ?? false;
    });
  });

  hooks.visibleColumns.push(columns => {
    if (lastInjectedFrom === columns) {
      return columns;
    }

    lastInjectedFrom = columns;

    const first = columns[0];
    if (!first) return columns;
    
    console.log("columns updated");
    
    const OriginalCell = first.Cell;

    return [
      {
        ...first,
        Cell: (props: ReactTable.CellProps<D>) => {
          const { row, rows } = props;
          const { checked } = row.getToggleRowSelectedProps();
          const isDisabled = row.rowSelectDisabled ?? false;

          const handleRadioChange = () => {
            rows.forEach(r => {
              if (r.isSelected && r.id !== row.id) {
                r.toggleRowSelected(false);
              }
            });
            row.toggleRowSelected(true);
          };

          return (
            <>
              <Radio
                aria-label="Select row"
                checked={checked}
                onChange={handleRadioChange}
                disabled={isDisabled}
                className={cl['bk-data-table-row-select__radio']}
              />
              {renderElement(OriginalCell, props, props.value)}
            </>
          );
        },
      },
      ...columns.slice(1),
    ];
  });
};

export const useRowSelectColumnRadioDeprecated = <D extends object>(hooks: ReactTable.Hooks<D>): void => {
  hooks.visibleColumns.push(columns =>
    columns.map((col: ReactTable.ColumnInstance<D>, columnIndex: number) => {
      if (columnIndex === 0) {
        console.log("columns updated");
        return {
          ...col,
          Header: (headerProps: ReactTable.HeaderProps<D>) => {
            const headerContent =
              typeof col.Header === 'function'
                ? (col.Header as (props: ReactTable.HeaderProps<D>) => React.ReactNode)(headerProps)
                : col.Header;

            return (
              <>
                <Radio
                  className={cl['bk-data-table-row-select__radio']}
                />
                {headerContent}
              </>
            );
          },
          Cell: (cellProps: ReactTable.CellProps<D>) => {
            const { checked, onChange } = cellProps.row.getToggleRowSelectedProps();

            const handleRadioChange = () => {
              // deselect all other rows first (mimic radio button behavior)
              cellProps.rows.forEach(row => { row.toggleRowSelected(false); });
              // then select this row
              onChange?.({ target: { checked: true } } as any);
            };

            const cellContent = col.Cell
              ? (col.Cell as (props: ReactTable.CellProps<D>) => React.ReactNode)(cellProps)
              : cellProps.value;

            return (
              <>
                <Radio
                  aria-label="Select row"
                  checked={checked}
                  onChange={handleRadioChange}
                  className={cl['bk-data-table-row-select__radio']}
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
