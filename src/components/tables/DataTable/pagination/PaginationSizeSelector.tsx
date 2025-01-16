/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type React from 'react';

import { Icon } from '../../../graphics/Icon/Icon.tsx';
import { Button } from '../../../actions/Button/Button.tsx';
import { DropdownMenuProvider } from '../../../overlays/DropdownMenu/DropdownMenuProvider.tsx';

import { useTable } from '../DataTableContext.tsx';

import './PaginationSizeSelector.scss';


export type PageSizeOption = number;
export const defaultPageSizeOptions: Array<PageSizeOption> = [10, 25, 50, 100];

type PaginationSizeSelectorProps = {
  pageSizeOptions?: Array<PageSizeOption> | undefined,
  pageSizeLabel?: string | undefined,
};
export const PaginationSizeSelector = (props: PaginationSizeSelectorProps) => {
  const { pageSizeOptions = defaultPageSizeOptions, pageSizeLabel = 'Rows per page' } = props;

  const { table } = useTable();

  return (
    <div className="bk-page-size-selector">
      {pageSizeLabel}:

      <DropdownMenuProvider
        className="page-size-selector__dropdown"
        items={pageSizeOptions.map((pageSize) => (
          <DropdownMenuProvider.Action
            key={pageSize.toString()}
            itemKey={pageSize.toString()}
            label={`${pageSize}`}
            onActivate={(context) => {
              table.setPageSize(pageSize);
              context.close();
            }}
          />
        ))}
      >
        {({ props }) => (
          <Button
            variant="tertiary"
            {...props()}
            className="page-size-selector__button"
          >
            {table.state.pageSize}
            <Icon name="arrow-drop-down" icon="caret-down"
              className="icon-caret"
            />
          </Button>
        )}
      </DropdownMenuProvider>
    </div>
  );
};