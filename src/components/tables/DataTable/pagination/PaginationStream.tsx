
import cx from 'classnames';
import * as React from 'react';

import { SpriteIcon as Icon } from '../../../icons/Icon';
import { Button } from '../../../buttons/Button';

import { PageSizeOption, PaginationSizeSelector } from './PaginationSizeSelector';
import { useTable } from '../DataTableContext';

import './PaginationStream.scss';


type IconDoubleChevronLeftProps = React.ComponentPropsWithoutRef<'span'> & {
  iconProps?: Partial<React.ComponentPropsWithRef<typeof Icon>>,
};
const IconDoubleChevronLeft = ({ iconProps = {}, ...props }: IconDoubleChevronLeftProps) => {
  return (
    <span className="icon-double-chevron-left" {...props}>
      <Icon name="chevron-left" icon={import(`../../../../assets/icons/chevron-left.svg?sprite`)} className="icon"
        {...iconProps}
      />
      <Icon name="chevron-left" icon={import(`../../../../assets/icons/chevron-left.svg?sprite`)} className="icon"
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
      <Button light
        className={cx('pager__nav pager__nav--first', { 'disabled': !table.canPreviousPage })}
        onClick={() => { table.gotoPage(0); }}
      >
        <IconDoubleChevronLeft/>
      </Button>
      
      <Button light
        className={cx('pager__nav pager__nav--prev', { 'disabled': !table.canPreviousPage })}
        onClick={() => { table.previousPage(); }}
      >
        <Icon name="chevron-left" icon={import(`../../../../assets/icons/chevron-left.svg?sprite`)} className="icon"/>
        Previous
      </Button>
      
      <Button primary
        className={cx('pager__nav pager__nav--next', { 'disabled': !table.canNextPage })}
        onClick={() => { table.nextPage(); }}
      >
        Next
        <Icon name="chevron-right" icon={import(`../../../../assets/icons/chevron-right.svg?sprite`)} className="icon"/>
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
