/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import cx from 'classnames';
import * as React from 'react';
import { joinElements } from '../../../../util/component_util';

import { SpriteIcon as Icon } from '../../../icons/Icon';

import { PageSizeOption, PaginationSizeSelector } from './PaginationSizeSelector';
import { useTable } from '../DataTableContext';

import './Pagination.scss';


type PageOptionsSegment = Array<number>; // Consecutive list of page indices (e.g. `[5, 6, 7]`)
type PageOptions = Array<PageOptionsSegment>; // List of segments (e.g. `[[1], [49, 50, 51], [100]]`)
const combineSegments = (segment1: PageOptionsSegment, segment2: PageOptionsSegment): PageOptions => {
  if (segment1.length === 0 || segment2.length === 0) { return [[...segment1, ...segment2]]; }
  
  const gapLeft = segment1.slice(-1)[0]; // Element to the left side of the gap (i.e. the last element of `segment1`)
  const gapRight = segment2[0]; // Element to the right of the gap (i.e. the first element of `segment2`)
  const gapSize = gapRight - gapLeft - 1; // Calculate the gap (if 0, then the segments are consecutive, e.g. 3 to 4)
  
  if (gapSize > 1) {
    // If there is a gap between the segments larger than one, leave unmerged
    return [segment1, segment2];
  } else if (gapSize === 1) {
    // If the gap is 1 (i.e. there is only one element "missing" in between), fill it in and merge
    // Motivation: there will be a separator between gaps (e.g. `4 5 ... 7 8`), so if there is only element in between,
    // then it makes sense to replace the separator with the missing element explicitly.
    return [[...segment1, gapLeft + 1, ...segment2]];
  } else {
    // If there is no gap, combine the two segments (removing any overlapping elements)
    return [[...segment1, ...segment2.filter((pageIndex: number) => pageIndex > gapLeft)]];
  }
};
const getPageOptions = ({ pageCount, pageIndex }: { pageCount: number, pageIndex: number }): PageOptions => {
  const pageIndexFirst = 0;
  const pageIndexLast = pageCount - 1;
  
  // Basic template for page options
  const template = [
    [pageIndexFirst, pageIndexFirst + 1], // First two pages
    [pageIndex - 1, pageIndex, pageIndex + 1], // Current page, plus immediate predecessor and successor
    [pageIndexLast - 1, pageIndexLast], // Last two pages
  ];
  
  return template.reduce<PageOptions>(
    (pageOptions: PageOptions, segmentTemplate: PageOptionsSegment): PageOptions => {
      // Filter out any invalid page indices from the template
      const segment: PageOptionsSegment = segmentTemplate.filter((pageIndex: number) => {
        return pageIndex >= pageIndexFirst && pageIndex <= pageIndexLast;
      });
      
      if (pageOptions.length === 0) { return [segment]; }
      
      // Split `pageOptions` into its last segment, and everything before: `[...pageOptionsBase, segmentPrior]`
      const pageOptionsBase: PageOptions = pageOptions.slice(0, -1);
      const segmentPrior: PageOptionsSegment = pageOptions.slice(-1)[0];
      
      // Attempt to combine `segmentPrior` and `segment` into one consecutive segment (if there's no gap in between)
      return [...pageOptionsBase, ...combineSegments(segmentPrior, segment)];
    },
    [],
  );
};

type PaginationProps = {
  pageSizeOptions?: Array<PageSizeOption>,
};
export const Pagination = ({ pageSizeOptions }: PaginationProps) => {
  const { table } = useTable();
  
  /*
    Available pagination state:
    - table.state.pageIndex
    - table.state.pageSize
    - table.canPreviousPage
    - table.canPreviousPage
    - table.canNextPage
    - table.pageOptions
    - table.pageCount
    - table.gotoPage
    - table.nextPage
    - table.previousPage
    - table.setPageSize
  */
  
  const pageCount = Math.max(table.pageCount, 1); // Note: for an empty table `react-table` will return pageCount = 0
  const pageIndex = table.state.pageIndex;
  const pageOptions: PageOptions = getPageOptions({ pageCount, pageIndex });
  
  return (
    <div className="pagination">
      <PaginationSizeSelector pageSizeOptions={pageSizeOptions}/>
      
      <div className="pager pager--indexed">
        <Icon name="chevron-left" icon={import(`../../../../assets/icons/chevron-left.svg?sprite`)}
          className={cx('pager__nav pager__nav--prev', { 'disabled': !table.canPreviousPage })}
          onClick={table.previousPage}
        />
        
        <ul className="pager__indices">
          {joinElements( // Join the segments together with separator <li/> elements inserted in between
            <li className="pager__indices__separator">⋯</li>,
            pageOptions
              .map((pageOptionsSegment: PageOptionsSegment) =>
                <>
                  {pageOptionsSegment.map((pageIndex: number) =>
                    <li key={pageIndex}
                      className={cx({ 'active': pageIndex === table.state.pageIndex })}
                      onClick={() => { table.gotoPage(pageIndex); }}
                    >
                      {pageIndex + 1}
                    </li>,
                  )}
                </>,
              ),
          )}
        </ul>
        
        <Icon name="chevron-right" icon={import(`../../../../assets/icons/chevron-right.svg?sprite`)}
          className={cx('pager__nav pager__nav--next', { 'disabled': !table.canNextPage })}
          onClick={table.nextPage}
        />
      </div>
    </div>
  );
};
