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


const parsePageNumber = (pageBuffer: string, max: number): null | number => {
  if (pageBuffer.trim() === '') { return null; }
  const num = Math.floor(Number(pageBuffer));
  if (!Number.isFinite(num)) { return null; }
  if (!Number.isSafeInteger(num)) { return null; }
  return Math.min(max, Math.max(1, num));
};

type PaginationProps = {
  pageSizeOptions?: Array<PageSizeOption>,
};
export const Pagination = ({ pageSizeOptions }: PaginationProps) => {
  const { table } = useTable();
  const [pageBuffer, setPageBuffer] = React.useState<string>('1');
  const pageNumber = parsePageNumber(pageBuffer, table.pageCount) ?? (table.state.pageIndex + 1);
  
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
  
  // Sync the table state with the buffer
  React.useEffect(() => {
    setPageBuffer(String(table.state.pageIndex + 1));
  }, [table.state.pageIndex]);
  
  const updatePage = React.useCallback(() => {
    setPageBuffer(String(pageNumber));
    table.gotoPage(pageNumber - 1);
  }, [pageNumber, table.gotoPage]);
  
  return (
    <div className={cx(cl['bk-pagination'])}>
      <PaginationSizeSelector pageSizeOptions={pageSizeOptions}/>
      
      <div className={cx(cl['pager'], cl['pager--indexed'])}>
        <IconButton
          className={cx(cl['pager__nav'])}
          icon="page-backward"
          label="Go to first page"
          nonactive={!table.canPreviousPage}
          onPress={() => { table.gotoPage(0); }}
        />
        <div className={cx(cl['pagination-main'])}>
          <IconButton
            className={cx(cl['pager__nav'])}
            icon="caret-left"
            label="Go to previous page"
            nonactive={!table.canPreviousPage}
            onPress={() => { table.previousPage(); }}
          />
          
          <span className="visually-hidden">Current page:</span>
          <Input
            unstyled
            type="number"
            automaticResize
            className={cx(cl['pagination__page-input'])}
            inputProps={{ className: cx(cl['pagination__page-input__input']) }}
            value={pageBuffer}
            onChange={(event) => { setPageBuffer(event.target.value); }}
            onBlur={() => { updatePage(); }}
            max={table.pageCount}
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
            onPress={() => { table.nextPage(); }}
          />
        </div>
        <IconButton
          className={cx(cl['pager__nav'])}
          icon="page-forward"
          nonactive={!table.canNextPage}
          label="Go to last page"
          onPress={() => { table.gotoPage(table.pageCount - 1); }}
        />
      </div>
    </div>
  );
};
