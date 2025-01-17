/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx } from '../../../../util/componentUtil.ts';

import { Icon } from '../../../graphics/Icon/Icon.tsx';
import { Input } from '../../../forms/controls/Input/Input.tsx';
import { Button } from '../../../actions/Button/Button.tsx';

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

  return (
    <div className={cx(cl['bk-pagination'])}>
      <PaginationSizeSelector pageSizeOptions={pageSizeOptions} />

      <div className={cx(cl['pager'], cl['pager--indexed'])}>
        <Button
          unstyled
          nonactive={!table.canPreviousPage}
          className={cx(cl['pager__nav'])}
          onPress={() => {
            table.gotoPage(0)
            setPageIndexIndicator(1);
          }}
        >
          <Icon icon="page-backward"/>
        </Button>
        <div className={cx(cl['pagination-main'])}>
          <Button
            unstyled
            nonactive={!table.canPreviousPage}
            className={cx(cl['pager__nav'])}
            onPress={() => {
              table.previousPage();
              setPageIndexIndicator(pageIndexIndicator - 1);
            }}
          >
            <Icon icon="caret-left"/>
          </Button>

          <Input
            type="number"
            className={cx(cl['pagination__page-input'])}
            value={pageIndexIndicator}
            max={table.pageCount}
            onChange={(event) => setPageIndexIndicator(Number.parseInt(event.target.value))}
            onBlur={() => {
              if(pageIndexIndicator > 0 && pageIndexIndicator <= table.pageCount){
                table.gotoPage(pageIndexIndicator - 1);
              } else {
                table.gotoPage(table.state.pageIndex);
                setPageIndexIndicator(table.state.pageIndex + 1);
              }
            }}
          />
          of {Math.max(table.pageCount, 1)}
          <Button
            unstyled
            nonactive={!table.canNextPage}
            className={cx(cl['pager__nav'])}
            onPress={() => {
              table.nextPage();
              setPageIndexIndicator(pageIndexIndicator + 1);
            }}
          >
            <Icon icon="caret-right"/>
          </Button>
        </div>
        <Button
          unstyled
          nonactive={!table.canNextPage}
          className={cx(cl['pager__nav'])}
          onPress={() => {
            table.gotoPage(table.pageCount - 1)
            setPageIndexIndicator(table.pageCount);
          }}
        >
          <Icon icon="page-forward"/>
        </Button>
      </div>
    </div>
  );
};
