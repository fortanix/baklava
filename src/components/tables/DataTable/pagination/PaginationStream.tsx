/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import cx from 'classnames';
import type * as React from 'react';

import { Icon } from '../../../graphics/Icon/Icon.tsx';
import { Button } from '../../../actions/Button/Button.tsx';

import { type PageSizeOption, PaginationSizeSelector } from './PaginationSizeSelector.tsx';
import { useTable } from '../DataTableContext.tsx';

import './PaginationStream.scss';


type IconDoubleChevronLeftProps = React.ComponentPropsWithoutRef<'span'> & {
  iconProps?: Partial<React.ComponentPropsWithRef<typeof Icon>>,
};
const IconDoubleChevronLeft = ({ iconProps = {}, ...props }: IconDoubleChevronLeftProps) => {
  return (
    <span className="icon-double-chevron-left" {...props}>
      <Icon name="chevron-left" icon="page-backward" className="icon"
        {...iconProps}
      />
    </span>
  );
};

type PaginationStreamPagerProps = {
  pageSizeOptions?: PageSizeOption,
};
export const PaginationStreamPager = ({ pageSizeOptions }: PaginationStreamPagerProps) => {
  const { table } = useTable();
  
  return (
    <div className="pagination__pager">
      <Button
        className={cx('pager__nav pager__nav--first', { 'disabled': !table.canPreviousPage })}
        onClick={() => { table.gotoPage(0); }}
        disabled={!table.canPreviousPage}
      >
        <IconDoubleChevronLeft/>
      </Button>
      
      <Button
        variant="tertiary"
        className={cx('pager__nav pager__nav--prev', { 'disabled': !table.canPreviousPage })}
        onClick={() => { table.previousPage(); }}
        disabled={!table.canPreviousPage}
      >
        <Icon name="chevron-left" icon={"caret-left"} className="icon"/>
        Previous
      </Button>
      
      <Button 
        variant="tertiary"
        className={cx('pager__nav pager__nav--next', { 'disabled': !table.canNextPage })}
        onClick={() => { table.nextPage(); }}
        disabled={!table.canNextPage}
      >
        Next
        <Icon name="chevron-right" icon="caret-right" className="icon"/>
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
    <div className="pagination pagination--stream">
      {renderLoadMoreResults && (
        <div className="pagination__load-more-action">{renderLoadMoreResults?.()}</div>
      )}
      <PaginationSizeSelector pageSizeOptions={pageSizeOptions} pageSizeLabel={pageSizeLabel}/>
      <PaginationStreamPager/>
    </div>
  );
};
