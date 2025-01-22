/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx } from '../../../../util/componentUtil.ts';
import type * as React from 'react';

import { Icon } from '../../../graphics/Icon/Icon.tsx';
import { Button } from '../../../actions/Button/Button.tsx';

import { type PageSizeOption, PaginationSizeSelector } from './PaginationSizeSelector.tsx';
import { useTable } from '../DataTableContext.tsx';

import cl from './PaginationStream.module.scss';


type PaginationStreamPagerProps = {
  pageSizeOptions?: PageSizeOption,
};
export const PaginationStreamPager = ({ pageSizeOptions }: PaginationStreamPagerProps) => {
  const { table } = useTable();
  
  return (
    <div className={cx(cl['pagination__pager'])}>
      <Button unstyled
        aria-label="First page"
        className={cx(cl['pager__nav'], cl['pager__nav--first'])}
        nonactive={!table.canPreviousPage}
        onPress={() => { table.gotoPage(0); }}
      >
        <Icon icon="page-backward"/>
      </Button>
      
      <Button trimmed
        variant="tertiary"
        className={cx(cl['pager__nav'], cl['pager__nav--prev'])}
        onPress={() => { table.previousPage(); }}
        nonactive={!table.canPreviousPage}
      >
        <Icon icon="caret-left"/>
        Previous
      </Button>
      
      <Button trimmed
        variant="tertiary"
        className={cx(cl['pager__nav'], cl['pager__nav--next'])}
        onPress={() => { table.nextPage(); }}
        nonactive={!table.canNextPage}
      >
        Next
        <Icon icon="caret-right"/>
      </Button>
    </div>
  );
};

type PaginationStreamProps = {
  pageSizeOptions?: Array<PageSizeOption>,
  pageSizeLabel?: string,
  renderLoadMoreResults?: () => React.ReactNode,
};
export const PaginationStream = ({ renderLoadMoreResults, pageSizeOptions, pageSizeLabel }: PaginationStreamProps) => {
  return (
    <div className={cx(cl['bk-pagination'], cl['bk-pagination--stream'])}>
      {renderLoadMoreResults && (
        <div className={cx(cl['pagination__load-more-action'])}>{renderLoadMoreResults?.()}</div>
      )}
      <PaginationSizeSelector pageSizeOptions={pageSizeOptions} pageSizeLabel={pageSizeLabel}/>
      <PaginationStreamPager/>
    </div>
  );
};
