/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx } from '../../../../util/componentUtil.ts';

import { Input } from '../../../forms/controls/Input/Input.tsx';
import { IconButton } from '../../../actions/IconButton/IconButton.tsx';

import {
  type PageSizeOption,
  PaginationSizeSelector,
} from './PaginationSizeSelector.tsx';
import { useTable } from '../DataTableContext.tsx';

import cl from './Pagination.module.scss';


type PaginationProps = {
  pageSizeOptions?: Array<PageSizeOption>,
};
export const Pagination = ({ pageSizeOptions }: PaginationProps) => {
  const { table } = useTable();
  const [pageIndexIndicator, setPageIndexIndicator] = React.useState<number>(1);
  /*
  Available pagination state:
  - table.state.pageIndex
  - table.state.pageSize
  - table.canPreviousPage
  - table.canNextPage
  - table.pageOptions
  - table.pageCount
  - table.gotoPage
  - table.nextPage
  - table.previousPage
  - table.setPageSize
  */
  
  const updatePage = React.useCallback(() => {
    const requestedIndex = Number.isSafeInteger(pageIndexIndicator) ? pageIndexIndicator - 1 : 0;
    const targetIndex: number = Math.max(0, Math.min(table.pageCount - 1, requestedIndex));
    
    table.gotoPage(targetIndex);
    setPageIndexIndicator(targetIndex + 1);
  }, [pageIndexIndicator, table.pageCount, table.gotoPage]);
  
  return (
    <div className={cx(cl['bk-pagination'])}>
      <PaginationSizeSelector pageSizeOptions={pageSizeOptions} />
      
      <div className={cx(cl['pager'], cl['pager--indexed'])}>
        <IconButton
          className={cx(cl['pager__nav'])}
          icon="page-backward"
          label="Go to first page"
          nonactive={!table.canPreviousPage}
          onPress={() => {
            table.gotoPage(0)
            setPageIndexIndicator(1);
          }}
        />
        <div className={cx(cl['pagination-main'])}>
          <IconButton
            className={cx(cl['pager__nav'])}
            icon="caret-left"
            label="Go to previous page"
            nonactive={!table.canPreviousPage}
            onPress={() => {
              table.previousPage();
              setPageIndexIndicator(pageIndexIndicator - 1);
            }}
          />
          
          <span className="visually-hidden">Current page:</span>
          <Input
            type="number"
            automaticResize
            className={cx(cl['pagination__page-input'])}
            inputProps={{ className: cx(cl['pagination__page-input__input']) }}
            value={pageIndexIndicator}
            max={table.pageCount}
            onChange={(event) => { setPageIndexIndicator(Number.parseInt(event.target.value, 10)); }}
            onBlur={() => { updatePage(); }}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                updatePage();
              }
            }}
          />
          of {Math.max(table.pageCount, 1)}
          <IconButton
            className={cx(cl['pager__nav'])}
            icon="caret-right"
            label="Go to next page"
            nonactive={!table.canNextPage}
            onPress={() => {
              table.nextPage();
              setPageIndexIndicator(pageIndexIndicator + 1);
            }}
          />
        </div>
        <IconButton
          className={cx(cl['pager__nav'])}
          icon="page-forward"
          nonactive={!table.canNextPage}
          label="Go to last page"
          onPress={() => {
            table.gotoPage(table.pageCount - 1)
            setPageIndexIndicator(table.pageCount);
          }}
        />
      </div>
    </div>
  );
};
