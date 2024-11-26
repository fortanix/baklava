/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import cx from 'classnames';
import * as React from 'react';

import { SpriteIcon as Icon } from '../../../icons/Icon';
import { Button } from '../../../buttons/Button';
import { Dropdown } from '../../../overlays/dropdown/Dropdown';

import { useTable } from '../DataTableContext';

import './PaginationSizeSelector.scss';


export type PageSizeOption = number;
export const defaultPageSizeOptions: Array<PageSizeOption> = [10, 25, 50, 100];

type PaginationSizeSelectorProps = {
  pageSizeOptions?: Array<PageSizeOption>,
  pageSizeLabel?: string;
};
export const PaginationSizeSelector = (props: PaginationSizeSelectorProps) => {
  const { pageSizeOptions = defaultPageSizeOptions, pageSizeLabel = 'Items per page' } = props;
  
  const { table } = useTable();
  
  return (
    <div className="page-size-selector">
      {pageSizeLabel}:
      
      <Dropdown primary placement="bottom"
        className="page-size-selector__selector"
        toggle={
          <Button plain className="page-size-selector__page-size">
            {table.state.pageSize}
            <Icon name="arrow-drop-down" icon={import(`../../../../assets/icons/arrow-drop-down.svg?sprite`)}
              className="icon-caret"
            />
          </Button>
        }
      >
        {({ close }) =>
          pageSizeOptions.map(pageSize =>
            <Dropdown.Item key={pageSize}
              onClick={() => { table.setPageSize(pageSize); close(); }}
            >
              {pageSize}
            </Dropdown.Item>,
          )
        }
      </Dropdown>
    </div>
  );
};
